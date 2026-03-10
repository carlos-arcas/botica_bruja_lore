import { PayloadPedidoDemo } from "../../contenido/catalogo/checkoutDemo";

export type PedidoDemoCreado = {
  id_pedido: string;
  estado: string;
  canal: string;
  email: string;
  resumen: {
    cantidad_total_items: number;
    subtotal_demo: string;
  };
};

export type ResultadoEnvioPedidoDemo =
  | { estado: "ok"; pedido: PedidoDemoCreado }
  | { estado: "error"; mensaje: string };

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
