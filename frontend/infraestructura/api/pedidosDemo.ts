import { PayloadPedidoDemo } from "../../contenido/catalogo/checkoutDemo";

export type LineaPedidoDemo = {
  id_producto: string;
  slug_producto: string;
  nombre_producto: string;
  cantidad: number;
  precio_unitario_demo: string;
  subtotal_demo: string;
};

export type PedidoDemoCreado = {
  id_pedido: string;
  estado: string;
  canal: string;
  email: string;
  resumen: {
    cantidad_total_items: number;
    subtotal_demo: string;
  };
  lineas?: LineaPedidoDemo[];
};

export type ResultadoEnvioPedidoDemo =
  | { estado: "ok"; pedido: PedidoDemoCreado }
  | { estado: "error"; mensaje: string };

export type ResultadoDetallePedidoDemo =
  | { estado: "ok"; pedido: PedidoDemoCreado }
  | { estado: "error"; mensaje: string; codigo?: number };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

export async function crearPedidoDemoPublico(payload: PayloadPedidoDemo): Promise<ResultadoEnvioPedidoDemo> {
  const endpoint = `${API_BASE_URL}/api/v1/pedidos-demo/`;

  try {
    const respuesta = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!respuesta.ok) {
      const mensajeError = await leerMensajeError(respuesta);
      return { estado: "error", mensaje: mensajeError };
    }

    const data: { pedido: PedidoDemoCreado } = await respuesta.json();
    return { estado: "ok", pedido: data.pedido };
  } catch {
    return {
      estado: "error",
      mensaje: "No pudimos conectar con la API de pedidos demo. Revisa la conexión e inténtalo de nuevo.",
    };
  }
}

export async function obtenerPedidoDemoPublico(idPedido: string): Promise<ResultadoDetallePedidoDemo> {
  const idNormalizado = idPedido.trim();
  if (!idNormalizado) {
    return { estado: "error", mensaje: "Falta el identificador del pedido demo para mostrar el recibo." };
  }

  const endpoint = `${API_BASE_URL}/api/v1/pedidos-demo/${encodeURIComponent(idNormalizado)}/`;

  try {
    const respuesta = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!respuesta.ok) {
      const mensajeError = await leerMensajeError(respuesta);
      return { estado: "error", mensaje: mensajeError, codigo: respuesta.status };
    }

    const data: { pedido: PedidoDemoCreado } = await respuesta.json();
    return { estado: "ok", pedido: data.pedido };
  } catch {
    return {
      estado: "error",
      mensaje: "No pudimos cargar el recibo demo por un problema de conexión. Inténtalo de nuevo.",
    };
  }
}

async function leerMensajeError(respuesta: Response): Promise<string> {
  try {
    const data = (await respuesta.json()) as { detalle?: string };
    if (data.detalle?.trim()) {
      return data.detalle;
    }
  } catch {
    return "No se pudo crear el pedido demo por un error inesperado.";
  }

  return "No se pudo crear el pedido demo por un error inesperado.";
}
