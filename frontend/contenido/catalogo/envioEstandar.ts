export const METODO_ENVIO_ESTANDAR = "envio_estandar";

export function resolverImporteEnvioEstandarDesdeApi(bruto: string): number {
  const numero = Number.parseFloat(bruto);
  return Number.isFinite(numero) && numero >= 0 ? numero : 0;
}

export function formatearMonedaEur(valor: number): string {
  return valor.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}
