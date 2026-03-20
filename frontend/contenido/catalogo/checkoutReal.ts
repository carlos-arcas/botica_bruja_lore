import {
  CANTIDAD_MAXIMA_CESTA,
  CANTIDAD_MINIMA_CESTA,
  ItemEncargoPreseleccionado,
} from "./cestaRitual";
import { PRODUCTOS_CATALOGO, ProductoCatalogo } from "./catalogo";

export type CanalCheckoutReal = "web_invitado" | "web_autenticado";

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
  cantidad: number;
  precio_unitario: string;
  moneda: string;
};

export type PayloadPedido = {
  email_contacto: string;
  nombre_contacto: string;
  telefono_contacto: string;
  lineas: LineaPedidoPayload[];
  canal_checkout: CanalCheckoutReal;
  direccion_entrega: DireccionEntregaPayload;
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
  nombre_destinatario: string;
  linea_1: string;
  linea_2: string;
  codigo_postal: string;
  ciudad: string;
  provincia: string;
  pais_iso: string;
  observaciones: string;
};

export function construirLineasPedidoReal(
  itemsPreseleccionados: ItemEncargoPreseleccionado[],
  productoSlug: string,
  cantidadTexto: string,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): LineaPedidoPayload[] {
  if (itemsPreseleccionados.length > 0) {
    return itemsPreseleccionados
      .map((item) => construirLineaReal(item.slug, item.cantidad, productos))
      .filter((linea): linea is LineaPedidoPayload => linea !== null);
  }
  const linea = construirLineaReal(
    productoSlug,
    resolverCantidadCheckoutReal(cantidadTexto),
    productos,
  );
  return linea ? [linea] : [];
}

export function construirPayloadPedidoReal(
  datos: DatosCheckoutReal,
  lineas: LineaPedidoPayload[],
): PayloadPedido {
  const payload: PayloadPedido = {
    email_contacto: datos.email_contacto.trim(),
    nombre_contacto: datos.nombre_contacto.trim(),
    telefono_contacto: datos.telefono_contacto.trim(),
    lineas,
    canal_checkout: datos.canal_checkout,
    direccion_entrega: {
      nombre_destinatario: datos.nombre_destinatario.trim(),
      linea_1: datos.linea_1.trim(),
      linea_2: datos.linea_2.trim(),
      codigo_postal: datos.codigo_postal.trim(),
      ciudad: datos.ciudad.trim(),
      provincia: datos.provincia.trim(),
      pais_iso: datos.pais_iso.trim() || "ES",
      observaciones: datos.observaciones.trim(),
    },
    notas_cliente: datos.notas_cliente.trim(),
    moneda: "EUR",
  };
  if (datos.canal_checkout === "web_autenticado" && datos.id_usuario.trim()) {
    payload.id_usuario = datos.id_usuario.trim();
  }
  return payload;
}

export function validarCheckoutReal(
  datos: DatosCheckoutReal,
  lineas: LineaPedidoPayload[],
): Record<string, string> {
  const errores: Record<string, string> = {};
  for (const campo of [
    "email_contacto",
    "nombre_contacto",
    "telefono_contacto",
    "producto_slug",
    "nombre_destinatario",
    "linea_1",
    "codigo_postal",
    "ciudad",
    "provincia",
  ]) {
    if (!datos[campo as keyof DatosCheckoutReal].toString().trim()) {
      errores[campo] = "Campo obligatorio.";
    }
  }
  if (lineas.length === 0) {
    errores.lineas =
      "Necesitas al menos una línea válida para crear el pedido real.";
  }
  if (datos.canal_checkout === "web_autenticado" && !datos.id_usuario.trim()) {
    errores.id_usuario =
      "El modo autenticado futuro requiere un id_usuario real.";
  }
  return errores;
}

export function construirEstadoInicialCheckoutReal(
  productoSlug?: string,
): DatosCheckoutReal {
  return {
    email_contacto: "",
    nombre_contacto: "",
    telefono_contacto: "",
    producto_slug: productoSlug ?? "",
    cantidad: "1",
    canal_checkout: "web_invitado",
    id_usuario: "",
    notas_cliente: "",
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

function construirLineaReal(
  slug: string | null,
  cantidad: number,
  productos: ProductoCatalogo[],
): LineaPedidoPayload | null {
  if (!slug) {
    return null;
  }

  if (!slug) {
    return null;
  }

  const producto = productos.find((item) => item.slug === slug);
  if (!producto) {
    return null;
  }
  return {
    id_producto: producto.id,
    slug_producto: producto.slug,
    nombre_producto: producto.nombre,
    cantidad,
    precio_unitario: convertirPrecioVisibleADecimal(producto.precioVisible),
    moneda: "EUR",
  };
}

function resolverCantidadCheckoutReal(valor: string): number {
  const coincidencia = valor.match(/\d+/);
  const cantidad = coincidencia
    ? Number(coincidencia[0])
    : CANTIDAD_MINIMA_CESTA;
  if (!Number.isFinite(cantidad)) {
    return CANTIDAD_MINIMA_CESTA;
  }
  return Math.min(
    CANTIDAD_MAXIMA_CESTA,
    Math.max(CANTIDAD_MINIMA_CESTA, Math.round(cantidad)),
  );
}

function convertirPrecioVisibleADecimal(precioVisible: string): string {
  const limpio = precioVisible.replace(/[^0-9,]/g, "").replace(",", ".");
  const numero = Number.parseFloat(limpio);
  return Number.isFinite(numero) ? numero.toFixed(2) : "0.00";
}
