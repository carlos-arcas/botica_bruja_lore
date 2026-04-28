import { ItemEncargoPreseleccionado } from "./cestaRitual";
import { CANTIDAD_MAXIMA_CESTA, CANTIDAD_MINIMA_CESTA } from "./cestaRitual";
import { PRODUCTOS_CATALOGO, ProductoCatalogo } from "./catalogo";
import { CuentaDemo } from "../../infraestructura/api/cuentasDemo";
import { TipoLineaSeleccion } from "./seleccionEncargo";

export type CanalCheckoutDemo = "invitado" | "autenticado";

export type LineaPedidoDemoPayload = {
  id_producto: string;
  slug_producto: string;
  nombre_producto: string;
  cantidad: number;
  precio_unitario_demo: string;
};

export type PayloadPedidoDemo = {
  email: string;
  canal: CanalCheckoutDemo;
  lineas: LineaPedidoDemoPayload[];
  id_usuario?: string;
};

export type LineaNoConvertiblePedido = {
  id_linea: string;
  nombre: string;
  cantidad: number;
  tipo_linea: TipoLineaSeleccion;
  motivo: string;
};

export type ResultadoLineasPedidoDemo = {
  lineasConvertibles: LineaPedidoDemoPayload[];
  lineasNoConvertibles: LineaNoConvertiblePedido[];
};

export type ErroresCheckoutDemo = Partial<
  Record<"lineas" | "canal" | "idUsuario", string>
>;
export type EstadoIdentificacionCheckoutDemo = {
  canalActivo: CanalCheckoutDemo;
  cuentaActiva: CuentaDemo | null;
  emailPrefill: string;
};

export function construirResultadoLineasPedidoDemo(
  itemsPreseleccionados: ItemEncargoPreseleccionado[],
  productoSlug: string,
  cantidadTexto: string,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): ResultadoLineasPedidoDemo {
  if (itemsPreseleccionados.length > 0) {
    return construirResultadoSeleccionMultiple(itemsPreseleccionados, productos);
  }

  const cantidad = resolverCantidadCheckout(cantidadTexto);
  const resultado = construirLineaDesdeProducto(productoSlug, cantidad, productos);

  return {
    lineasConvertibles: resultado ? [resultado] : [],
    lineasNoConvertibles: [],
  };
}

export function construirLineasPedidoDemo(
  itemsPreseleccionados: ItemEncargoPreseleccionado[],
  productoSlug: string,
  cantidadTexto: string,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): LineaPedidoDemoPayload[] {
  return construirResultadoLineasPedidoDemo(
    itemsPreseleccionados,
    productoSlug,
    cantidadTexto,
    productos,
  ).lineasConvertibles;
}

export function construirPayloadPedidoDemo(
  email: string,
  canal: CanalCheckoutDemo,
  lineas: LineaPedidoDemoPayload[],
  cuentaDemo?: CuentaDemo | null,
): PayloadPedidoDemo {
  if (canal === "autenticado" && cuentaDemo?.id_usuario.trim()) {
    return {
      email: email.trim(),
      canal,
      lineas,
      id_usuario: cuentaDemo.id_usuario.trim(),
    };
  }

  return { email: email.trim(), canal, lineas };
}

export function validarCheckoutDemo(
  canal: CanalCheckoutDemo,
  cuentaDemo: CuentaDemo | null,
  resultadoLineas: LineaPedidoDemoPayload[] | ResultadoLineasPedidoDemo,
): ErroresCheckoutDemo {
  const errores: ErroresCheckoutDemo = {};
  const resultadoNormalizado = normalizarResultadoLineas(resultadoLineas);

  if (resultadoNormalizado.lineasNoConvertibles.length > 0) {
    errores.lineas = construirMensajeBloqueoLineas(
      resultadoNormalizado.lineasNoConvertibles,
      "pedido",
    );
  } else if (resultadoNormalizado.lineasConvertibles.length === 0) {
    errores.lineas = "No hay líneas válidas para crear el pedido.";
  }

  if (canal !== "invitado" && canal !== "autenticado") {
    errores.canal = "Selecciona un canal de compra válido.";
  }

  if (canal === "autenticado" && !cuentaDemo?.id_usuario.trim()) {
    errores.idUsuario =
      "Inicia sesión o continúa como invitada para seguir.";
  }

  return errores;
}

export function resolverEstadoIdentificacionCheckoutDemo(
  cuentaDemo: CuentaDemo | null,
  continuarComoInvitado: boolean,
): EstadoIdentificacionCheckoutDemo {
  if (cuentaDemo && !continuarComoInvitado) {
    return {
      canalActivo: "autenticado",
      cuentaActiva: cuentaDemo,
      emailPrefill: cuentaDemo.email.trim(),
    };
  }

  return {
    canalActivo: "invitado",
    cuentaActiva: cuentaDemo,
    emailPrefill: "",
  };
}

export function resolverCantidadCheckout(valor: string): number {
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

function construirResultadoSeleccionMultiple(
  itemsPreseleccionados: ItemEncargoPreseleccionado[],
  productos: ProductoCatalogo[],
): ResultadoLineasPedidoDemo {
  return itemsPreseleccionados.reduce<ResultadoLineasPedidoDemo>(
    (acumulado, item) => {
      const linea = construirLineaDesdeProducto(item.slug, item.cantidad, productos);
      if (linea) {
        acumulado.lineasConvertibles.push(linea);
        return acumulado;
      }

      acumulado.lineasNoConvertibles.push({
        id_linea: item.id_linea,
        nombre: item.nombre,
        cantidad: item.cantidad,
        tipo_linea: item.tipo_linea,
        motivo: resolverMotivoNoConvertible(item),
      });
      return acumulado;
    },
    { lineasConvertibles: [], lineasNoConvertibles: [] },
  );
}

function resolverMotivoNoConvertible(
  item: ItemEncargoPreseleccionado,
): string {
  if (item.tipo_linea === "fuera_catalogo") {
    return "Esta pieza artesanal requiere consulta personalizada antes de continuar.";
  }

  if (item.tipo_linea === "sugerencia_editorial") {
    return "Esta sugerencia editorial no está disponible como producto comprable en el pedido.";
  }

  return "La línea visible no se puede convertir en una línea enviable del pedido.";
}

function normalizarResultadoLineas(
  resultadoLineas: LineaPedidoDemoPayload[] | ResultadoLineasPedidoDemo,
): ResultadoLineasPedidoDemo {
  if (Array.isArray(resultadoLineas)) {
    return {
      lineasConvertibles: resultadoLineas,
      lineasNoConvertibles: [],
    };
  }

  return resultadoLineas;
}

function construirMensajeBloqueoLineas(
  lineas: LineaNoConvertiblePedido[],
  contexto: string,
): string {
  const resumenLineas = lineas
    .map((linea) => `${linea.cantidad} × ${linea.nombre}`)
    .join(", ");

  return `No podemos enviar este ${contexto} porque tu selección incluye piezas que requieren consulta personalizada: ${resumenLineas}. Revísalas o pásalas a consulta manual antes de continuar.`;
}

function construirLineaDesdeProducto(
  slug: string | null,
  cantidad: number,
  productos: ProductoCatalogo[],
): LineaPedidoDemoPayload | null {
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
    precio_unitario_demo: convertirPrecioVisibleADecimal(
      producto.precioVisible,
    ),
  };
}

function convertirPrecioVisibleADecimal(precioVisible: string): string {
  const limpio = precioVisible.replace(/[^0-9,]/g, "").replace(",", ".");
  const numero = Number.parseFloat(limpio);

  if (!Number.isFinite(numero)) {
    return "0.00";
  }

  return numero.toFixed(2);
}
