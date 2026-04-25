import type { PedidoCreado } from "../../infraestructura/api/pedidos";

export type EstadoPostventaDemo = {
  visible: boolean;
  titulo: string;
  descripcion: string;
  accion: string;
};

const ESTADOS_ENTREGA_ELEGIBLES = new Set(["enviado", "entregado"]);

export function resolverPostventaDemoPedido(pedido: PedidoCreado): EstadoPostventaDemo {
  if (pedido.estado_cliente?.cancelado_operativamente) {
    return {
      visible: true,
      titulo: "Pedido cancelado por el equipo",
      descripcion: "Ya hay una incidencia operativa abierta. El reembolso se revisa de forma manual, sin ejecutar movimientos bancarios reales en la demo.",
      accion: "Consulta el estado de cancelacion y reembolso en esta misma pantalla.",
    };
  }
  if (ESTADOS_ENTREGA_ELEGIBLES.has(pedido.estado) && pedido.estado_pago === "pagado") {
    return {
      visible: true,
      titulo: "Devolucion manual disponible",
      descripcion: "Podemos registrar una solicitud de devolucion para revision artesanal del equipo. En demo no se ejecuta ningun reembolso bancario real.",
      accion: `Escribe a soporte indicando el pedido ${pedido.id_pedido} y el motivo de la devolucion.`,
    };
  }
  if (pedido.estado_pago !== "pagado") {
    return {
      visible: true,
      titulo: "Devolucion no disponible todavia",
      descripcion: "Primero debe completarse el pago simulado o externo. Hasta entonces no hay nada que devolver.",
      accion: "Completa o reintenta el pago si quieres continuar con la compra.",
    };
  }
  return {
    visible: true,
    titulo: "Postventa pendiente de entrega",
    descripcion: "La devolucion se revisa cuando el pedido esta enviado o entregado. Antes de ese punto, el equipo puede gestionar incidencias manuales.",
    accion: "Si detectas un problema antes del envio, contacta con soporte para que lo revise una persona.",
  };
}
