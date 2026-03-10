export function construirRutaReciboPedidoDemo(idPedido: string): string {
  const idNormalizado = idPedido.trim();
  if (!idNormalizado) {
    return "/pedido-demo";
  }

  return `/pedido-demo/${encodeURIComponent(idNormalizado)}`;
}

export function resolverIdPedidoDesdeRuta(valor?: string | null): string | null {
  if (!valor) {
    return null;
  }

  const limpio = valor.trim();
  if (!limpio) {
    return null;
  }

  return limpio;
}
