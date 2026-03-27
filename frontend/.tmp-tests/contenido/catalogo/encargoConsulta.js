"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MENSAJES_VALIDACION = void 0;
exports.resolverProductoPreseleccionado = resolverProductoPreseleccionado;
exports.resolverContextoPreseleccionado = resolverContextoPreseleccionado;
exports.resolverItemsPreseleccionados = resolverItemsPreseleccionados;
exports.debeConsumirPersistenciaLocalEncargo = debeConsumirPersistenciaLocalEncargo;
exports.construirEstadoInicialConsulta = construirEstadoInicialConsulta;
exports.validarSolicitudConsulta = validarSolicitudConsulta;
exports.construirResumenConsulta = construirResumenConsulta;
const cestaRitual_1 = require("./cestaRitual");
const catalogo_1 = require("./catalogo");
const detalleCatalogo_1 = require("./detalleCatalogo");
const seleccionEncargo_1 = require("./seleccionEncargo");
exports.MENSAJES_VALIDACION = {
    nombre: "Comparte tu nombre para preparar la consulta.",
    contacto: "Indica un email válido o un teléfono (mínimo 9 dígitos).",
    producto: "Selecciona una pieza de la colección para continuar.",
    mensaje: "Cuéntanos brevemente tu intención o contexto.",
    consentimiento: "Necesitamos tu confirmación para gestionar esta solicitud.",
};
function resolverProductoPreseleccionado(slug, productos = catalogo_1.PRODUCTOS_CATALOGO) {
    return slug ? (0, detalleCatalogo_1.obtenerProductoPorSlug)(slug, productos) : null;
}
function resolverContextoPreseleccionado(slug, cestaSerializada, itemsPersistidos = [], origen = null) {
    const preseleccion = resolverItemsPreseleccionados(cestaSerializada, itemsPersistidos, origen);
    const modo = debeAbrirModoSeleccion(origen, preseleccion.items)
        ? "seleccion"
        : "producto";
    return {
        modo,
        productoPreseleccionado: resolverProductoPreseleccionado(slug),
        itemsPreseleccionados: preseleccion.items,
        fuentePreseleccion: preseleccion.fuente,
    };
}
function resolverItemsPreseleccionados(cestaSerializada, itemsPersistidos = [], origen = null) {
    const itemsEnUrl = (0, cestaRitual_1.deserializarItemsEncargo)(cestaSerializada);
    if (itemsEnUrl.length > 0) {
        return { items: itemsEnUrl, fuente: "url_legacy" };
    }
    if (tieneOrigenSeleccionExplicito(origen) &&
        itemsPersistidos.length > 0) {
        return { items: itemsPersistidos, fuente: "persistencia_local" };
    }
    return { items: [], fuente: "sin_preseleccion" };
}
function debeConsumirPersistenciaLocalEncargo(cestaSerializada, origen) {
    return (!tieneCestaLegacyValida(cestaSerializada) &&
        tieneOrigenSeleccionExplicito(origen));
}
function construirEstadoInicialConsulta(contexto, lineasSeleccion = []) {
    if (contexto.modo === "seleccion") {
        return {
            nombre: "",
            email: "",
            telefono: "",
            productoSlug: "",
            cantidad: "A definir durante la revisión artesanal",
            mensaje: (0, seleccionEncargo_1.construirResumenHumanoSeleccion)(lineasSeleccion),
            consentimiento: false,
        };
    }
    return {
        nombre: "",
        email: "",
        telefono: "",
        productoSlug: contexto.productoPreseleccionado?.slug ?? "",
        cantidad: "1 unidad",
        mensaje: "",
        consentimiento: false,
    };
}
function validarSolicitudConsulta(datos, modo) {
    const errores = {};
    if (datos.nombre.trim().length < 2) {
        errores.nombre = exports.MENSAJES_VALIDACION.nombre;
    }
    if (!tieneContactoValido(datos.email, datos.telefono)) {
        errores.email = exports.MENSAJES_VALIDACION.contacto;
    }
    if (modo === "producto" && !datos.productoSlug.trim()) {
        errores.productoSlug = exports.MENSAJES_VALIDACION.producto;
    }
    if (datos.mensaje.trim().length < 12) {
        errores.mensaje = exports.MENSAJES_VALIDACION.mensaje;
    }
    if (!datos.consentimiento) {
        errores.consentimiento = exports.MENSAJES_VALIDACION.consentimiento;
    }
    return errores;
}
function construirResumenConsulta(datos, producto, modo, lineasSeleccion = []) {
    const contacto = datos.email.trim() || `Teléfono: ${datos.telefono.trim()}`;
    const bloqueSeleccion = modo === "seleccion"
        ? `Selección: ${(0, seleccionEncargo_1.construirResumenHumanoSeleccion)(lineasSeleccion) || (0, cestaRitual_1.construirResumenItemsEncargo)(lineasSeleccion.map(lineaAItemResumen))}`
        : `Producto: ${producto?.nombre ?? "Producto pendiente de selección"}`;
    return [
        "Consulta de encargo · La Botica de la Bruja Lore",
        `Nombre: ${datos.nombre.trim()}`,
        `Contacto: ${contacto}`,
        bloqueSeleccion,
        `Cantidad/Formato: ${datos.cantidad.trim() || "A convenir"}`,
        `Intención: ${datos.mensaje.trim()}`,
    ].join("\n");
}
function lineaAItemResumen(linea) {
    return {
        id_linea: linea.id_linea,
        tipo_linea: linea.tipo_linea,
        slug: linea.slug,
        id_producto: linea.id_producto,
        nombre: linea.nombre,
        cantidad: linea.cantidad,
        formato: linea.formato,
        imagen_url: linea.imagen_url,
        referencia_economica: linea.referencia_economica,
        notas_origen: linea.notas_origen,
    };
}
function debeAbrirModoSeleccion(origen, itemsPreseleccionados) {
    return (tieneOrigenSeleccionExplicito(origen) ||
        itemsPreseleccionados.length > 0);
}
function tieneOrigenSeleccionExplicito(origen) {
    return origen === "seleccion";
}
function tieneCestaLegacyValida(cestaSerializada) {
    return (0, cestaRitual_1.deserializarItemsEncargo)(cestaSerializada).length > 0;
}
function tieneContactoValido(email, telefono) {
    return esEmailValido(email.trim()) || esTelefonoValido(telefono.trim());
}
function esEmailValido(email) {
    return Boolean(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function esTelefonoValido(telefono) {
    return telefono.replace(/\D/g, "").length >= 9;
}
