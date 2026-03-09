export type AccionMarca = {
  texto: string;
  href: string;
};

export type HeroMarca = {
  etiqueta: string;
  titulo: string;
  descripcion: string;
  nota: string;
  acciones: [AccionMarca, AccionMarca];
};

export type PasoCuraduria = {
  titulo: string;
  descripcion: string;
};

export type PrincipioBotica = {
  nombre: string;
  descripcion: string;
};

export type NotaComposicion = {
  etiqueta: string;
  detalle: string;
};

export type PreguntaMarca = {
  pregunta: string;
  respuesta: string;
};

export const METADATA_LA_BOTICA = {
  title: "La Botica | Filosofía artesanal y criterio editorial",
  description:
    "Conoce cómo La Botica de la Bruja Lore selecciona colecciones y rituales: manifiesto, principios de la casa y ruta directa a catálogo y encargo.",
};

export const HERO_MARCA: HeroMarca = {
  etiqueta: "La casa editorial de la botica",
  titulo: "Una botica artesanal con criterio comercial y voz propia",
  descripcion:
    "La Botica de la Bruja Lore selecciona hierbas, rituales y piezas de acompañamiento para convertir una intención en un gesto cotidiano claro, bello y aplicable.",
  nota: "Vendemos con honestidad: sin claims médicos y sin promesas imposibles.",
  acciones: [
    { texto: "Explorar colecciones", href: "/colecciones" },
    { texto: "Preparar un encargo", href: "/encargo" },
  ],
};

export const MANIFIESTO_BOTICA: string[] = [
  "La botica nace de una idea simple: que lo ritual también puede ser útil, ordenado y comercialmente claro.",
  "Cada colección equilibra belleza sensorial, contexto editorial y decisión de compra sin ruido místico innecesario.",
  "Preferimos pocas piezas bien explicadas frente a catálogos confusos o promesas grandilocuentes.",
];

export const PASOS_CURADURIA: PasoCuraduria[] = [
  {
    titulo: "1. Escucha de intención",
    descripcion:
      "Partimos de la necesidad real del momento: descanso, foco, limpieza del espacio o expansión personal.",
  },
  {
    titulo: "2. Selección por lotes y atmósfera",
    descripcion:
      "Curamos mezclas y objetos en lotes pequeños, revisando perfil aromático, presencia visual y compatibilidad ritual.",
  },
  {
    titulo: "3. Traducción editorial",
    descripcion:
      "Acompañamos cada propuesta con lenguaje práctico para que la elección sea comprensible y accionable.",
  },
  {
    titulo: "4. Continuidad comercial",
    descripcion:
      "Desde la narrativa llevamos al catálogo o al encargo, sin fricción y con expectativas transparentes.",
  },
];

export const PRINCIPIOS_BOTICA: PrincipioBotica[] = [
  {
    nombre: "Cuidado",
    descripcion: "Tratamos cada selección como una pieza de uso íntimo: detalle en origen, empaque y recomendación.",
  },
  {
    nombre: "Intención",
    descripcion: "No vendemos acumulación: proponemos combinaciones con propósito y contexto.",
  },
  {
    nombre: "Selección",
    descripcion: "Curaduría acotada y coherente, en lugar de amplitud sin criterio.",
  },
  {
    nombre: "Artesanía",
    descripcion: "Lotes pequeños, revisión manual y narrativa alineada con una experiencia real de botica.",
  },
  {
    nombre: "Atmósfera",
    descripcion: "Cada ritual cuida el espacio, la textura y el ritmo para sostener una práctica cotidiana.",
  },
  {
    nombre: "Honestidad",
    descripcion: "Comunicación responsable: sin exageraciones terapéuticas ni promesas mágicas.",
  },
];

export const EXPERIENCIA_ENCARGO = {
  titulo: "Encargo artesanal con guía humana",
  descripcion:
    "Cuando una colección necesita ajuste fino, abrimos una solicitud de encargo. Recibimos tu contexto, proponemos una ruta y te devolvemos una recomendación concreta para cerrar la elección.",
  puntos: [
    "Formulario breve con intención, formato y notas del momento.",
    "Resumen claro para compartir por canal de contacto disponible.",
    "Respuesta alineada con la estética y criterio de la botica.",
  ],
};

export const NOTAS_COMPOSICION: NotaComposicion[] = [
  {
    etiqueta: "Materias botánicas",
    detalle: "Hojas, flores, resinas e infusiones seleccionadas por perfil sensorial y coherencia ritual.",
  },
  {
    etiqueta: "Objetos de apoyo",
    detalle: "Velas, inciensos, utensilios y piezas de altar de presencia sobria y uso práctico.",
  },
  {
    etiqueta: "Notas editoriales",
    detalle: "Cada ficha incluye lenguaje de uso, contexto de intención y límites claros de lo que ofrece.",
  },
];

export const FAQ_MARCA: PreguntaMarca[] = [
  {
    pregunta: "¿La botica vende bienestar o resultados garantizados?",
    respuesta:
      "No. Ofrecemos una experiencia editorial-comercial para acompañar rituales cotidianos, sin garantías de resultado ni sustitución de asesoramiento profesional.",
  },
  {
    pregunta: "¿Cómo sé si debo ir a catálogo o solicitar encargo?",
    respuesta:
      "Si ya identificas una intención y formato, catálogo te permite elegir rápido. Si necesitas una combinación más afinada, encargo te guía paso a paso.",
  },
  {
    pregunta: "¿Puedo usar la página de marca como mapa de compra?",
    respuesta:
      "Sí. Esta página conecta narrativa, criterios de selección y rutas directas a colecciones y encargo para que decidas con contexto.",
  },
];

export const CTA_MARCA = {
  titulo: "Pasa de la historia a la elección",
  descripcion: "Recorre colecciones curadas o abre un encargo artesanal para construir tu ruta ritual con apoyo real.",
  primaria: { texto: "Ver colecciones", href: "/colecciones" },
  secundaria: { texto: "Solicitar encargo", href: "/encargo" },
};
