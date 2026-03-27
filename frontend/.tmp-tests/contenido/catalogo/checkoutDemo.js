"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.construirResultadoLineasPedidoDemo = construirResultadoLineasPedidoDemo;
exports.construirLineasPedidoDemo = construirLineasPedidoDemo;
exports.construirPayloadPedidoDemo = construirPayloadPedidoDemo;
exports.validarCheckoutDemo = validarCheckoutDemo;
exports.resolverEstadoIdentificacionCheckoutDemo = resolverEstadoIdentificacionCheckoutDemo;
exports.resolverCantidadCheckout = resolverCantidadCheckout;
const cestaRitual_1 = require("./cestaRitual");
const catalogo_1 = require("./catalogo");
function construirResultadoLineasPedidoDemo(itemsPreseleccionados, productoSlug, cantidadTexto, productos = catalogo_1.PRODUCTOS_CATALOGO) {
    if (itemsPreseleccionados.length > 0) {
        return construirResultadoSeleccionMultiple(itemsPreseleccionados, productos);
    }
    const cantidad = resolverCantidadCheckout(cantidadTexto);
    const resultado = construirLineaDesdeProducto(productoSlug, cantidad, productos);
    return {
        lineasConvertibles: resultado ? [resultado] : [],
        lineasNoConvertibles: [],
    };
}
function construirLineasPedidoDemo(itemsPreseleccionados, productoSlug, cantidadTexto, productos = catalogo_1.PRODUCTOS_CATALOGO) {
    return construirResultadoLineasPedidoDemo(itemsPreseleccionados, productoSlug, cantidadTexto, productos).lineasConvertibles;
}
function construirPayloadPedidoDemo(email, canal, lineas, cuentaDemo) {
    if (canal === "autenticado" && cuentaDemo?.id_usuario.trim()) {
        return {
            email: email.trim(),
            canal,
            lineas,
            id_usuario: cuentaDemo.id_usuario.trim(),
        };
    }
    return { email: email.trim(), canal, lineas };
}
function validarCheckoutDemo(canal, cuentaDemo, resultadoLineas) {
    const errores = {};
    const resultadoNormalizado = normalizarResultadoLineas(resultadoLineas);
    if (resultadoNormalizado.lineasNoConvertibles.length > 0) {
        errores.lineas = construirMensajeBloqueoLineas(resultadoNormalizado.lineasNoConvertibles, "pedido demo");
    }
    else if (resultadoNormalizado.lineasConvertibles.length === 0) {
        errores.lineas = "No hay líneas válidas para crear el pedido demo.";
    }
    if (canal !== "invitado" && canal !== "autenticado") {
        errores.canal = "Selecciona un canal de compra válido.";
    }
    if (canal === "autenticado" && !cuentaDemo?.id_usuario.trim()) {
        errores.idUsuario =
            "Necesitas una sesión activa de cuenta demo para comprar en modo autenticado.";
    }
    return errores;
}
function resolverEstadoIdentificacionCheckoutDemo(cuentaDemo, continuarComoInvitado) {
    if (cuentaDemo && !continuarComoInvitado) {
        return {
            canalActivo: "autenticado",
            cuentaActiva: cuentaDemo,
            emailPrefill: cuentaDemo.email.trim(),
        };
    }
    return {
        canalActivo: "invitado",
        cuentaActiva: cuentaDemo,
        emailPrefill: "",
    };
}
function resolverCantidadCheckout(valor) {
    const coincidencia = valor.match(/\d+/);
    const cantidad = coincidencia
        ? Number(coincidencia[0])
        : cestaRitual_1.CANTIDAD_MINIMA_CESTA;
    if (!Number.isFinite(cantidad)) {
        return cestaRitual_1.CANTIDAD_MINIMA_CESTA;
    }
    return Math.min(cestaRitual_1.CANTIDAD_MAXIMA_CESTA, Math.max(cestaRitual_1.CANTIDAD_MINIMA_CESTA, Math.round(cantidad)));
}
function construirResultadoSeleccionMultiple(itemsPreseleccionados, productos) {
    return itemsPreseleccionados.reduce((acumulado, item) => {
        const linea = construirLineaDesdeProducto(item.slug, item.cantidad, productos);
        if (linea) {
            acumulado.lineasConvertibles.push(linea);
            return acumulado;
        }
        acumulado.lineasNoConvertibles.push({
            id_linea: item.id_linea,
            nombre: item.nombre,
            cantidad: item.cantidad,
            tipo_linea: item.tipo_linea,
            motivo: resolverMotivoNoConvertible(item),
        });
        return acumulado;
    }, { lineasConvertibles: [], lineasNoConvertibles: [] });
}
function resolverMotivoNoConvertible(item) {
    if (item.tipo_linea === "fuera_catalogo") {
        return "Esta línea artesanal no tiene ficha pública activa y no entra en el contrato final del pedido demo.";
    }
    if (item.tipo_linea === "sugerencia_editorial") {
        return "Esta sugerencia editorial no está disponible como producto comprable en el pedido demo.";
    }
    return "La línea visible no se puede convertir en una línea enviable del pedido demo.";
}
function normalizarResultadoLineas(resultadoLineas) {
    if (Array.isArray(resultadoLineas)) {
        return {
            lineasConvertibles: resultadoLineas,
            lineasNoConvertibles: [],
        };
    }
    return resultadoLineas;
}
function construirMensajeBloqueoLineas(lineas, contexto) {
    const resumenLineas = lineas
        .map((linea) => `${linea.cantidad} × ${linea.nombre}`)
        .join(", ");
    return `No podemos enviar este ${contexto} porque tu selección incluye líneas fuera del contrato final: ${resumenLineas}. Revísalas o pásalas a consulta manual antes de continuar.`;
}
function construirLineaDesdeProducto(slug, cantidad, productos) {
    if (!slug) {
        return null;
    }
    const producto = productos.find((item) => item.slug === slug);
    if (!producto || !producto.disponible) {
        return null;
    }
    return {
        id_producto: producto.id,
        slug_producto: producto.slug,
        nombre_producto: producto.nombre,
        cantidad,
        precio_unitario_demo: convertirPrecioVisibleADecimal(producto.precioVisible),
    };
}
function convertirPrecioVisibleADecimal(precioVisible) {
    const limpio = precioVisible.replace(/[^0-9,]/g, "").replace(",", ".");
    const numero = Number.parseFloat(limpio);
    if (!Number.isFinite(numero)) {
        return "0.00";
    }
    return numero.toFixed(2);
}
