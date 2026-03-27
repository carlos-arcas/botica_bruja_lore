"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guardarPedidoRecienteDemo = guardarPedidoRecienteDemo;
exports.leerPedidoRecienteDemo = leerPedidoRecienteDemo;
exports.limpiarPedidoRecienteDemo = limpiarPedidoRecienteDemo;
exports.pedidoRecientePerteneceASesion = pedidoRecientePerteneceASesion;
const CLAVE_PEDIDO_RECIENTE = "botica.cuenta_demo.pedido_reciente.v1";
const VERSION_PEDIDO_RECIENTE = 1;
const ANTIGUEDAD_MAXIMA_MS = 1000 * 60 * 30;
function guardarPedidoRecienteDemo(idPedido, cuentaDemo) {
    const payload = construirPedidoRecientePersistido(idPedido, cuentaDemo);
    if (!payload || !hayAlmacenamientoDisponible()) {
        return;
    }
    window.localStorage.setItem(CLAVE_PEDIDO_RECIENTE, JSON.stringify(payload));
}
function leerPedidoRecienteDemo() {
    if (!hayAlmacenamientoDisponible()) {
        return null;
    }
    const valor = window.localStorage.getItem(CLAVE_PEDIDO_RECIENTE);
    if (!valor) {
        return null;
    }
    try {
        return restaurarPedidoReciente(JSON.parse(valor));
    }
    catch {
        limpiarPedidoRecienteDemo();
        return null;
    }
}
function limpiarPedidoRecienteDemo() {
    if (!hayAlmacenamientoDisponible()) {
        return;
    }
    window.localStorage.removeItem(CLAVE_PEDIDO_RECIENTE);
}
function pedidoRecientePerteneceASesion(pedidoReciente, cuentaDemo, idPedido) {
    if (!pedidoReciente || !cuentaDemo) {
        return false;
    }
    if (pedidoReciente.idUsuario !== cuentaDemo.id_usuario.trim()) {
        return false;
    }
    return !idPedido || pedidoReciente.idPedido === idPedido.trim();
}
function construirPedidoRecientePersistido(idPedido, cuentaDemo) {
    const idPedidoNormalizado = idPedido.trim();
    const idUsuario = cuentaDemo?.id_usuario.trim() ?? "";
    if (!idPedidoNormalizado || !idUsuario) {
        return null;
    }
    return {
        version: VERSION_PEDIDO_RECIENTE,
        idPedido: idPedidoNormalizado,
        idUsuario,
        creadoEn: new Date().toISOString(),
    };
}
function restaurarPedidoReciente(payload) {
    if (!esPedidoRecienteValido(payload)) {
        limpiarPedidoRecienteDemo();
        return null;
    }
    return {
        idPedido: payload.idPedido.trim(),
        idUsuario: payload.idUsuario.trim(),
        creadoEn: payload.creadoEn,
    };
}
function esPedidoRecienteValido(payload) {
    return payload.version === VERSION_PEDIDO_RECIENTE
        && typeof payload.idPedido === "string"
        && Boolean(payload.idPedido.trim())
        && typeof payload.idUsuario === "string"
        && Boolean(payload.idUsuario.trim())
        && !estaCaducado(payload.creadoEn);
}
function estaCaducado(creadoEn) {
    const timestamp = Date.parse(creadoEn);
    return !Number.isFinite(timestamp) || Date.now() - timestamp > ANTIGUEDAD_MAXIMA_MS;
}
function hayAlmacenamientoDisponible() {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}
