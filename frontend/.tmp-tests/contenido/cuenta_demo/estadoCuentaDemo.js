"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validarCamposRegistroDemo = validarCamposRegistroDemo;
exports.validarCamposAutenticacionDemo = validarCamposAutenticacionDemo;
exports.guardarSesionCuentaDemo = guardarSesionCuentaDemo;
exports.leerSesionCuentaDemo = leerSesionCuentaDemo;
exports.limpiarSesionCuentaDemo = limpiarSesionCuentaDemo;
const CLAVE_ALMACEN = "botica.cuenta_demo.v1";
function validarCamposRegistroDemo(campos) {
    const errores = [];
    if (!campos.email.trim() || !campos.email.includes("@")) {
        errores.push("Introduce un email válido para la cuenta demo.");
    }
    if (!campos.nombre_visible.trim()) {
        errores.push("El nombre visible es obligatorio.");
    }
    if (campos.clave_acceso_demo.trim().length < 4) {
        errores.push("La clave demo debe tener al menos 4 caracteres.");
    }
    return errores;
}
function validarCamposAutenticacionDemo(campos) {
    const errores = [];
    if (!campos.email.trim() || !campos.email.includes("@")) {
        errores.push("Introduce el email usado en tu cuenta demo.");
    }
    if (!campos.clave_acceso_demo.trim()) {
        errores.push("La clave demo es obligatoria para entrar.");
    }
    return errores;
}
function guardarSesionCuentaDemo(cuenta) {
    if (typeof window === "undefined") {
        return;
    }
    window.localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(cuenta));
}
function leerSesionCuentaDemo() {
    if (typeof window === "undefined") {
        return null;
    }
    const valor = window.localStorage.getItem(CLAVE_ALMACEN);
    if (!valor) {
        return null;
    }
    try {
        const cuenta = JSON.parse(valor);
        if (!cuenta.id_usuario || !cuenta.email || !cuenta.nombre_visible) {
            return null;
        }
        return cuenta;
    }
    catch {
        return null;
    }
}
function limpiarSesionCuentaDemo() {
    if (typeof window === "undefined") {
        return;
    }
    window.localStorage.removeItem(CLAVE_ALMACEN);
}
