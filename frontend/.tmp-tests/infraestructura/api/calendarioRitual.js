"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.esFechaCalendarioValida = esFechaCalendarioValida;
exports.consultarCalendarioRitualPorFecha = consultarCalendarioRitualPorFecha;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";
function esFechaCalendarioValida(fecha) {
    return /^\d{4}-\d{2}-\d{2}$/.test(fecha);
}
function mapearRitualCalendario(ritual) {
    return {
        ...ritual,
        urlDetalle: `/rituales/${ritual.slug}`,
    };
}
async function consultarCalendarioRitualPorFecha(fechaConsulta) {
    if (!esFechaCalendarioValida(fechaConsulta)) {
        return {
            estado: "error",
            mensaje: "La fecha debe usar formato YYYY-MM-DD para consultar el calendario ritual.",
            codigo: 400,
        };
    }
    const endpoint = `${API_BASE_URL}/api/v1/calendario-ritual/?fecha=${encodeURIComponent(fechaConsulta)}`;
    try {
        const respuesta = await fetch(endpoint, {
            headers: { Accept: "application/json" },
            cache: "no-store",
        });
        if (!respuesta.ok) {
            const data = (await respuesta.json().catch(() => null));
            return {
                estado: "error",
                mensaje: data?.detalle ??
                    "No pudimos consultar el calendario ritual en este momento. Inténtalo nuevamente en unos minutos.",
                codigo: respuesta.status,
            };
        }
        const data = await respuesta.json();
        return {
            estado: "ok",
            fechaConsulta: data.fecha_consulta,
            rituales: data.rituales.map(mapearRitualCalendario),
        };
    }
    catch {
        return {
            estado: "error",
            mensaje: "No hay conexión disponible entre frontend y backend para cargar el calendario ritual.",
        };
    }
}
