"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obtenerProductoPorSlug = obtenerProductoPorSlug;
exports.obtenerProductosRelacionados = obtenerProductosRelacionados;
exports.obtenerEtiquetaIntencion = obtenerEtiquetaIntencion;
exports.obtenerEtiquetaCategoria = obtenerEtiquetaCategoria;
exports.obtenerGuiaRitual = obtenerGuiaRitual;
const catalogo_1 = require("./catalogo");
const ETIQUETAS_INTENCION = {
    calma: "Calma",
    enraizamiento: "Enraizamiento",
    claridad: "Claridad",
    proteccion: "Protección",
    abundancia: "Abundancia",
};
const ETIQUETAS_CATEGORIA = {
    "mezcla-herbal": "Mezcla herbal",
    "ritual-guiado": "Ritual guiado",
    herramienta: "Herramienta",
    "pack-regalo": "Pack regalo",
};
const GUIAS_RITUAL = {
    calma: {
        titulo: "Ritual de cierre suave",
        pasos: [
            "Prepara una taza y enciende una luz cálida para marcar el cambio de ritmo.",
            "Respira tres veces y deja que el aroma abra espacio a una pausa consciente.",
            "Cierra el momento con una intención breve de descanso y presencia.",
        ],
    },
    enraizamiento: {
        titulo: "Ritual de presencia corporal",
        pasos: [
            "Sirve la mezcla en una taza de base amplia y sostén el calor entre las manos.",
            "Nombra tres cosas por las que agradeces hoy antes del primer sorbo.",
            "Anota una acción concreta para cuidar tu energía mañana.",
        ],
    },
    claridad: {
        titulo: "Ritual de enfoque delicado",
        pasos: [
            "Ordena tu superficie de trabajo para crear un inicio limpio.",
            "Activa el producto y define una única prioridad para la siguiente hora.",
            "Cierra con una micro revisión: qué funcionó y qué ajustarás mañana.",
        ],
    },
    proteccion: {
        titulo: "Ritual para cuidar el espacio",
        pasos: [
            "Ventila el lugar unos minutos y abre una ventana de renovación.",
            "Recorre el ambiente de forma pausada, llevando tu atención a cada rincón.",
            "Finaliza con una frase de cuidado para tu hogar o altar cotidiano.",
        ],
    },
    abundancia: {
        titulo: "Ritual de apertura y constancia",
        pasos: [
            "Comienza nombrando lo que ya está floreciendo en tu semana.",
            "Usa el producto como ancla para una práctica de diez minutos sin interrupciones.",
            "Define un compromiso pequeño y sostenible para sostener tu avance.",
        ],
    },
};
function obtenerProductoPorSlug(slug, productos = catalogo_1.PRODUCTOS_CATALOGO) {
    const slugNormalizado = slug.trim().toLowerCase();
    return productos.find((producto) => producto.slug === slugNormalizado) ?? null;
}
function obtenerProductosRelacionados(productoBase, productos = catalogo_1.PRODUCTOS_CATALOGO, limite = 4) {
    const candidatos = productos.filter((producto) => producto.id !== productoBase.id);
    const mismosPorIntencion = candidatos.filter((producto) => producto.intencion === productoBase.intencion);
    const mismosPorCategoria = candidatos.filter((producto) => producto.categoria === productoBase.categoria);
    const destacados = candidatos.filter((producto) => producto.destacado);
    const ordenados = [...mismosPorIntencion, ...mismosPorCategoria, ...destacados, ...candidatos];
    return deduplicarPorId(ordenados).slice(0, limite);
}
function obtenerEtiquetaIntencion(intencion) {
    return ETIQUETAS_INTENCION[intencion];
}
function obtenerEtiquetaCategoria(categoria) {
    return ETIQUETAS_CATEGORIA[categoria];
}
function obtenerGuiaRitual(intencion) {
    return GUIAS_RITUAL[intencion];
}
function deduplicarPorId(productos) {
    const ids = new Set();
    return productos.filter((producto) => {
        if (ids.has(producto.id)) {
            return false;
        }
        ids.add(producto.id);
        return true;
    });
}
