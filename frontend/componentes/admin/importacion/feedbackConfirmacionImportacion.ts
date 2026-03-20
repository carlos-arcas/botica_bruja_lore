import { DetalleImportacion, ResultadoConfirmacionImportacion } from "../../../infraestructura/api/backoffice";

export type ConfirmacionNormalizadaImportacion = {
  confirmadas: number;
  detalle: DetalleImportacion;
};

export type FeedbackConfirmacionImportacion = {
  detalle: DetalleImportacion;
  mensaje: string;
};

export function normalizarConfirmacionImportacion(resultado: ResultadoConfirmacionImportacion): ConfirmacionNormalizadaImportacion {
  return {
    confirmadas: Number(resultado.confirmadas),
    detalle: resultado.detalle,
  };
}

export function construirFeedbackConfirmacionImportacion(
  etiqueta: string,
  resultado: ResultadoConfirmacionImportacion,
): FeedbackConfirmacionImportacion {
  const confirmacion = normalizarConfirmacionImportacion(resultado);
  return {
    detalle: confirmacion.detalle,
    mensaje: `${etiqueta}: ${String(confirmacion.confirmadas)}.`,
  };
}

export function construirMensajeConfirmacionImportacion(
  etiqueta: string,
  resultado: ResultadoConfirmacionImportacion,
): string {
  return construirFeedbackConfirmacionImportacion(etiqueta, resultado).mensaje;
}
