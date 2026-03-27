"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CANTIDAD_MAXIMA_CESTA = exports.CANTIDAD_MINIMA_CESTA = void 0;
exports.crearCestaVacia = crearCestaVacia;
exports.agregarProducto = agregarProducto;
exports.quitarProducto = quitarProducto;
exports.actualizarCantidad = actualizarCantidad;
exports.vaciarCesta = vaciarCesta;
exports.contarUnidades = contarUnidades;
exports.resolverSubtotalVisible = resolverSubtotalVisible;
exports.serializarCesta = serializarCesta;
exports.deserializarCesta = deserializarCesta;
exports.convertirCestaAItemsEncargo = convertirCestaAItemsEncargo;
exports.convertirCestaALineasSeleccion = convertirCestaALineasSeleccion;
exports.serializarItemsEncargo = serializarItemsEncargo;
exports.deserializarItemsEncargo = deserializarItemsEncargo;
exports.construirResumenItemsEncargo = construirResumenItemsEncargo;
const catalogo_1 = require("./catalogo");
const seleccionEncargo_1 = require("./seleccionEncargo");
exports.CANTIDAD_MINIMA_CESTA = 1;
exports.CANTIDAD_MAXIMA_CESTA = 12;
function crearCestaVacia() {
    return { lineas: [] };
}
function agregarProducto(cesta, slug, cantidad = exports.CANTIDAD_MINIMA_CESTA) {
    const cantidadLimpia = normalizarCantidad(cantidad);
    const existente = cesta.lineas.find((linea) => linea.slug === slug && linea.tipo_linea !== "fuera_catalogo");
    if (!existente) {
        return {
            lineas: [
                ...cesta.lineas,
                (0, seleccionEncargo_1.construirLineaPersistidaCatalogo)(slug, cantidadLimpia),
            ],
        };
    }
    return actualizarCantidad(cesta, existente.id_linea, existente.cantidad + cantidadLimpia);
}
function quitarProducto(cesta, idLinea) {
    return { lineas: cesta.lineas.filter((linea) => linea.id_linea !== idLinea) };
}
function actualizarCantidad(cesta, idLinea, cantidad) {
    const cantidadLimpia = normalizarCantidad(cantidad);
    return {
        lineas: cesta.lineas.map((linea) => linea.id_linea === idLinea
            ? {
                ...linea,
                cantidad: cantidadLimpia,
                actualizadoEn: new Date().toISOString(),
            }
            : linea),
    };
}
function vaciarCesta() {
    return crearCestaVacia();
}
function contarUnidades(cesta) {
    return cesta.lineas.reduce((acumulado, linea) => acumulado + linea.cantidad, 0);
}
function resolverSubtotalVisible(cesta, productos = catalogo_1.PRODUCTOS_CATALOGO) {
    const total = cesta.lineas.reduce((acumulado, linea) => {
        const producto = linea.slug
            ? productos.find((item) => item.slug === linea.slug)
            : null;
        if (!producto) {
            return acumulado;
        }
        return (acumulado +
            convertirPrecioVisibleANumero(producto.precioVisible) * linea.cantidad);
    }, 0);
    return total.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}
function serializarCesta(cesta) {
    return JSON.stringify(cesta);
}
function deserializarCesta(serializado) {
    if (!serializado) {
        return crearCestaVacia();
    }
    try {
        const objeto = JSON.parse(serializado);
        if (!Array.isArray(objeto.lineas)) {
            return crearCestaVacia();
        }
        return {
            lineas: objeto.lineas
                .map(deserializarLinea)
                .filter((linea) => linea !== null),
        };
    }
    catch {
        return crearCestaVacia();
    }
}
function convertirCestaAItemsEncargo(cesta) {
    return cesta.lineas.map(({ actualizadoEn, ...linea }) => linea);
}
function convertirCestaALineasSeleccion(cesta, productos = catalogo_1.PRODUCTOS_CATALOGO) {
    return (0, seleccionEncargo_1.resolverLineasSeleccionEncargo)(cesta.lineas, productos);
}
function serializarItemsEncargo(items) {
    return encodeURIComponent(JSON.stringify(items));
}
function deserializarItemsEncargo(serializado) {
    if (!serializado) {
        return [];
    }
    try {
        const objeto = JSON.parse(decodeURIComponent(serializado));
        if (!Array.isArray(objeto)) {
            return [];
        }
        return objeto
            .map(deserializarItemEncargo)
            .filter((item) => item !== null);
    }
    catch {
        return [];
    }
}
function construirResumenItemsEncargo(items, productos = catalogo_1.PRODUCTOS_CATALOGO) {
    if (items.length === 0) {
        return "";
    }
    return items
        .map((item) => {
        if (item.nombre) {
            return `${item.cantidad} x ${item.nombre}`;
        }
        const producto = item.slug
            ? productos.find((registro) => registro.slug === item.slug)
            : null;
        return producto
            ? `${item.cantidad} x ${producto.nombre}`
            : `${item.cantidad} x Pieza artesanal sin ficha activa`;
    })
        .join("\n");
}
function deserializarLinea(linea) {
    if (!linea || typeof linea !== "object") {
        return null;
    }
    if (esLineaPersistida(linea)) {
        return {
            ...linea,
            cantidad: normalizarCantidad(Number(linea.cantidad)),
            actualizadoEn: typeof linea.actualizadoEn === "string"
                ? linea.actualizadoEn
                : new Date().toISOString(),
        };
    }
    const legacy = linea;
    if (typeof legacy.slug !== "string") {
        return null;
    }
    return (0, seleccionEncargo_1.construirLineaPersistidaLegacy)(legacy.slug, normalizarCantidad(Number(legacy.cantidad)), typeof legacy.actualizadoEn === "string" ? legacy.actualizadoEn : undefined);
}
function deserializarItemEncargo(item) {
    if (!item || typeof item !== "object") {
        return null;
    }
    if (esLineaPersistida(item) || esItemEncargoPersistido(item)) {
        return {
            id_linea: item.id_linea,
            tipo_linea: item.tipo_linea,
            slug: item.slug,
            id_producto: item.id_producto,
            nombre: item.nombre,
            cantidad: normalizarCantidad(Number(item.cantidad)),
            formato: item.formato,
            imagen_url: item.imagen_url,
            referencia_economica: item.referencia_economica,
            notas_origen: item.notas_origen,
        };
    }
    const legacy = item;
    if (typeof legacy.slug !== "string") {
        return null;
    }
    const { actualizadoEn, ...linea } = (0, seleccionEncargo_1.construirLineaPersistidaLegacy)(legacy.slug, normalizarCantidad(Number(legacy.cantidad)));
    return linea;
}
function esLineaPersistida(linea) {
    return (esItemEncargoPersistido(linea) &&
        typeof linea.actualizadoEn === "string");
}
function esItemEncargoPersistido(item) {
    if (!item || typeof item !== "object") {
        return false;
    }
    const registro = item;
    return (typeof registro.id_linea === "string" &&
        typeof registro.tipo_linea === "string" &&
        typeof registro.nombre === "string" &&
        "cantidad" in registro);
}
function normalizarCantidad(cantidad) {
    if (!Number.isFinite(cantidad)) {
        return exports.CANTIDAD_MINIMA_CESTA;
    }
    return Math.min(exports.CANTIDAD_MAXIMA_CESTA, Math.max(exports.CANTIDAD_MINIMA_CESTA, Math.round(cantidad)));
}
function convertirPrecioVisibleANumero(precioVisible) {
    const limpio = precioVisible.replace(/[^0-9,]/g, "").replace(",", ".");
    const numero = Number.parseFloat(limpio);
    return Number.isFinite(numero) ? numero : 0;
}
