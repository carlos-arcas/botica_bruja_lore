export const METODO_ENVIO_ESTANDAR = "envio_estandar";

export function resolverImporteEnvioEstandar(): number {
  const bruto = process.env.NEXT_PUBLIC_ENVIO_ESTANDAR_IMPORTE ?? "4.90";
  const numero = Number.parseFloat(bruto);
  return Number.isFinite(numero) && numero >= 0 ? numero : 4.9;
}

export function formatearMonedaEur(valor: number): string {
  return valor.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}
