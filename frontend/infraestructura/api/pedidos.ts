import { PayloadPedido } from "../../contenido/catalogo/checkoutReal";

export type ExpedicionPedido = {
  transportista: string;
  codigo_seguimiento: string;
  envio_sin_seguimiento: boolean;
  fecha_preparacion: string | null;
  fecha_envio: string | null;
  fecha_entrega: string | null;
  observaciones_operativas: string;
  email_envio_enviado: boolean;
};

export type PedidoCreado = {
  id_pedido: string;
  fecha_creacion?: string;
  estado: string;
  estado_pago: string;
  canal_checkout: string;
  moneda: string;
  metodo_envio: string;
  subtotal: string;
  importe_envio: string;
  base_imponible: string;
  tipo_impositivo: string;
  importe_impuestos: string;
  total: string;
  requiere_revision_manual: boolean;
  email_post_pago_enviado: boolean;
  cliente: {
    email_contacto: string;
    nombre_contacto: string;
    telefono_contacto: string;
    id_usuario?: string;
    es_invitado: boolean;
  };
  direccion_entrega: {
    nombre_destinatario: string;
    linea_1: string;
    linea_2: string;
    codigo_postal: string;
    ciudad: string;
    provincia: string;
    pais_iso: string;
    observaciones: string;
  };
  resumen: {
    cantidad_total_items: number;
    subtotal: string;
    importe_envio: string;
    base_imponible: string;
    tipo_impositivo: string;
    importe_impuestos: string;
    total: string;
  };
  estado_cliente?: {
    cancelado_operativamente: boolean;
    estado_reembolso: "no_iniciado" | "fallido" | "ejecutado";
    fecha_reembolso: string | null;
  };
  lineas: Array<{
    id_producto: string;
    slug_producto: string;
    nombre_producto: string;
    cantidad_comercial: number;
    unidad_comercial: "ud" | "g" | "ml";
    precio_unitario: string;
    moneda: string;
    subtotal: string;
  }>;
  notas_cliente: string;
  pago: { proveedor_pago?: string; id_externo_pago?: string; url_pago?: string };
  expedicion: ExpedicionPedido;
};

export type PagoPedido = {
  id_pedido: string;
  proveedor_pago: string;
  id_externo_pago: string;
  estado_pago: string;
  moneda: string;
  importe: string;
  url_pago?: string;
};

export type LineaErrorStockPedido = {
  id_producto: string;
  slug_producto: string;
  nombre_producto: string;
  cantidad_solicitada: number;
  codigo: string;
  detalle: string;
  cantidad_disponible?: number;
};

export type TarifaEnvioEstandar = {
  metodo_envio: string;
  moneda: string;
  importe_envio: string;
};

export type ErrorPedidoApi = {
  estado: "error";
  mensaje: string;
  codigo?: string;
  lineas?: LineaErrorStockPedido[];
};

export type RetornoPago = "success" | "cancel" | null;

const API_BASE_URL = "/api/pedidos";

export async function crearPedidoPublico(payload: PayloadPedido): Promise<{ estado: "ok"; pedido: PedidoCreado } | ErrorPedidoApi> {
  return enviarPedido(API_BASE_URL, { method: "POST", body: JSON.stringify(payload) });
}

export async function obtenerPedidoPublico(idPedido: string): Promise<{ estado: "ok"; pedido: PedidoCreado } | ErrorPedidoApi> {
  const idNormalizado = idPedido.trim();
  if (!idNormalizado) return { estado: "error", mensaje: "Falta el identificador del pedido real." };
  return enviarPedido(`${API_BASE_URL}/${encodeURIComponent(idNormalizado)}`, { method: "GET", cache: "no-store" });
}

export function construirUrlDocumentoPedido(idPedido: string): string {
  const idNormalizado = idPedido.trim();
  return `/api/pedidos/${encodeURIComponent(idNormalizado)}/documento`;
}

export async function iniciarPagoPedido(idPedido: string): Promise<{ estado: "ok"; pago: PagoPedido } | ErrorPedidoApi> {
  const idNormalizado = idPedido.trim();
  if (!idNormalizado) return { estado: "error", mensaje: "Falta el identificador del pedido real." };
  return enviarPago(`${API_BASE_URL}/${encodeURIComponent(idNormalizado)}/iniciar-pago`, { method: "POST" });
}

export async function obtenerTarifaEnvioEstandar(): Promise<{ estado: "ok"; envio: TarifaEnvioEstandar } | ErrorPedidoApi> {
  const respuesta = await enviar(`${API_BASE_URL}/envio-estandar`, { method: "GET", cache: "no-store" });
  return respuesta.estado === "error" ? respuesta : { estado: "ok", envio: respuesta.data.envio_estandar as TarifaEnvioEstandar };
}

export function construirUrlRetornoPedido(idPedido: string, retorno: Exclude<RetornoPago, null>, sessionId?: string | null): string {
  const query = new URLSearchParams({ retorno_pago: retorno });
  if (sessionId) query.set("session_id", sessionId);
  return `/pedido/${encodeURIComponent(idPedido)}?${query.toString()}`;
}

async function enviarPedido(url: string, init: RequestInit): Promise<{ estado: "ok"; pedido: PedidoCreado } | ErrorPedidoApi> {
  const respuesta = await enviar(url, init);
  return respuesta.estado === "error" ? respuesta : { estado: "ok", pedido: respuesta.data.pedido as PedidoCreado };
}

async function enviarPago(url: string, init: RequestInit): Promise<{ estado: "ok"; pago: PagoPedido } | ErrorPedidoApi> {
  const respuesta = await enviar(url, init);
  return respuesta.estado === "error" ? respuesta : { estado: "ok", pago: respuesta.data.pago as PagoPedido };
}

async function enviar(url: string, init: RequestInit): Promise<{ estado: "ok"; data: Record<string, unknown> } | ErrorPedidoApi> {
  try {
    const respuesta = await fetch(url, { ...init, headers: { "Content-Type": "application/json", Accept: "application/json" } });
    const data = await respuesta.json();
    if (!respuesta.ok) {
      return {
        estado: "error",
        mensaje: data?.detalle ?? "No se pudo completar el checkout real.",
        codigo: typeof data?.codigo === "string" ? data.codigo : undefined,
        lineas: Array.isArray(data?.lineas) ? (data.lineas as LineaErrorStockPedido[]) : undefined,
      };
    }
    return { estado: "ok", data: data as Record<string, unknown> };
  } catch {
    return { estado: "error", mensaje: "No pudimos conectar con la API del checkout real." };
  }
}
