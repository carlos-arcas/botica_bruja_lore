export type EstadoSincronizacionConfirmacion = { estado: "omitida" | "sincronizada" } | { estado: "pendiente"; detalle: string };

export function construirMensajeConfirmacionContextual(
  mensajeBase: string,
  sincronizacion: EstadoSincronizacionConfirmacion,
): string {
  if (sincronizacion.estado !== "pendiente") return mensajeBase;
  return `${mensajeBase} El lote se confirmó, pero el listado real no pudo refrescarse todavía: ${sincronizacion.detalle}`;
}
