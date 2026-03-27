"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearPedidoDemoPublico = crearPedidoDemoPublico;
exports.obtenerPedidoDemoPublico = obtenerPedidoDemoPublico;
exports.obtenerEmailDemoPedidoPublico = obtenerEmailDemoPedidoPublico;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";
async function crearPedidoDemoPublico(payload) {
    const endpoint = `${API_BASE_URL}/api/v1/pedidos-demo/`;
    try {
        const respuesta = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(payload),
        });
        if (!respuesta.ok) {
            const mensajeError = await leerMensajeError(respuesta);
            return { estado: "error", mensaje: mensajeError };
        }
        const data = await respuesta.json();
        return { estado: "ok", pedido: data.pedido };
    }
    catch {
        return {
            estado: "error",
            mensaje: "No pudimos conectar con la API de pedidos demo. Revisa la conexión e inténtalo de nuevo.",
        };
    }
}
async function obtenerPedidoDemoPublico(idPedido) {
    const idNormalizado = idPedido.trim();
    if (!idNormalizado) {
        return { estado: "error", mensaje: "Falta el identificador del pedido demo para mostrar el recibo." };
    }
    const endpoint = `${API_BASE_URL}/api/v1/pedidos-demo/${encodeURIComponent(idNormalizado)}/`;
    try {
        const respuesta = await fetch(endpoint, {
            method: "GET",
            headers: {
                Accept: "application/json",
            },
            cache: "no-store",
        });
        if (!respuesta.ok) {
            const mensajeError = await leerMensajeError(respuesta);
            return { estado: "error", mensaje: mensajeError, codigo: respuesta.status };
        }
        const data = await respuesta.json();
        return { estado: "ok", pedido: data.pedido };
    }
    catch {
        return {
            estado: "error",
            mensaje: "No pudimos cargar el recibo demo por un problema de conexión. Inténtalo de nuevo.",
        };
    }
}
async function leerMensajeError(respuesta) {
    try {
        const data = (await respuesta.json());
        if (data.detalle?.trim()) {
            return data.detalle;
        }
    }
    catch {
        return "No se pudo crear el pedido demo por un error inesperado.";
    }
    return "No se pudo crear el pedido demo por un error inesperado.";
}
async function obtenerEmailDemoPedidoPublico(idPedido) {
    const endpoint = `${API_BASE_URL}/api/v1/pedidos-demo/${encodeURIComponent(idPedido)}/email-demo/`;
    try {
        const respuesta = await fetch(endpoint, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
        });
        const payload = await respuesta.json();
        if (!respuesta.ok) {
            return {
                estado: "error",
                codigo: respuesta.status,
                mensaje: payload?.detalle ?? "No pudimos recuperar el email demo.",
            };
        }
        return { estado: "ok", emailDemo: payload.email_demo };
    }
    catch (_error) {
        return { estado: "error", mensaje: "No hay conexión con la API de email demo." };
    }
}
