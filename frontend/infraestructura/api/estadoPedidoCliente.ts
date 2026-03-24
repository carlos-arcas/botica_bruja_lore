type PedidoConEstadoCliente = {
  estado_cliente?: {
    cancelado_operativamente: boolean;
    estado_reembolso: "no_iniciado" | "fallido" | "ejecutado";
    fecha_reembolso: string | null;
  };
};

export type EstadoReembolsoCliente = "no_iniciado" | "fallido" | "ejecutado";

export type EstadoVisiblePedidoCliente = {
  cancelacion: {
    visible: boolean;
    titulo: string;
    descripcion: string;
  };
  reembolso: {
    estado: EstadoReembolsoCliente;
    titulo: string;
    descripcion: string;
    fechaReembolso: string | null;
  };
};

export function resolverEstadoVisiblePedidoCliente(pedido: PedidoConEstadoCliente): EstadoVisiblePedidoCliente {
  const cancelado = pedido.estado_cliente?.cancelado_operativamente ?? false;
  const estadoReembolso = normalizarEstadoReembolso(pedido.estado_cliente?.estado_reembolso);

  return {
    cancelacion: cancelado
      ? {
          visible: true,
          titulo: "Cancelación operativa aplicada",
          descripcion: "Este pedido fue cancelado tras revisión operativa.",
        }
      : {
          visible: false,
          titulo: "Sin cancelación operativa",
          descripcion: "El pedido sigue su flujo habitual.",
        },
    reembolso: construirEstadoReembolso(estadoReembolso, pedido.estado_cliente?.fecha_reembolso ?? null),
  };
}

function normalizarEstadoReembolso(estado: string | undefined): EstadoReembolsoCliente {
  if (estado === "fallido" || estado === "ejecutado") return estado;
  return "no_iniciado";
}

function construirEstadoReembolso(estado: EstadoReembolsoCliente, fechaReembolso: string | null): EstadoVisiblePedidoCliente["reembolso"] {
  if (estado === "ejecutado") {
    return {
      estado,
      titulo: "Reembolso ejecutado",
      descripcion: "El importe de este pedido ya fue reembolsado.",
      fechaReembolso,
    };
  }
  if (estado === "fallido") {
    return {
      estado,
      titulo: "Reembolso pendiente de revisión",
      descripcion: "El intento de reembolso no se completó y está en revisión manual.",
      fechaReembolso: null,
    };
  }
  return {
    estado,
    titulo: "Reembolso no iniciado",
    descripcion: "Todavía no se ha ejecutado ningún reembolso sobre este pedido.",
    fechaReembolso: null,
  };
}
