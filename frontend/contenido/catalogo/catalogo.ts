export type IntencionCatalogo = "calma" | "enraizamiento" | "claridad" | "proteccion" | "abundancia";
export type CategoriaCatalogo = "mezcla-herbal" | "ritual-guiado" | "herramienta" | "pack-regalo";

export type ProductoCatalogo = {
  id: string;
  slug: string;
  nombre: string;
  subtitulo: string;
  descripcion: string;
  precioVisible: string;
  categoria: CategoriaCatalogo;
  intencion: IntencionCatalogo;
  etiquetas: string[];
  destacado: boolean;
  disponible: boolean;
  notasSensoriales: string;
};

export type OpcionFiltro = { valor: string; etiqueta: string };

export const OPCIONES_INTENCION: OpcionFiltro[] = [
  { valor: "todas", etiqueta: "Todas las intenciones" },
  { valor: "calma", etiqueta: "Calma" },
  { valor: "enraizamiento", etiqueta: "Enraizamiento" },
  { valor: "claridad", etiqueta: "Claridad" },
  { valor: "proteccion", etiqueta: "Protección" },
  { valor: "abundancia", etiqueta: "Abundancia" },
];

export const OPCIONES_CATEGORIA: OpcionFiltro[] = [
  { valor: "todas", etiqueta: "Todos los formatos" },
  { valor: "mezcla-herbal", etiqueta: "Mezcla herbal" },
  { valor: "ritual-guiado", etiqueta: "Ritual guiado" },
  { valor: "herramienta", etiqueta: "Herramienta" },
  { valor: "pack-regalo", etiqueta: "Pack regalo" },
];

export const PRODUCTOS_CATALOGO: ProductoCatalogo[] = [
  {
    id: "rit-001", slug: "infusion-bruma-lavanda", nombre: "Bruma de Lavanda Serena",
    subtitulo: "Mezcla herbal para desacelerar el cierre del día",
    descripcion: "Flores de lavanda, melisa y cáscara de naranja para una taza aromática que acompaña pausas suaves y respiración consciente.",
    precioVisible: "€14,90", categoria: "mezcla-herbal", intencion: "calma",
    etiquetas: ["infusión", "vespertino", "floral"], destacado: true, disponible: true,
    notasSensoriales: "Floral limpio, cítrico tenue y fondo dulce.",
  },
  {
    id: "rit-002", slug: "ritual-luna-hogar", nombre: "Ritual Luna en Casa",
    subtitulo: "Secuencia breve para devolver armonía al espacio",
    descripcion: "Guía editorial de 15 minutos con sahumo suave, infusión y frase de cierre para ordenar la atmósfera del hogar.",
    precioVisible: "€19,00", categoria: "ritual-guiado", intencion: "proteccion",
    etiquetas: ["hogar", "guía", "limpieza simbólica"], destacado: true, disponible: true,
    notasSensoriales: "Resina ligera, hierba seca y toque amaderado.",
  },
  {
    id: "rit-003", slug: "mezcla-raiz-canela", nombre: "Raíz de Canela y Cacao",
    subtitulo: "Infusión cálida para prácticas de enraizamiento",
    descripcion: "Combinación de canela, cacao nibs y rooibos para acompañar escritura de gratitud y retorno al cuerpo.",
    precioVisible: "€12,50", categoria: "mezcla-herbal", intencion: "enraizamiento",
    etiquetas: ["especiada", "ritual matinal", "sin cafeína"], destacado: false, disponible: true,
    notasSensoriales: "Cálida, tostada y especiada.",
  },
  {
    id: "rit-004", slug: "vela-intencion-clara", nombre: "Vela Intención Clara",
    subtitulo: "Vela botánica para foco y presencia",
    descripcion: "Cera vegetal con romero, salvia y pétalos blancos para acompañar sesiones de planificación o estudio.",
    precioVisible: "€16,00", categoria: "herramienta", intencion: "claridad",
    etiquetas: ["vela", "altar", "concentración"], destacado: true, disponible: true,
    notasSensoriales: "Herbal fresco, verde seco y salida limpia.",
  },
  {
    id: "rit-005", slug: "pack-bosque-dorado", nombre: "Pack Bosque Dorado",
    subtitulo: "Regalo editorial para abundancia cotidiana",
    descripcion: "Incluye mezcla herbal cítrica, libreta ritual y guía de siete días para hábitos de apertura y constancia.",
    precioVisible: "€34,00", categoria: "pack-regalo", intencion: "abundancia",
    etiquetas: ["regalo", "edición botica", "7 días"], destacado: true, disponible: true,
    notasSensoriales: "Cítrico luminoso, miel suave y hojas verdes.",
  },
  {
    id: "rit-006", slug: "ritual-umbral-sereno", nombre: "Umbral Sereno",
    subtitulo: "Ritual guiado para transiciones de jornada",
    descripcion: "Propuesta editorial para pasar de ritmo laboral a descanso con una secuencia de respiración, aroma y escritura breve.",
    precioVisible: "€17,50", categoria: "ritual-guiado", intencion: "calma",
    etiquetas: ["transición", "respiración", "journaling"], destacado: false, disponible: true,
    notasSensoriales: "Verde húmedo, menta delicada y fondo balsámico.",
  },
  {
    id: "rit-007", slug: "cuenco-laton-ritual", nombre: "Cuenco de Latón Ritual",
    subtitulo: "Pieza base para sahumo o mezcla seca",
    descripcion: "Cuenco artesanal para sostener carbón vegetal, resinas o hierbas secas en prácticas de orden ritual del hogar.",
    precioVisible: "€22,00", categoria: "herramienta", intencion: "proteccion",
    etiquetas: ["altar", "artesanal", "metal"], destacado: false, disponible: false,
    notasSensoriales: "Metal cálido y presencia sobria.",
  },
  {
    id: "rit-008", slug: "mezcla-hoja-clara", nombre: "Hoja Clara",
    subtitulo: "Mezcla herbal para mañanas de foco",
    descripcion: "Menta suave, romero y limón deshidratado para acompañar planificación ligera y lectura atenta.",
    precioVisible: "€13,20", categoria: "mezcla-herbal", intencion: "claridad",
    etiquetas: ["mañana", "cítrica", "foco"], destacado: false, disponible: true,
    notasSensoriales: "Cítrica verde con final refrescante.",
  },
  {
    id: "rit-009", slug: "pack-jardin-interior", nombre: "Pack Jardín Interior",
    subtitulo: "Colección para enraizar rutinas de autocuidado",
    descripcion: "Set con infusión raíz, vela pequeña y guía editorial de presencia corporal para prácticas de 10 minutos.",
    precioVisible: "€29,90", categoria: "pack-regalo", intencion: "enraizamiento",
    etiquetas: ["autocuidado", "pack", "ritual corto"], destacado: false, disponible: true,
    notasSensoriales: "Tierra seca, cacao tenue y herbáceo dulce.",
  },
  {
    id: "rit-010", slug: "ritual-mesa-abierta", nombre: "Mesa Abierta",
    subtitulo: "Ritual editorial para activar abundancia práctica",
    descripcion: "Guía para alinear intención, presupuesto y acción semanal con soporte aromático y gesto de cierre consciente.",
    precioVisible: "€18,40", categoria: "ritual-guiado", intencion: "abundancia",
    etiquetas: ["planificación", "abundancia", "claridad comercial"], destacado: true, disponible: true,
    notasSensoriales: "Especias suaves, piel de naranja y hoja verde.",
  },
];
