"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.guardarBorradorCheckoutDemo = guardarBorradorCheckoutDemo;
exports.leerBorradorCheckoutDemo = leerBorradorCheckoutDemo;
exports.limpiarBorradorCheckoutDemo = limpiarBorradorCheckoutDemo;
exports.esRutaInternaSeguraParaReturnTo = esRutaInternaSeguraParaReturnTo;
exports.construirRutaCuentaDemoConRetornoSeguro = construirRutaCuentaDemoConRetornoSeguro;
const CLAVE_BORRADOR_CHECKOUT = "botica.checkout_demo.borrador.v1";
const VERSION_BORRADOR = 1;
const ANTIGUEDAD_MAXIMA_MS = 1000 * 60 * 60 * 24 * 7;
function guardarBorradorCheckoutDemo(datos, continuarComoInvitado) {
    if (!hayAlmacenamientoDisponible()) {
        return;
    }
    const payload = {
        version: VERSION_BORRADOR,
        actualizadoEn: new Date().toISOString(),
        datos: construirDatosPersistibles(datos),
        continuarComoInvitado,
    };
    window.localStorage.setItem(CLAVE_BORRADOR_CHECKOUT, JSON.stringify(payload));
}
function leerBorradorCheckoutDemo() {
    if (!hayAlmacenamientoDisponible()) {
        return null;
    }
    const valor = window.localStorage.getItem(CLAVE_BORRADOR_CHECKOUT);
    if (!valor) {
        return null;
    }
    try {
        return restaurarBorradorDesdeJson(JSON.parse(valor));
    }
    catch {
        limpiarBorradorCheckoutDemo();
        return null;
    }
}
function limpiarBorradorCheckoutDemo() {
    if (!hayAlmacenamientoDisponible()) {
        return;
    }
    window.localStorage.removeItem(CLAVE_BORRADOR_CHECKOUT);
}
function esRutaInternaSeguraParaReturnTo(ruta) {
    if (!ruta) {
        return false;
    }
    return /^\/(?!\/)/.test(ruta);
}
function construirRutaCuentaDemoConRetornoSeguro(rutaRetorno) {
    const destino = esRutaInternaSeguraParaReturnTo(rutaRetorno) ? rutaRetorno : "/cuenta-demo";
    const params = new URLSearchParams({ returnTo: destino });
    return `/cuenta-demo?${params.toString()}`;
}
function construirDatosPersistibles(datos) {
    return {
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        productoSlug: datos.productoSlug,
        cantidad: datos.cantidad,
        mensaje: datos.mensaje,
    };
}
function restaurarBorradorDesdeJson(payload) {
    if (!esBorradorPersistidoValido(payload)) {
        limpiarBorradorCheckoutDemo();
        return null;
    }
    return {
        datos: {
            ...payload.datos,
            consentimiento: false,
        },
        continuarComoInvitado: payload.continuarComoInvitado ?? true,
    };
}
function esBorradorPersistidoValido(payload) {
    return payload.version === VERSION_BORRADOR && !estaCaducado(payload.actualizadoEn) && tieneDatosMinimos(payload.datos);
}
function estaCaducado(actualizadoEn) {
    const timestamp = Date.parse(actualizadoEn);
    return !Number.isFinite(timestamp) || Date.now() - timestamp > ANTIGUEDAD_MAXIMA_MS;
}
function tieneDatosMinimos(datos) {
    return typeof datos.nombre === "string"
        && typeof datos.email === "string"
        && typeof datos.telefono === "string"
        && typeof datos.productoSlug === "string"
        && typeof datos.cantidad === "string"
        && typeof datos.mensaje === "string";
}
function hayAlmacenamientoDisponible() {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}
