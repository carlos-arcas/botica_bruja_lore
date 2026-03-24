import {
  CANTIDAD_MAXIMA_CESTA,
  CANTIDAD_MINIMA_CESTA,
  ItemEncargoPreseleccionado,
} from "./cestaRitual";
import { PRODUCTOS_CATALOGO, ProductoCatalogo } from "./catalogo";
import { LineaNoConvertiblePedido } from "./checkoutDemo";

export type CanalCheckoutReal = "web_invitado" | "web_autenticado";
export type ModoCheckoutReal = "producto_unico" | "seleccion_multiple";
export type ModoDireccionCheckoutReal = "manual" | "guardada";

export type DireccionEntregaPayload = {
  nombre_destinatario: string;
  linea_1: string;
  linea_2?: string;
  codigo_postal: string;
  ciudad: string;
  provincia: string;
  pais_iso: string;
  observaciones?: string;
};

export type LineaPedidoPayload = {
  id_producto: string;
  slug_producto: string;
  nombre_producto: string;
  cantidad_comercial: number;
  unidad_comercial: "ud" | "g" | "ml";
  precio_unitario: string;
  moneda: string;
};

export type PayloadPedido = {
  email_contacto: string;
  nombre_contacto: string;
  telefono_contacto: string;
  lineas: LineaPedidoPayload[];
  canal_checkout: CanalCheckoutReal;
  direccion_entrega?: DireccionEntregaPayload;
  id_direccion_guardada?: string;
  notas_cliente?: string;
  id_usuario?: string;
  moneda: string;
};

export type DatosCheckoutReal = {
  email_contacto: string;
  nombre_contacto: string;
  telefono_contacto: string;
  producto_slug: string;
  cantidad: string;
  canal_checkout: CanalCheckoutReal;
  id_usuario: string;
  notas_cliente: string;
  modo_direccion: ModoDireccionCheckoutReal;
  id_direccion_guardada: string;
  nombre_destinatario: string;
  linea_1: string;
  linea_2: string;
  codigo_postal: string;
  ciudad: string;
  provincia: string;
  pais_iso: string;
  observaciones: string;
};

export type ResultadoLineasPedidoReal = {
  lineasConvertibles: LineaPedidoPayload[];
  lineasNoConvertibles: LineaNoConvertiblePedido[];
};

type ProductoConSemanticaComercial = {
  unidad_comercial?: "ud" | "g" | "ml";
  incremento_minimo_venta?: number;
  cantidad_minima_compra?: number;
};

export function resolverModoCheckoutReal(items: ItemEncargoPreseleccionado[]): ModoCheckoutReal {
  return items.length > 0 ? "seleccion_multiple" : "producto_unico";
}

export function construirResultadoLineasPedidoReal(
  items: ItemEncargoPreseleccionado[],
  productoSlug: string,
  cantidadTexto: string,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): ResultadoLineasPedidoReal {
  if (resolverModoCheckoutReal(items) === "seleccion_multiple") {
    return items.reduce<ResultadoLineasPedidoReal>((acumulado, item) => {
      const linea = construirLineaReal(item.slug, item.cantidad, productos);
      if (linea) acumulado.lineasConvertibles.push(linea);
      else acumulado.lineasNoConvertibles.push(construirLineaNoConvertibleReal(item));
      return acumulado;
    }, { lineasConvertibles: [], lineasNoConvertibles: [] });
  }
  const linea = construirLineaReal(productoSlug, resolverCantidadCheckoutReal(cantidadTexto), productos);
  return { lineasConvertibles: linea ? [linea] : [], lineasNoConvertibles: [] };
}

export function construirLineasPedidoReal(
  items: ItemEncargoPreseleccionado[],
  productoSlug: string,
  cantidadTexto: string,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): LineaPedidoPayload[] {
  return construirResultadoLineasPedidoReal(items, productoSlug, cantidadTexto, productos).lineasConvertibles;
}

export function construirPayloadPedidoReal(datos: DatosCheckoutReal, lineas: LineaPedidoPayload[]): PayloadPedido {
  const payload: PayloadPedido = {
    email_contacto: datos.email_contacto.trim(),
    nombre_contacto: datos.nombre_contacto.trim(),
    telefono_contacto: datos.telefono_contacto.trim(),
    lineas,
    canal_checkout: datos.canal_checkout,
    notas_cliente: datos.notas_cliente.trim(),
    moneda: "EUR",
  };
  if (datos.canal_checkout === "web_autenticado" && datos.id_usuario.trim()) payload.id_usuario = datos.id_usuario.trim();
  if (datos.modo_direccion === "guardada" && datos.id_direccion_guardada.trim()) payload.id_direccion_guardada = datos.id_direccion_guardada.trim();
  else payload.direccion_entrega = construirDireccionManual(datos);
  return payload;
}

export function validarCheckoutReal(
  datos: DatosCheckoutReal,
  resultadoLineas: LineaPedidoPayload[] | ResultadoLineasPedidoReal,
  modo: ModoCheckoutReal = "producto_unico",
  productoParaValidacion?: ProductoConSemanticaComercial | null,
): Record<string, string> {
  const errores: Record<string, string> = {};
  for (const campo of ["email_contacto", "nombre_contacto", "telefono_contacto"] as const) {
    if (!datos[campo].trim()) errores[campo] = "Campo obligatorio.";
  }
  if (modo === "producto_unico" && !datos.producto_slug.trim()) errores.producto_slug = "Campo obligatorio.";
  if (datos.canal_checkout === "web_autenticado" && !datos.id_usuario.trim()) errores.id_usuario = "La sesión autenticada requiere un id_usuario real.";
  if (datos.modo_direccion === "guardada") {
    if (!datos.id_direccion_guardada.trim()) errores.id_direccion_guardada = "Selecciona una dirección guardada.";
  } else {
    for (const campo of ["nombre_destinatario", "linea_1", "codigo_postal", "ciudad", "provincia"] as const) {
      if (!datos[campo].trim()) errores[campo] = "Campo obligatorio.";
    }
  }
  if (modo === "producto_unico") {
    const reglas = resolverReglasComercialesProducto(productoParaValidacion);
    const cantidad = resolverCantidadTextoEstricto(datos.cantidad);
    if (cantidad === null) errores.cantidad = "Introduce una cantidad entera positiva sin decimales.";
    else {
      const errorCantidad = validarCantidadComercial(cantidad, reglas);
      if (errorCantidad) errores.cantidad = errorCantidad;
    }
  }
  return { ...errores, ...validarLineasCheckoutReal(resultadoLineas) };
}

export function construirEstadoInicialCheckoutReal(productoSlug?: string): DatosCheckoutReal {
  return {
    email_contacto: "",
    nombre_contacto: "",
    telefono_contacto: "",
    producto_slug: productoSlug ?? "",
    cantidad: "1",
    canal_checkout: "web_invitado",
    id_usuario: "",
    notas_cliente: "",
    modo_direccion: "manual",
    id_direccion_guardada: "",
    nombre_destinatario: "",
    linea_1: "",
    linea_2: "",
    codigo_postal: "",
    ciudad: "",
    provincia: "",
    pais_iso: "ES",
    observaciones: "",
  };
}

function construirDireccionManual(datos: DatosCheckoutReal): DireccionEntregaPayload {
  return {
    nombre_destinatario: datos.nombre_destinatario.trim(),
    linea_1: datos.linea_1.trim(),
    linea_2: datos.linea_2.trim(),
    codigo_postal: datos.codigo_postal.trim(),
    ciudad: datos.ciudad.trim(),
    provincia: datos.provincia.trim(),
    pais_iso: datos.pais_iso.trim() || "ES",
    observaciones: datos.observaciones.trim(),
  };
}

function validarLineasCheckoutReal(resultado: LineaPedidoPayload[] | ResultadoLineasPedidoReal): Record<string, string> {
  const normalizado = Array.isArray(resultado) ? { lineasConvertibles: resultado, lineasNoConvertibles: [] } : resultado;
  if (normalizado.lineasNoConvertibles.length > 0) return { lineas: construirMensajeBloqueoLineasReales(normalizado.lineasNoConvertibles) };
  if (normalizado.lineasConvertibles.length === 0) return { lineas: "Necesitas al menos una línea válida para crear el pedido real." };
  return {};
}

function construirLineaNoConvertibleReal(item: ItemEncargoPreseleccionado): LineaNoConvertiblePedido {
  return { id_linea: item.id_linea, nombre: item.nombre, cantidad: item.cantidad, tipo_linea: item.tipo_linea, motivo: resolverMotivoNoConvertibleReal(item) };
}

function construirMensajeBloqueoLineasReales(lineas: LineaNoConvertiblePedido[]): string {
  const resumenLineas = lineas.map((linea) => `${linea.cantidad} × ${linea.nombre}`).join(", ");
  return `No podemos crear el pedido real porque tu selección incluye líneas fuera del contrato comprable: ${resumenLineas}. Sepáralas como consulta manual antes de continuar.`;
}

function resolverMotivoNoConvertibleReal(item: ItemEncargoPreseleccionado): string {
  if (item.tipo_linea === "fuera_catalogo") return "La línea artesanal no se puede convertir en una línea pagable del pedido real.";
  return "La línea seleccionada no forma parte del catálogo pagable del checkout real.";
}

function construirLineaReal(slug: string | null, cantidad: number, productos: ProductoCatalogo[]): LineaPedidoPayload | null {
  if (!slug) return null;
  const producto = productos.find((item) => item.slug === slug);
  if (!producto || !producto.id) return null;
  return {
    id_producto: producto.id,
    slug_producto: producto.slug,
    nombre_producto: producto.nombre,
    cantidad_comercial: cantidad,
    unidad_comercial: producto.unidad_comercial ?? "ud",
    precio_unitario: convertirPrecioVisibleADecimal(producto.precioVisible),
    moneda: "EUR",
  };
}

function convertirPrecioVisibleADecimal(precioVisible: string): string {
  const limpio = precioVisible.replace(/[^0-9,]/g, "").replace(",", ".");
  const numero = Number.parseFloat(limpio);
  return Number.isFinite(numero) ? numero.toFixed(2) : "0.00";
}

function resolverCantidadCheckoutReal(cantidadTexto: string): number {
  const cantidad = resolverCantidadTextoEstricto(cantidadTexto);
  if (cantidad === null) return CANTIDAD_MINIMA_CESTA;
  return Math.max(CANTIDAD_MINIMA_CESTA, Math.min(CANTIDAD_MAXIMA_CESTA, cantidad));
}

function resolverCantidadTextoEstricto(cantidadTexto: string): number | null {
  const texto = cantidadTexto.trim();
  if (!/^\d+$/.test(texto)) return null;
  const cantidad = Number.parseInt(texto, 10);
  if (Number.isNaN(cantidad)) return null;
  return cantidad;
}

function resolverReglasComercialesProducto(producto?: ProductoConSemanticaComercial | null): {
  incremento_minimo_venta: number;
  cantidad_minima_compra: number;
  unidad_comercial: "ud" | "g" | "ml";
} {
  return {
    incremento_minimo_venta: producto?.incremento_minimo_venta ?? 1,
    cantidad_minima_compra: producto?.cantidad_minima_compra ?? 1,
    unidad_comercial: producto?.unidad_comercial ?? "ud",
  };
}

function validarCantidadComercial(
  cantidad: number,
  reglas: { incremento_minimo_venta: number; cantidad_minima_compra: number; unidad_comercial: "ud" | "g" | "ml" },
): string | null {
  if (cantidad <= 0) return "La cantidad debe ser mayor que cero.";
  if (cantidad < reglas.cantidad_minima_compra) {
    return `La cantidad mínima para este producto es ${reglas.cantidad_minima_compra} ${reglas.unidad_comercial}.`;
  }
  if (cantidad % reglas.incremento_minimo_venta !== 0) {
    return `La cantidad debe avanzar en incrementos de ${reglas.incremento_minimo_venta} ${reglas.unidad_comercial}.`;
  }
  return null;
}
