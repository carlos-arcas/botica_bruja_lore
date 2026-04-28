import type { PedidoCreado, RetornoPago } from "../../infraestructura/api/pedidos";

export type TextoEstadoPedido = {
  titulo: string;
  descripcion: string;
};

export function resolverResumenRetornoPedidoReal(
  pedido: PedidoCreado | null,
  retornoPago: RetornoPago,
): TextoEstadoPedido {
  if (!pedido) return { titulo: "Cargando estado del pedido.", descripcion: "" };
  if (retornoPago === "cancel") {
    return {
      titulo: "Pago cancelado o no completado.",
      descripcion: "Puedes reintentar el pago cuando quieras.",
    };
  }
  if (retornoPago === "success" && pedido.estado !== "pagado") {
    return {
      titulo: "Pago confirmado en entorno local.",
      descripcion: "Estamos actualizando el estado operativo del pedido.",
    };
  }
  if (pedido.estado === "pagado") {
    return {
      titulo: "Pago confirmado.",
      descripcion: "Tu pedido quedo registrado y listo para preparacion.",
    };
  }
  return {
    titulo: "Pedido pendiente de pago.",
    descripcion: "Todavia no se ha confirmado el pago. Puedes iniciarlo o reintentarlo.",
  };
}

export function resolverMensajeEstadoPedidoReal(pedido: PedidoCreado): TextoEstadoPedido {
  if (pedido.estado === "pagado" && pedido.requiere_revision_manual) {
    return {
      titulo: "pagado, pendiente de preparacion",
      descripcion: "Ya recibimos el pago y el equipo preparara el pedido tras la revision operativa.",
    };
  }
  if (pedido.estado === "preparando") {
    return {
      titulo: "preparando",
      descripcion: `Estamos reuniendo y embalando tu pedido desde ${pedido.expedicion.fecha_preparacion ?? "hoy"}.`,
    };
  }
  if (pedido.estado === "enviado") {
    return {
      titulo: "enviado",
      descripcion: `Tu pedido esta en transito con ${pedido.expedicion.transportista || "el transportista asignado"}.`,
    };
  }
  if (pedido.estado === "entregado") {
    return {
      titulo: "entregado",
      descripcion: "Hemos registrado la entrega para cerrar el ciclo operativo.",
    };
  }
  return {
    titulo: pedido.estado,
    descripcion: "El pedido todavia no ha entrado en preparacion.",
  };
}

export function etiquetaProveedorPago(proveedor?: string, simulado = false): string {
  if (simulado) return "Pago de prueba en entorno local";
  return proveedor?.trim() || "Pendiente de iniciar";
}

export function textoBotonPago(estadoPago: string, simulado = false): string {
  if (simulado) return "Reintentar pago de prueba";
  return estadoPago === "fallido" || estadoPago === "cancelado"
    ? "Reintentar pago"
    : "Pagar ahora";
}

export function pedidoTieneCuentaCliente(pedido: PedidoCreado): boolean {
  return Boolean(pedido.cliente.id_usuario && !pedido.cliente.es_invitado);
}

export function formatearFechaPedido(fecha?: string): string {
  if (!fecha) return "No informada";
  const fechaPedido = new Date(fecha);
  if (Number.isNaN(fechaPedido.getTime())) return fecha;
  return fechaPedido.toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
