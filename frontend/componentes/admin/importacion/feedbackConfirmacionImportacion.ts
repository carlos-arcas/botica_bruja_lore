import { DetalleImportacion, ResultadoConfirmacionImportacion } from "../../../infraestructura/api/backoffice";

type ConfirmacionNormalizadaImportacion = {
  confirmadas: number;
  detalle: DetalleImportacion;
};

export function normalizarConfirmacionImportacion(resultado: ResultadoConfirmacionImportacion): ConfirmacionNormalizadaImportacion {
  return {
    confirmadas: Number(resultado.confirmadas),
    detalle: resultado.detalle,
  };
}

export function construirMensajeConfirmacionImportacion(
  etiqueta: string,
  resultado: ResultadoConfirmacionImportacion,
): string {
  const { confirmadas } = normalizarConfirmacionImportacion(resultado);
  return `${etiqueta}: ${String(confirmadas)}.`;
}
