import { PayloadPedido } from "../../contenido/catalogo/checkoutReal";

export type PedidoCreado = {
  id_pedido: string;
  estado: string;
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
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

export async function crearPedidoPublico(payload: PayloadPedido): Promise<{ estado: "ok"; pedido: PedidoCreado } | { estado: "error"; mensaje: string }> {
  return enviar(`${API_BASE_URL}/api/v1/pedidos/`, { method: "POST", body: JSON.stringify(payload) });
}

export async function obtenerPedidoPublico(idPedido: string): Promise<{ estado: "ok"; pedido: PedidoCreado } | { estado: "error"; mensaje: string }> {
  const idNormalizado = idPedido.trim();
  if (!idNormalizado) {
    return { estado: "error", mensaje: "Falta el identificador del pedido real." };
  }
  return enviar(`${API_BASE_URL}/api/v1/pedidos/${encodeURIComponent(idNormalizado)}/`, { method: "GET", cache: "no-store" });
}

async function enviar(url: string, init: RequestInit): Promise<{ estado: "ok"; pedido: PedidoCreado } | { estado: "error"; mensaje: string }> {
  try {
    const respuesta = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const data = await respuesta.json();
    if (!respuesta.ok) {
      return { estado: "error", mensaje: data?.detalle ?? "No se pudo completar el checkout real." };
    }
    return { estado: "ok", pedido: data.pedido as PedidoCreado };
  } catch {
    return { estado: "error", mensaje: "No pudimos conectar con la API del checkout real." };
  }
}
