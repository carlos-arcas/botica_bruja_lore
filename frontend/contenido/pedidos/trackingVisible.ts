export type ExpedicionVisibleCliente = {
  transportista?: string;
  codigo_seguimiento?: string;
  envio_sin_seguimiento?: boolean;
  fecha_envio?: string | null;
};

export type EstadoTrackingVisible = {
  titulo: string;
  descripcion: string;
  mostrarTracking: boolean;
};

export function resolverTrackingVisibleCliente(estadoPedido: string, expedicion: ExpedicionVisibleCliente): EstadoTrackingVisible {
  const transportista = expedicion.transportista?.trim() ?? "";
  const codigo = expedicion.codigo_seguimiento?.trim() ?? "";
  const envioSinTracking = Boolean(expedicion.envio_sin_seguimiento);

  if (estadoPedido !== "enviado" && estadoPedido !== "entregado") {
    return {
      titulo: "Tracking pendiente",
      descripcion: "El pedido todavía no ha salido en expedición.",
      mostrarTracking: false,
    };
  }

  if (codigo) {
    return {
      titulo: "Tracking disponible",
      descripcion: `${transportista || "Transportista"} · código ${codigo}`,
      mostrarTracking: true,
    };
  }

  if (envioSinTracking) {
    return {
      titulo: "Envío sin tracking público",
      descripcion: transportista
        ? `${transportista} gestiona el envío sin código de seguimiento visible para cliente.`
        : "El envío se gestiona sin código de seguimiento visible para cliente.",
      mostrarTracking: true,
    };
  }

  return {
    titulo: "Tracking no informado",
    descripcion: "Tu pedido figura como enviado, pero el tracking aún no está informado. Si persiste, contacta soporte.",
    mostrarTracking: true,
  };
}
