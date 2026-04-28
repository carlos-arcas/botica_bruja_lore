export const PROVEEDOR_PAGO_SIMULADO_LOCAL = "simulado_local";

export type ReferenciaPagoPedido = {
  proveedor_pago?: string | null;
  url_pago?: string | null;
};

export function resolverEsPagoSimuladoLocal(pago?: ReferenciaPagoPedido | null): boolean {
  return pago?.proveedor_pago === PROVEEDOR_PAGO_SIMULADO_LOCAL;
}
