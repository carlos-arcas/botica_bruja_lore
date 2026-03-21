import {
  CANTIDAD_MAXIMA_CESTA,
  CANTIDAD_MINIMA_CESTA,
  ItemEncargoPreseleccionado,
} from "./cestaRitual";
import { PRODUCTOS_CATALOGO, ProductoCatalogo } from "./catalogo";
import {
  LineaNoConvertiblePedido,
  ResultadoLineasPedidoDemo,
} from "./checkoutDemo";

export type CanalCheckoutReal = "web_invitado" | "web_autenticado";
export type ModoCheckoutReal = "producto_unico" | "seleccion_multiple";

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

export type ResultadoLineasPedidoReal = {
  lineasConvertibles: LineaPedidoPayload[];
  lineasNoConvertibles: LineaNoConvertiblePedido[];
};

export function resolverModoCheckoutReal(
  itemsPreseleccionados: ItemEncargoPreseleccionado[],
): ModoCheckoutReal {
  return itemsPreseleccionados.length > 0
    ? "seleccion_multiple"
    : "producto_unico";
}

export function construirResultadoLineasPedidoReal(
  itemsPreseleccionados: ItemEncargoPreseleccionado[],
  productoSlug: string,
  cantidadTexto: string,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): ResultadoLineasPedidoReal {
  const modo = resolverModoCheckoutReal(itemsPreseleccionados);
  if (modo === "seleccion_multiple") {
    return itemsPreseleccionados.reduce<ResultadoLineasPedidoReal>(
      (acumulado, item) => {
        const linea = construirLineaReal(item.slug, item.cantidad, productos);
        if (linea) {
          acumulado.lineasConvertibles.push(linea);
          return acumulado;
        }

        acumulado.lineasNoConvertibles.push({
          id_linea: item.id_linea,
          nombre: item.nombre,
          cantidad: item.cantidad,
          tipo_linea: item.tipo_linea,
          motivo: resolverMotivoNoConvertibleReal(item),
        });
        return acumulado;
      },
      { lineasConvertibles: [], lineasNoConvertibles: [] },
    );
  }

  const linea = construirLineaReal(
    productoSlug,
    resolverCantidadCheckoutReal(cantidadTexto),
    productos,
  );
  return {
    lineasConvertibles: linea ? [linea] : [],
    lineasNoConvertibles: [],
  };
}

export function construirLineasPedidoReal(
  itemsPreseleccionados: ItemEncargoPreseleccionado[],
  productoSlug: string,
  cantidadTexto: string,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): LineaPedidoPayload[] {
  return construirResultadoLineasPedidoReal(
    itemsPreseleccionados,
    productoSlug,
    cantidadTexto,
    productos,
  ).lineasConvertibles;
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
  resultadoLineas: LineaPedidoPayload[] | ResultadoLineasPedidoReal,
  modo: ModoCheckoutReal = "producto_unico",
): Record<string, string> {
  const errores: Record<string, string> = {};

  for (const campo of camposObligatoriosBaseCheckoutReal()) {
    if (!datos[campo].toString().trim()) {
      errores[campo] = "Campo obligatorio.";
    }
  }

  if (modo === "producto_unico" && !datos.producto_slug.trim()) {
    errores.producto_slug = "Campo obligatorio.";
  }

  const resultadoNormalizado = normalizarResultadoLineas(resultadoLineas);
  if (resultadoNormalizado.lineasNoConvertibles.length > 0) {
    errores.lineas = construirMensajeBloqueoLineasReales(
      resultadoNormalizado.lineasNoConvertibles,
    );
  } else if (resultadoNormalizado.lineasConvertibles.length === 0) {
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

function camposObligatoriosBaseCheckoutReal(): Array<keyof DatosCheckoutReal> {
  return [
    "email_contacto",
    "nombre_contacto",
    "telefono_contacto",
    "nombre_destinatario",
    "linea_1",
    "codigo_postal",
    "ciudad",
    "provincia",
  ];
}

function normalizarResultadoLineas(
  resultadoLineas: LineaPedidoPayload[] | ResultadoLineasPedidoReal,
): ResultadoLineasPedidoReal {
  if (Array.isArray(resultadoLineas)) {
    return {
      lineasConvertibles: resultadoLineas,
      lineasNoConvertibles: [],
    };
  }

  return resultadoLineas;
}

function construirMensajeBloqueoLineasReales(
  lineas: LineaNoConvertiblePedido[],
): string {
  const resumenLineas = lineas
    .map((linea) => `${linea.cantidad} × ${linea.nombre}`)
    .join(", ");

  return `No podemos crear el pedido real porque tu selección incluye líneas fuera del contrato comprable: ${resumenLineas}. Sepáralas como consulta manual antes de continuar.`;
}

function resolverMotivoNoConvertibleReal(
  item: ItemEncargoPreseleccionado,
): string {
  if (item.tipo_linea === "fuera_catalogo") {
    return "La línea artesanal no se puede convertir en una línea pagable del pedido real.";
  }

  if (item.tipo_linea === "sugerencia_editorial") {
    return "La sugerencia editorial no tiene disponibilidad activa para pedido real.";
  }

  return "La línea visible no se puede convertir en una línea pagable del pedido real.";
}

function construirLineaReal(
  slug: string | null,
  cantidad: number,
  productos: ProductoCatalogo[],
): LineaPedidoPayload | null {
  if (!slug) {
    return null;
  }

  const producto = productos.find((item) => item.slug === slug);
  if (!producto || !producto.disponible) {
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
