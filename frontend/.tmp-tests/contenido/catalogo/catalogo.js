"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRODUCTOS_CATALOGO = exports.OPCIONES_CATEGORIA = exports.OPCIONES_INTENCION = void 0;
exports.OPCIONES_INTENCION = [
    { valor: "todas", etiqueta: "Todas las intenciones" },
    { valor: "calma", etiqueta: "Calma" },
    { valor: "enraizamiento", etiqueta: "Enraizamiento" },
    { valor: "claridad", etiqueta: "Claridad" },
    { valor: "proteccion", etiqueta: "Protección" },
    { valor: "abundancia", etiqueta: "Abundancia" },
];
exports.OPCIONES_CATEGORIA = [
    { valor: "todas", etiqueta: "Todos los formatos" },
    { valor: "mezcla-herbal", etiqueta: "Mezcla herbal" },
    { valor: "ritual-guiado", etiqueta: "Ritual guiado" },
    { valor: "herramienta", etiqueta: "Herramienta" },
    { valor: "pack-regalo", etiqueta: "Pack regalo" },
];
exports.PRODUCTOS_CATALOGO = [
    crearProductoCatalogo({
        id: "rit-001", slug: "infusion-bruma-lavanda", nombre: "Bruma de Lavanda Serena",
        subtitulo: "Mezcla herbal para desacelerar el cierre del día",
        descripcion: "Flores de lavanda, melisa y cáscara de naranja para una taza aromática que acompaña pausas suaves y respiración consciente.",
        precioVisible: "€14,90", categoria: "mezcla-herbal", intencion: "calma",
        etiquetas: ["infusión", "vespertino", "floral"], destacado: true, disponible: true,
        notasSensoriales: "Floral limpio, cítrico tenue y fondo dulce.",
    }),
    crearProductoCatalogo({
        id: "rit-002", slug: "ritual-luna-hogar", nombre: "Ritual Luna en Casa",
        subtitulo: "Secuencia breve para devolver armonía al espacio",
        descripcion: "Guía editorial de 15 minutos con sahumo suave, infusión y frase de cierre para ordenar la atmósfera del hogar.",
        precioVisible: "€19,00", categoria: "ritual-guiado", intencion: "proteccion",
        etiquetas: ["hogar", "guía", "limpieza simbólica"], destacado: true, disponible: true,
        notasSensoriales: "Resina ligera, hierba seca y toque amaderado.",
    }),
    crearProductoCatalogo({
        id: "rit-003", slug: "mezcla-raiz-canela", nombre: "Raíz de Canela y Cacao",
        subtitulo: "Infusión cálida para prácticas de enraizamiento",
        descripcion: "Combinación de canela, cacao nibs y rooibos para acompañar escritura de gratitud y retorno al cuerpo.",
        precioVisible: "€12,50", categoria: "mezcla-herbal", intencion: "enraizamiento",
        etiquetas: ["especiada", "ritual matinal", "sin cafeína"], destacado: false, disponible: true,
        notasSensoriales: "Cálida, tostada y especiada.",
    }),
    crearProductoCatalogo({
        id: "rit-004", slug: "vela-intencion-clara", nombre: "Vela Intención Clara",
        subtitulo: "Vela botánica para foco y presencia",
        descripcion: "Cera vegetal con romero, salvia y pétalos blancos para acompañar sesiones de planificación o estudio.",
        precioVisible: "€16,00", categoria: "herramienta", intencion: "claridad",
        etiquetas: ["vela", "altar", "concentración"], destacado: true, disponible: true,
        notasSensoriales: "Herbal fresco, verde seco y salida limpia.",
    }),
    crearProductoCatalogo({
        id: "rit-005", slug: "pack-bosque-dorado", nombre: "Pack Bosque Dorado",
        subtitulo: "Regalo editorial para abundancia cotidiana",
        descripcion: "Incluye mezcla herbal cítrica, libreta ritual y guía de siete días para hábitos de apertura y constancia.",
        precioVisible: "€34,00", categoria: "pack-regalo", intencion: "abundancia",
        etiquetas: ["regalo", "edición botica", "7 días"], destacado: true, disponible: true,
        notasSensoriales: "Cítrico luminoso, miel suave y hojas verdes.",
    }),
    crearProductoCatalogo({
        id: "rit-006", slug: "ritual-umbral-sereno", nombre: "Umbral Sereno",
        subtitulo: "Ritual guiado para transiciones de jornada",
        descripcion: "Propuesta editorial para pasar de ritmo laboral a descanso con una secuencia de respiración, aroma y escritura breve.",
        precioVisible: "€17,50", categoria: "ritual-guiado", intencion: "calma",
        etiquetas: ["transición", "respiración", "journaling"], destacado: false, disponible: true,
        notasSensoriales: "Verde húmedo, menta delicada y fondo balsámico.",
    }),
    crearProductoCatalogo({
        id: "rit-007", slug: "cuenco-laton-ritual", nombre: "Cuenco de Latón Ritual",
        subtitulo: "Pieza base para sahumo o mezcla seca",
        descripcion: "Cuenco artesanal para sostener carbón vegetal, resinas o hierbas secas en prácticas de orden ritual del hogar.",
        precioVisible: "€22,00", categoria: "herramienta", intencion: "proteccion",
        etiquetas: ["altar", "artesanal", "metal"], destacado: false, disponible: false,
        notasSensoriales: "Metal cálido y presencia sobria.",
    }),
    crearProductoCatalogo({
        id: "rit-008", slug: "mezcla-hoja-clara", nombre: "Hoja Clara",
        subtitulo: "Mezcla herbal para mañanas de foco",
        descripcion: "Menta suave, romero y limón deshidratado para acompañar planificación ligera y lectura atenta.",
        precioVisible: "€13,20", categoria: "mezcla-herbal", intencion: "claridad",
        etiquetas: ["mañana", "cítrica", "foco"], destacado: false, disponible: true,
        notasSensoriales: "Cítrica verde con final refrescante.",
    }),
    crearProductoCatalogo({
        id: "rit-009", slug: "pack-jardin-interior", nombre: "Pack Jardín Interior",
        subtitulo: "Colección para enraizar rutinas de autocuidado",
        descripcion: "Set con infusión raíz, vela pequeña y guía editorial de presencia corporal para prácticas de 10 minutos.",
        precioVisible: "€29,90", categoria: "pack-regalo", intencion: "enraizamiento",
        etiquetas: ["autocuidado", "pack", "ritual corto"], destacado: false, disponible: true,
        notasSensoriales: "Tierra seca, cacao tenue y herbáceo dulce.",
    }),
    crearProductoCatalogo({
        id: "rit-010", slug: "ritual-mesa-abierta", nombre: "Mesa Abierta",
        subtitulo: "Ritual editorial para activar abundancia práctica",
        descripcion: "Guía para alinear intención, presupuesto y acción semanal con soporte aromático y gesto de cierre consciente.",
        precioVisible: "€18,40", categoria: "ritual-guiado", intencion: "abundancia",
        etiquetas: ["planificación", "abundancia", "claridad comercial"], destacado: true, disponible: true,
        notasSensoriales: "Especias suaves, piel de naranja y hoja verde.",
    }),
];
function crearProductoCatalogo(producto) {
    return {
        ...producto,
        imagen_url: construirImagenProducto(producto),
        imagen_alt: `Lámina editorial de ${producto.nombre}`,
        unidad_comercial: "ud",
        incremento_minimo_venta: 1,
        cantidad_minima_compra: 1,
        tipo_fiscal: "iva_general",
    };
}
function construirImagenProducto(producto) {
    const { fondo, acento, etiquetaCategoria } = resolverPaletaVisual(producto.categoria, producto.intencion);
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" role="img" aria-label="${escaparTextoSvg(producto.nombre)}">
      <defs>
        <linearGradient id="fondo" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${fondo}" />
          <stop offset="100%" stop-color="${acento}" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" rx="36" fill="url(#fondo)" />
      <circle cx="510" cy="116" r="84" fill="rgba(255,255,255,0.14)" />
      <path d="M112 360c64-122 156-183 276-183 26 0 65 8 116 23-88 29-144 80-169 153H112Z" fill="rgba(255,255,255,0.16)" />
      <text x="64" y="118" fill="#f9f6f0" font-family="Georgia, serif" font-size="26">${escaparTextoSvg(etiquetaCategoria)}</text>
      <text x="64" y="194" fill="#ffffff" font-family="Georgia, serif" font-size="42" font-weight="700">${escaparTextoSvg(producto.nombre)}</text>
      <text x="64" y="244" fill="#f5efe4" font-family="Arial, sans-serif" font-size="24">${escaparTextoSvg(producto.subtitulo)}</text>
      <text x="64" y="394" fill="#f8f1e5" font-family="Arial, sans-serif" font-size="22">${escaparTextoSvg(producto.notasSensoriales)}</text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}
function resolverPaletaVisual(categoria, intencion) {
    const fondos = {
        calma: "#7a8f7b",
        enraizamiento: "#8b6851",
        claridad: "#688f83",
        proteccion: "#6f627d",
        abundancia: "#9d7e47",
    };
    const acentos = {
        "mezcla-herbal": "#d5c49b",
        "ritual-guiado": "#caa8d2",
        herramienta: "#7ea0ad",
        "pack-regalo": "#d89b6d",
    };
    const etiquetas = {
        "mezcla-herbal": "Mezcla herbal",
        "ritual-guiado": "Ritual guiado",
        herramienta: "Herramienta ritual",
        "pack-regalo": "Pack regalo",
    };
    return {
        fondo: fondos[intencion],
        acento: acentos[categoria],
        etiquetaCategoria: etiquetas[categoria],
    };
}
function escaparTextoSvg(texto) {
    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
