import { ItemEncargoPreseleccionado } from "./cestaRitual";
import { CANTIDAD_MAXIMA_CESTA, CANTIDAD_MINIMA_CESTA } from "./cestaRitual";
import { PRODUCTOS_CATALOGO, ProductoCatalogo } from "./catalogo";
import { CuentaDemo } from "../../infraestructura/api/cuentasDemo";

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

export type ErroresCheckoutDemo = Partial<
  Record<"lineas" | "canal" | "idUsuario", string>
>;
export type EstadoIdentificacionCheckoutDemo = {
  canalActivo: CanalCheckoutDemo;
  cuentaActiva: CuentaDemo | null;
  emailPrefill: string;
};

export function construirLineasPedidoDemo(
  itemsPreseleccionados: ItemEncargoPreseleccionado[],
  productoSlug: string,
  cantidadTexto: string,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): LineaPedidoDemoPayload[] {
  if (itemsPreseleccionados.length > 0) {
    return itemsPreseleccionados
      .map((item) =>
        construirLineaDesdeProducto(item.slug, item.cantidad, productos),
      )
      .filter((linea): linea is LineaPedidoDemoPayload => linea !== null);
  }

  const cantidad = resolverCantidadCheckout(cantidadTexto);
  const linea = construirLineaDesdeProducto(productoSlug, cantidad, productos);
  return linea ? [linea] : [];
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
  lineas: LineaPedidoDemoPayload[],
): ErroresCheckoutDemo {
  const errores: ErroresCheckoutDemo = {};

  if (lineas.length === 0) {
    errores.lineas = "No hay líneas válidas para crear el pedido demo.";
  }

  if (canal !== "invitado" && canal !== "autenticado") {
    errores.canal = "Selecciona un canal de compra válido.";
  }

  if (canal === "autenticado" && !cuentaDemo?.id_usuario.trim()) {
    errores.idUsuario =
      "Necesitas una sesión activa de cuenta demo para comprar en modo autenticado.";
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

function construirLineaDesdeProducto(
  slug: string | null,
  cantidad: number,
  productos: ProductoCatalogo[],
): LineaPedidoDemoPayload | null {
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
