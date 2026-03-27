"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.construirRutaReciboPedidoDemo = construirRutaReciboPedidoDemo;
exports.resolverIdPedidoDesdeRuta = resolverIdPedidoDesdeRuta;
function construirRutaReciboPedidoDemo(idPedido) {
    const idNormalizado = idPedido.trim();
    if (!idNormalizado) {
        return "/pedido-demo";
    }
    return `/pedido-demo/${encodeURIComponent(idNormalizado)}`;
}
function resolverIdPedidoDesdeRuta(valor) {
    if (!valor) {
        return null;
    }
    const limpio = valor.trim();
    if (!limpio) {
        return null;
    }
    return limpio;
}
