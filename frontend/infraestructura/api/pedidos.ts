import { PayloadPedido } from "../../contenido/catalogo/checkoutReal";

export type PedidoCreado = {
  id_pedido: string;
  estado: string;
  estado_pago: string;
  canal_checkout: string;
  moneda: string;
  subtotal: string;
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
  resumen: { cantidad_total_items: number; subtotal: string };
  lineas: Array<{
    id_producto: string;
    slug_producto: string;
    nombre_producto: string;
    cantidad: number;
    precio_unitario: string;
    moneda: string;
    subtotal: string;
  }>;
  notas_cliente: string;
  pago: {
    proveedor_pago?: string;
    id_externo_pago?: string;
    url_pago?: string;
  };
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

export async function crearPedidoPublico(payload: PayloadPedido): Promise<{ estado: "ok"; pedido: PedidoCreado } | { estado: "error"; mensaje: string }> {
  return enviarPedido(`${API_BASE_URL}/api/v1/pedidos/`, { method: "POST", body: JSON.stringify(payload) });
}

export async function obtenerPedidoPublico(idPedido: string): Promise<{ estado: "ok"; pedido: PedidoCreado } | { estado: "error"; mensaje: string }> {
  const idNormalizado = idPedido.trim();
  if (!idNormalizado) {
    return { estado: "error", mensaje: "Falta el identificador del pedido real." };
  }
  return enviarPedido(`${API_BASE_URL}/api/v1/pedidos/${encodeURIComponent(idNormalizado)}/`, { method: "GET", cache: "no-store" });
}

export async function iniciarPagoPedido(idPedido: string): Promise<{ estado: "ok"; pago: PagoPedido } | { estado: "error"; mensaje: string }> {
  const idNormalizado = idPedido.trim();
  if (!idNormalizado) {
    return { estado: "error", mensaje: "Falta el identificador del pedido real." };
  }
  return enviarPago(`${API_BASE_URL}/api/v1/pedidos/${encodeURIComponent(idNormalizado)}/iniciar-pago/`, { method: "POST" });
}

async function enviarPedido(url: string, init: RequestInit): Promise<{ estado: "ok"; pedido: PedidoCreado } | { estado: "error"; mensaje: string }> {
  const respuesta = await enviar(url, init);
  if (respuesta.estado === "error") {
    return respuesta;
  }
  return { estado: "ok", pedido: respuesta.data.pedido as PedidoCreado };
}

async function enviarPago(url: string, init: RequestInit): Promise<{ estado: "ok"; pago: PagoPedido } | { estado: "error"; mensaje: string }> {
  const respuesta = await enviar(url, init);
  if (respuesta.estado === "error") {
    return respuesta;
  }
  return { estado: "ok", pago: respuesta.data.pago as PagoPedido };
}

async function enviar(url: string, init: RequestInit): Promise<{ estado: "ok"; data: Record<string, unknown> } | { estado: "error"; mensaje: string }> {
  try {
    const respuesta = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const data = await respuesta.json();
    if (!respuesta.ok) {
      return { estado: "error", mensaje: data?.detalle ?? "No se pudo completar el checkout real." };
    }
    return { estado: "ok", data: data as Record<string, unknown> };
  } catch {
    return { estado: "error", mensaje: "No pudimos conectar con la API del checkout real." };
  }
}
