export type CtaMarca = {
  texto: string;
  href: string;
};

export type HeroMarca = {
  etiqueta: string;
  titulo: string;
  descripcion: string;
  nota: string;
  ctaPrincipal: CtaMarca;
  ctaSecundaria: CtaMarca;
};

export type PasoCuraduria = {
  titulo: string;
  descripcion: string;
};

export type PrincipioBotica = {
  nombre: string;
  descripcion: string;
};

export type PreguntaMarca = {
  pregunta: string;
  respuesta: string;
};

export const HERO_MARCA: HeroMarca = {
  etiqueta: "La Botica · identidad editorial y comercial",
  titulo: "Una botica contemporánea con criterio artesanal",
  descripcion:
    "La Botica de la Bruja Lore selecciona hierbas, rituales y piezas de apoyo para convertir una intención cotidiana en un gesto cuidado, vendible y coherente.",
  nota: "No prometemos milagros: trabajamos con selección honesta, contexto editorial claro y experiencia de compra guiada.",
  ctaPrincipal: { texto: "Explorar colecciones", href: "/colecciones" },
  ctaSecundaria: { texto: "Preparar un encargo", href: "/encargo" },
};

export const MANIFIESTO_BOTICA =
  "Creemos en una forma de compra donde la estética no oculta la utilidad: cada colección nace de escuchar una intención real, traducirla en una atmósfera ritual y ofrecer piezas elegidas con sensibilidad botánica y lenguaje responsable.";

export const PASOS_CURADURIA: PasoCuraduria[] = [
  {
    titulo: "1. Escucha de intención",
    descripcion:
      "Partimos de una necesidad concreta —calma, enfoque, protección o celebración— para evitar catálogos difusos y recomendar con propósito.",
  },
  {
    titulo: "2. Selección por lote y afinidad",
    descripcion:
      "Combinamos notas aromáticas, textura, formato y uso ritual para construir colecciones consistentes entre sí, no listas sueltas de productos.",
  },
  {
    titulo: "3. Edición comercial con guía",
    descripcion:
      "Cada propuesta se presenta con contexto editorial breve, recomendaciones de uso y siguiente paso claro hacia catálogo o encargo.",
  },
];

export const PRINCIPIOS_CASA: PrincipioBotica[] = [
  {
    nombre: "Cuidado",
    descripcion: "Preparación atenta del pedido para conservar aroma, presencia y sensación artesanal.",
  },
  {
    nombre: "Intención",
    descripcion: "Toda colección responde a un estado emocional o ritual concreto, no a relleno comercial.",
  },
  {
    nombre: "Selección",
    descripcion: "Curaduría en lotes pequeños para sostener coherencia entre calidad, estética y narrativa.",
  },
  {
    nombre: "Artesanía",
    descripcion: "Procesos manuales y criterio humano en empaques, combinaciones y recomendaciones.",
  },
  {
    nombre: "Atmósfera",
    descripcion: "Una experiencia que avanza de lo botánico a lo ritual sin perder claridad de uso.",
  },
  {
    nombre: "Honestidad",
    descripcion: "Lenguaje responsable, sin claims médicos ni promesas que no podamos sostener.",
  },
];

export const EXPERIENCIA_ENCARGO = {
  titulo: "Encargo artesanal, sin fricción",
  descripcion:
    "Si necesitas una selección más personalizada, el flujo de encargo te permite llegar con referencias claras y recibir una propuesta cuidada según tu intención, presupuesto y atmósfera buscada.",
  puntos: [
    "Puedes iniciar desde una ficha o desde cero en /encargo.",
    "La cesta ritual te ayuda a reunir piezas antes de enviar la solicitud.",
    "La respuesta mantiene el mismo tono editorial-comercial de la botica.",
  ],
};

export const NOTAS_COMPOSICION = {
  titulo: "Materiales y notas de composición editorial",
  descripcion:
    "Trabajamos con hierbas secas, resinas, inciensos y soportes rituales seleccionados por afinidad sensorial. En cada ficha priorizamos origen, formato y combinación recomendada para que elijas con seguridad.",
};

export const FAQ_MARCA: PreguntaMarca[] = [
  {
    pregunta: "¿La botica sustituye asesoramiento de salud?",
    respuesta:
      "No. Nuestro contenido es editorial y ritual, orientado a experiencia sensorial y compra informada; nunca reemplaza orientación profesional sanitaria.",
  },
  {
    pregunta: "¿Cómo sé qué colección elegir si estoy empezando?",
    respuesta:
      "Puedes entrar por intención en /colecciones y usar filtros simples. Si prefieres acompañamiento, inicia un encargo y te guiamos con una propuesta concreta.",
  },
  {
    pregunta: "¿Puedo pedir una combinación fuera del catálogo visible?",
    respuesta:
      "Sí. El flujo /encargo está pensado para solicitudes artesanales y ajustes por atmósfera, formato o presupuesto.",
  },
];

export const CTA_CIERRE_MARCA = {
  titulo: "Cuando la intención está clara, elegir se vuelve simple",
  descripcion:
    "Recorre el catálogo para descubrir combinaciones listas o abre un encargo artesanal si buscas una propuesta más personalizada.",
  ctas: [
    { texto: "Ir a colecciones", href: "/colecciones" },
    { texto: "Abrir encargo artesanal", href: "/encargo" },
  ] as CtaMarca[],
};
