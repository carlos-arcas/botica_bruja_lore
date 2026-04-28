import { PayloadPedido } from "../../contenido/catalogo/checkoutReal";
import { emitirEventoEmbudoLocal } from "../../contenido/analitica/embudoLocal";
import { traducirMensajeErrorPedido } from "../../contenido/pedidos/estadosComercialesPedido";
import { resolverEsPagoSimuladoLocal } from "../../contenido/pedidos/pagoSimuladoLocal";

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
    tipo_impositivo: string;
    importe_impuestos: string;
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
  const resultado = await enviarPedido(API_BASE_URL, { method: "POST", body: JSON.stringify(payload) });
  if (resultado.estado === "ok") {
    emitirEventoEmbudoLocal("pedido_creado", {
      id_pedido: resultado.pedido.id_pedido,
      ruta: rutaActual(),
    });
    return resultado;
  }
  if (resultado.codigo === "stock_no_disponible") {
    emitirEventoEmbudoLocal("error_stock", { codigo_error: resultado.codigo, ruta: rutaActual() });
  }
  return resultado;
}

export async function obtenerPedidoPublico(idPedido: string): Promise<{ estado: "ok"; pedido: PedidoCreado } | ErrorPedidoApi> {
  const idNormalizado = idPedido.trim();
  if (!idNormalizado) return { estado: "error", mensaje: "Falta el identificador del pedido." };
  return enviarPedido(`${API_BASE_URL}/${encodeURIComponent(idNormalizado)}`, { method: "GET", cache: "no-store" });
}

export function construirUrlDocumentoPedido(idPedido: string): string {
  const idNormalizado = idPedido.trim();
  return `/api/pedidos/${encodeURIComponent(idNormalizado)}/documento`;
}

export async function iniciarPagoPedido(idPedido: string): Promise<{ estado: "ok"; pago: PagoPedido } | ErrorPedidoApi> {
  const idNormalizado = idPedido.trim();
  if (!idNormalizado) return { estado: "error", mensaje: "Falta el identificador del pedido." };
  const resultado = await enviarPago(`${API_BASE_URL}/${encodeURIComponent(idNormalizado)}/iniciar-pago`, { method: "POST" });
  if (resultado.estado === "ok" && resolverEsPagoSimuladoLocal(resultado.pago)) {
    emitirEventoEmbudoLocal("pago_simulado_iniciado", {
      id_pedido: resultado.pago.id_pedido,
      proveedor_pago: resultado.pago.proveedor_pago,
      ruta: rutaActual(),
    });
  }
  return resultado;
}

export async function confirmarPagoSimuladoPedido(idPedido: string): Promise<{ estado: "ok"; pedido: PedidoCreado } | ErrorPedidoApi> {
  const idNormalizado = idPedido.trim();
  if (!idNormalizado) return { estado: "error", mensaje: "Falta el identificador del pedido." };
  const resultado = await enviarPedido(`${API_BASE_URL}/${encodeURIComponent(idNormalizado)}/confirmar-pago-simulado`, { method: "POST" });
  if (resultado.estado === "ok") {
    emitirEventoEmbudoLocal("pago_simulado_confirmado", {
      id_pedido: resultado.pedido.id_pedido,
      proveedor_pago: resultado.pedido.pago.proveedor_pago,
      ruta: rutaActual(),
    });
    if (resultado.pedido.estado_pago === "pagado") {
      emitirEventoEmbudoLocal("pedido_pagado", {
        id_pedido: resultado.pedido.id_pedido,
        proveedor_pago: resultado.pedido.pago.proveedor_pago,
        ruta: rutaActual(),
      });
    }
  }
  return resultado;
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
        mensaje: traducirMensajeErrorPedido({
          codigo: typeof data?.codigo === "string" ? data.codigo : undefined,
          detalle: data?.detalle,
        }),
        codigo: typeof data?.codigo === "string" ? data.codigo : undefined,
        lineas: Array.isArray(data?.lineas) ? (data.lineas as LineaErrorStockPedido[]) : undefined,
      };
    }
    return { estado: "ok", data: data as Record<string, unknown> };
  } catch {
    return { estado: "error", mensaje: "No pudimos conectar con el servicio de pedidos. Intentalo de nuevo en unos minutos." };
  }
}

export { resolverEsPagoSimuladoLocal };

function rutaActual(): string | undefined {
  return typeof window === "undefined" ? undefined : window.location.pathname;
}
