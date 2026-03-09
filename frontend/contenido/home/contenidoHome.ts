export type EnlaceSeccion = {
  id: string;
  etiqueta: string;
};

export type HeroHome = {
  etiqueta: string;
  titulo: string;
  descripcion: string;
  nota: string;
  ctaPrimaria: { texto: string; href: string };
  ctaSecundaria: { texto: string; href: string };
};

export type IntencionRitual = {
  id: string;
  nombre: string;
  gancho: string;
  descripcion: string;
  pasos: string[];
};

export type PreguntaFaq = {
  pregunta: string;
  respuesta: string;
};

export const ENLACES_SECCIONES: EnlaceSeccion[] = [
  { id: "alquimia-deseo", etiqueta: "Alquimia del Deseo" },
  { id: "intenciones", etiqueta: "Intenciones" },
  { id: "como-elegir", etiqueta: "Cómo elegir" },
  { id: "confianza", etiqueta: "Confianza" },
  { id: "faq", etiqueta: "FAQ" },
];

export const HERO_HOME: HeroHome = {
  etiqueta: "Botica artesanal · editorial y comercial",
  titulo: "La Botica de la Bruja Lore",
  descripcion:
    "Hierbas a granel, rituales sensoriales y piezas seleccionadas para transformar una intención en una experiencia cuidada, elegante y real.",
  nota: "Sin promesas milagrosas: selección honesta, guía clara y atmósfera de botica contemporánea.",
  ctaPrimaria: { texto: "Explorar hierbas", href: "/hierbas" },
  ctaSecundaria: { texto: "Descubrir rituales", href: "/rituales" },
};

export const BLOQUE_ALQUIMIA = {
  titulo: "Alquimia del Deseo",
  descripcion:
    "Nuestra alquimia nace de unir lo vegetal con la intención. Cada propuesta combina contexto editorial, recomendaciones de uso y objetos de apoyo para crear un gesto cotidiano con significado.",
  puntos: [
    "Selecciones por atmósfera: suave, envolvente, protectora o expansiva.",
    "Rituales breves para mañana, tarde o cierre del día.",
    "Narrativa comercial sin perder raíz botánica ni lenguaje claro.",
  ],
};

export const INTENCIONES_DESTACADAS: IntencionRitual[] = [
  {
    id: "deseo",
    nombre: "Deseo",
    gancho: "Activar presencia y magnetismo personal.",
    descripcion:
      "Combinaciones florales, especiadas y cálidas para rituales de conexión contigo y con aquello que deseas invitar.",
    pasos: ["Define una intención concreta.", "Enciende una vela suave.", "Acompaña con infusión aromática."],
  },
  {
    id: "calma",
    nombre: "Calma",
    gancho: "Bajar ritmo y limpiar ruido mental.",
    descripcion:
      "Mezclas herbales, sahumerios delicados y textos guía para transitar del día activo a un estado más sereno.",
    pasos: ["Ventila tu espacio.", "Elige una mezcla de notas verdes.", "Respira durante tres minutos."],
  },
  {
    id: "proteccion",
    nombre: "Protección",
    gancho: "Crear límites energéticos y orden ritual.",
    descripcion:
      "Elementos para altar, limpieza simbólica y cuidado del entorno doméstico con una estética sobria y artesanal.",
    pasos: ["Ordena el altar o mesa ritual.", "Usa una limpieza breve por humo o aroma.", "Cierra con una afirmación sencilla."],
  },
  {
    id: "abundancia",
    nombre: "Abundancia",
    gancho: "Cultivar apertura, enfoque y constancia.",
    descripcion:
      "Rutas de trabajo personal con hierbas, escritura intencional y herramientas simbólicas de expansión.",
    pasos: ["Escribe una meta alcanzable.", "Prepara una infusión de enfoque.", "Repite tu práctica siete días."],
  },
];

export const PASOS_RITUAL = [
  {
    titulo: "1. Elige tu intención",
    descripcion:
      "Empieza por cómo quieres sentirte: calma, deseo, protección o abundancia. Desde ahí filtramos recomendaciones claras.",
  },
  {
    titulo: "2. Selecciona tu combinación",
    descripcion:
      "Cruzamos planta, formato ritual y contexto editorial para que entiendas qué elegir y por qué.",
  },
  {
    titulo: "3. Crea tu momento",
    descripcion:
      "Recibe una guía breve para integrar el ritual en tu rutina sin fricción ni complejidad innecesaria.",
  },
];

export const BLOQUE_CONFIANZA = [
  "Curaduría artesanal por lotes pequeños y revisión de calidad en origen.",
  "Empaques preparados con cuidado para conservar aroma, textura y presencia.",
  "Envíos con seguimiento y atención humana para dudas de selección.",
  "Lenguaje comercial responsable: sin claims sanitarios ni promesas imposibles.",
];

export const FAQ_HOME: PreguntaFaq[] = [
  {
    pregunta: "¿Necesito experiencia previa para empezar un ritual?",
    respuesta:
      "No. Cada intención incluye una guía breve para que puedas comenzar con pasos simples y adaptarlos a tu ritmo.",
  },
  {
    pregunta: "¿Qué diferencia hay entre contenido editorial y productos?",
    respuesta:
      "El contenido editorial te orienta y contextualiza. El plano comercial te permite elegir piezas concretas para llevar esa intención a la práctica.",
  },
  {
    pregunta: "¿Las sugerencias sustituyen asesoramiento médico?",
    respuesta:
      "No. La Botica comparte experiencias sensoriales y rituales de bienestar cotidiano, sin reemplazar orientación profesional de salud.",
  },
];

export const CTA_FINAL = {
  titulo: "Tu ritual puede empezar hoy",
  descripcion:
    "Explora la línea herbal y la colección de rituales para construir una práctica personal con estética cuidada y sentido comercial real.",
  cta: { texto: "Comenzar recorrido", href: "/hierbas" },
};
