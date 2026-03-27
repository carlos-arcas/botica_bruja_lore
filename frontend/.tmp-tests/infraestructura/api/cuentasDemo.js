"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarCuentaDemo = registrarCuentaDemo;
exports.autenticarCuentaDemo = autenticarCuentaDemo;
exports.obtenerPerfilCuentaDemo = obtenerPerfilCuentaDemo;
exports.obtenerHistorialCuentaDemo = obtenerHistorialCuentaDemo;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";
async function registrarCuentaDemo(payload) {
    return enviarCuentaDemo("registro/", payload);
}
async function autenticarCuentaDemo(payload) {
    return enviarCuentaDemo("autenticacion/", payload);
}
async function obtenerPerfilCuentaDemo(idUsuario) {
    return consultarPerfilHistorial(`${encodeURIComponent(idUsuario)}/perfil/`, "perfil");
}
async function obtenerHistorialCuentaDemo(idUsuario) {
    const endpoint = `${API_BASE_URL}/api/v1/cuentas-demo/${encodeURIComponent(idUsuario)}/historial-pedidos/`;
    try {
        const respuesta = await fetch(endpoint, { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" });
        const payload = await respuesta.json();
        if (!respuesta.ok) {
            return {
                estado: "error",
                codigo: respuesta.status,
                mensaje: resolverMensajeError(payload, "No pudimos cargar el historial demo de pedidos."),
            };
        }
        return {
            estado: "ok",
            idUsuario: payload.id_usuario,
            pedidos: (payload.pedidos ?? []),
        };
    }
    catch {
        return { estado: "error", mensaje: "No hay conexión con la API de cuenta demo." };
    }
}
async function enviarCuentaDemo(path, body) {
    const endpoint = `${API_BASE_URL}/api/v1/cuentas-demo/${path}`;
    try {
        const respuesta = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(body),
        });
        const payload = await respuesta.json();
        if (!respuesta.ok) {
            return {
                estado: "error",
                codigo: respuesta.status,
                mensaje: resolverMensajeError(payload, "No pudimos procesar la cuenta demo."),
            };
        }
        return { estado: "ok", cuenta: payload.cuenta };
    }
    catch {
        return { estado: "error", mensaje: "No hay conexión con la API de cuenta demo." };
    }
}
async function consultarPerfilHistorial(path, clave) {
    const endpoint = `${API_BASE_URL}/api/v1/cuentas-demo/${path}`;
    try {
        const respuesta = await fetch(endpoint, { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" });
        const payload = await respuesta.json();
        if (!respuesta.ok) {
            return {
                estado: "error",
                codigo: respuesta.status,
                mensaje: resolverMensajeError(payload, "No pudimos cargar el perfil demo."),
            };
        }
        return { estado: "ok", perfil: payload[clave] };
    }
    catch {
        return { estado: "error", mensaje: "No hay conexión con la API de cuenta demo." };
    }
}
function resolverMensajeError(payload, fallback) {
    const detalle = typeof payload === "object" && payload !== null ? payload.detalle : null;
    return detalle?.trim() || fallback;
}
