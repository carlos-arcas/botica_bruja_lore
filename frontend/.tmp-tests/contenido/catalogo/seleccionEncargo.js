"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolverLineasSeleccionEncargo = resolverLineasSeleccionEncargo;
exports.construirLineaPersistidaCatalogo = construirLineaPersistidaCatalogo;
exports.construirLineaPersistidaLegacy = construirLineaPersistidaLegacy;
exports.construirResumenHumanoSeleccion = construirResumenHumanoSeleccion;
exports.resolverResumenEconomicoSeleccion = resolverResumenEconomicoSeleccion;
exports.resolverReferenciaEconomicaVisualLinea = resolverReferenciaEconomicaVisualLinea;
const catalogo_1 = require("./catalogo");
function resolverLineasSeleccionEncargo(lineas, productos = catalogo_1.PRODUCTOS_CATALOGO) {
    return lineas.map((linea) => enriquecerLineaPersistida(linea, productos));
}
function construirLineaPersistidaCatalogo(slug, cantidad, productos = catalogo_1.PRODUCTOS_CATALOGO) {
    return crearLineaPersistidaBase(resolverLineaDesdeCatalogo(slug, cantidad, productos));
}
function construirLineaPersistidaLegacy(slug, cantidad, actualizadoEn, productos = catalogo_1.PRODUCTOS_CATALOGO) {
    return {
        ...construirLineaPersistidaCatalogo(slug, cantidad, productos),
        actualizadoEn: actualizadoEn ?? new Date().toISOString(),
    };
}
function construirResumenHumanoSeleccion(lineas) {
    if (lineas.length === 0) {
        return "";
    }
    const piezas = lineas.map((linea) => {
        const descripcionTipo = linea.tipo_linea === "catalogo"
            ? linea.nombre
            : `${linea.nombre}${linea.formato ? ` (${linea.formato})` : ""}`;
        return `${linea.cantidad} ${descripcionTipo}`;
    });
    return `Selección enviada desde mi selección: ${piezas.join(" + ")}.`;
}
function resolverResumenEconomicoSeleccion(lineas, contexto = "seleccion") {
    const lineasConReferencia = lineas.filter((linea) => linea.referencia_economica.valor !== null);
    const total = lineasConReferencia.reduce((acumulado, linea) => acumulado + (linea.referencia_economica.valor ?? 0) * linea.cantidad, 0);
    if (lineasConReferencia.length === 0) {
        return {
            estado: "sin_referencia",
            etiqueta: resolverEtiquetaSinReferencia(contexto),
            detalle: resolverDetalleSinReferencia(contexto),
            totalVisible: null,
        };
    }
    if (lineasConReferencia.length !== lineas.length) {
        return {
            estado: "parcial",
            etiqueta: resolverEtiquetaParcial(contexto),
            detalle: resolverDetalleParcial(contexto),
            totalVisible: formatearMoneda(total),
        };
    }
    return {
        estado: "estimada",
        etiqueta: resolverEtiquetaEstimada(contexto),
        detalle: resolverDetalleEstimado(contexto),
        totalVisible: formatearMoneda(total),
    };
}
function resolverReferenciaEconomicaVisualLinea(linea) {
    const valorUnitario = linea.referencia_economica.valor;
    if (valorUnitario === null) {
        return {
            mensaje: "Referencia económica a confirmar durante la revisión artesanal.",
            referenciaUnitaria: null,
            subtotal: null,
        };
    }
    return {
        mensaje: linea.referencia_economica.etiqueta,
        referenciaUnitaria: formatearMoneda(valorUnitario),
        subtotal: formatearMoneda(valorUnitario * linea.cantidad),
    };
}
function enriquecerLineaPersistida(linea, productos) {
    if (!linea.slug) {
        return { ...linea };
    }
    const producto = productos.find((item) => item.slug === linea.slug);
    if (!producto) {
        return { ...linea };
    }
    const referencia_economica = producto.disponible
        ? {
            etiqueta: "Referencia editorial disponible",
            valor: convertirPrecioVisibleANumero(producto.precioVisible),
        }
        : linea.referencia_economica.valor !== null
            ? linea.referencia_economica
            : { etiqueta: "Referencia editorial no activa", valor: null };
    return {
        ...linea,
        id_producto: producto.id,
        nombre: linea.nombre || producto.nombre,
        formato: linea.formato ?? producto.categoria,
        imagen_url: linea.imagen_url ?? producto.imagen_url,
        referencia_economica,
        notas_origen: linea.notas_origen ?? producto.subtitulo,
        tipo_linea: linea.tipo_linea === "fuera_catalogo"
            ? "fuera_catalogo"
            : producto.disponible
                ? "catalogo"
                : "sugerencia_editorial",
    };
}
function crearLineaPersistidaBase(linea) {
    return { ...linea, actualizadoEn: new Date().toISOString() };
}
function resolverLineaDesdeCatalogo(slug, cantidad, productos) {
    const producto = productos.find((item) => item.slug === slug);
    if (!producto) {
        return {
            id_linea: `fuera-${slug}`,
            tipo_linea: "fuera_catalogo",
            slug,
            id_producto: null,
            nombre: humanizarSlug(slug),
            cantidad,
            formato: humanizarSlug(slug),
            imagen_url: null,
            referencia_economica: {
                etiqueta: "Sin referencia económica",
                valor: null,
            },
            notas_origen: "Recuperada desde una selección local sin ficha pública activa.",
        };
    }
    return {
        id_linea: producto.id,
        tipo_linea: producto.disponible ? "catalogo" : "sugerencia_editorial",
        slug: producto.slug,
        id_producto: producto.id,
        nombre: producto.nombre,
        cantidad,
        formato: producto.categoria,
        imagen_url: producto.imagen_url,
        referencia_economica: {
            etiqueta: producto.disponible
                ? "Referencia editorial disponible"
                : "Referencia editorial no activa",
            valor: producto.disponible
                ? convertirPrecioVisibleANumero(producto.precioVisible)
                : null,
        },
        notas_origen: producto.subtitulo,
    };
}
function convertirPrecioVisibleANumero(precioVisible) {
    const limpio = precioVisible.replace(/[^0-9,]/g, "").replace(",", ".");
    const numero = Number.parseFloat(limpio);
    return Number.isFinite(numero) ? numero : null;
}
function formatearMoneda(valor) {
    return valor.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}
function humanizarSlug(slug) {
    return slug.replace(/-/g, " ");
}
function resolverEtiquetaSinReferencia(contexto) {
    if (contexto === "pedido_real") {
        return "Pedido real sin referencia económica";
    }
    if (contexto === "fuera_pedido_real") {
        return "Fuera del pedido real sin referencia económica";
    }
    return "Sin referencia económica";
}
function resolverDetalleSinReferencia(contexto) {
    if (contexto === "pedido_real") {
        return "Las líneas convertibles necesitan revisión económica antes de confirmar el pedido real: no mostramos 0,00 € cuando no existe referencia editorial válida.";
    }
    if (contexto === "fuera_pedido_real") {
        return "Estas líneas visibles han quedado fuera del pedido real y no aportan una referencia económica válida al total principal.";
    }
    return "Esta selección necesita revisión artesanal: no mostramos 0,00 € cuando no existe referencia editorial válida.";
}
function resolverEtiquetaParcial(contexto) {
    if (contexto === "pedido_real") {
        return "Pedido real con referencia parcial";
    }
    if (contexto === "fuera_pedido_real") {
        return "Contexto económico fuera del pedido real";
    }
    return "Referencia parcial";
}
function resolverDetalleParcial(contexto) {
    if (contexto === "pedido_real") {
        return "Mostramos solo el importe de las líneas convertibles con referencia editorial disponible; cualquier revisión adicional se confirma antes del pago real.";
    }
    if (contexto === "fuera_pedido_real") {
        return "Esta referencia pertenece solo a líneas visibles que no entran en el pedido real. Sirve como contexto y no contamina el total principal.";
    }
    return "Mostramos solo las piezas con referencia editorial disponible; el resto se confirma en la solicitud de encargo.";
}
function resolverEtiquetaEstimada(contexto) {
    if (contexto === "pedido_real") {
        return "Total orientativo del pedido real";
    }
    if (contexto === "fuera_pedido_real") {
        return "Contexto visible fuera del pedido real";
    }
    return "Referencia estimada";
}
function resolverDetalleEstimado(contexto) {
    if (contexto === "pedido_real") {
        return "Importe orientativo calculado solo con las líneas convertibles que sí entrarían en el pedido real.";
    }
    if (contexto === "fuera_pedido_real") {
        return "Importe orientativo solo de las líneas visibles bloqueadas o pendientes. No forma parte del pedido real convertible.";
    }
    return "Importe editorial orientativo para ayudarte a revisar la selección antes del encargo. No equivale a checkout ni confirmación final.";
}
