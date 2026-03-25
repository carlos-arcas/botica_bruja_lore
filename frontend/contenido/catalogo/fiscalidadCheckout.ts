const CENTIMOS_POR_EURO = 100;
const BASE_PORCENTAJE = 10000;
const IVA_GENERAL_BPS = 2100;

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

function calcularImpuestos(baseCentimos: number): number {
  return Math.round((baseCentimos * IVA_GENERAL_BPS) / BASE_PORCENTAJE);
}

export function calcularDesgloseFiscalVisible(subtotal: number, envio: number): DesgloseFiscalVisible {
  const subtotalCentimos = aCentimos(subtotal);
  const envioCentimos = aCentimos(envio);
  const baseCentimos = subtotalCentimos + envioCentimos;
  const impuestosCentimos = calcularImpuestos(baseCentimos);
  const totalCentimos = baseCentimos + impuestosCentimos;
  return {
    subtotal: aEuros(subtotalCentimos),
    envio: aEuros(envioCentimos),
    baseImponible: aEuros(baseCentimos),
    impuestos: aEuros(impuestosCentimos),
    total: aEuros(totalCentimos),
  };
}
