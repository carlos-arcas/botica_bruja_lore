const CENTIMOS_POR_EURO = 100;
const BASE_PORCENTAJE = 10000;
const TIPOS_FISCALES_BPS: Record<string, number> = {
  iva_general: 2100,
  iva_reducido: 1000,
};

type DesgloseFiscalVisible = {
  subtotal: number;
  envio: number;
  baseImponible: number;
  impuestos: number;
  total: number;
};

function aCentimos(valor: number): number {
  if (!Number.isFinite(valor) || valor < 0) return 0;
  return Math.round((valor + Number.EPSILON) * CENTIMOS_POR_EURO);
}

function aEuros(centimos: number): number {
  return centimos / CENTIMOS_POR_EURO;
}

function calcularImpuestos(baseCentimos: number, tipoFiscal: string): number {
  const bps = TIPOS_FISCALES_BPS[tipoFiscal] ?? TIPOS_FISCALES_BPS.iva_general;
  return Math.round((baseCentimos * bps) / BASE_PORCENTAJE);
}

type LineaFiscalVisible = { subtotal: number; tipo_fiscal?: string };

export function calcularDesgloseFiscalVisible(subtotal: number, envio: number, lineas: LineaFiscalVisible[] = []): DesgloseFiscalVisible {
  const subtotalCentimos = aCentimos(subtotal);
  const envioCentimos = aCentimos(envio);
  const baseCentimos = subtotalCentimos + envioCentimos;
  const impuestosLineas = lineas.length > 0
    ? lineas.reduce((ac, linea) => ac + calcularImpuestos(aCentimos(linea.subtotal), linea.tipo_fiscal ?? "iva_general"), 0)
    : calcularImpuestos(subtotalCentimos, "iva_general");
  const impuestosCentimos = impuestosLineas + calcularImpuestos(envioCentimos, "iva_general");
  const totalCentimos = baseCentimos + impuestosCentimos;
  return {
    subtotal: aEuros(subtotalCentimos),
    envio: aEuros(envioCentimos),
    baseImponible: aEuros(baseCentimos),
    impuestos: aEuros(impuestosCentimos),
    total: aEuros(totalCentimos),
  };
}
