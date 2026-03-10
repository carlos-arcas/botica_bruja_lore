export type EnlaceContextual = {
  href: string;
  anchor: string;
  descripcion: string;
};

export type BloqueEnlazadoContextual = {
  titulo: string;
  descripcion: string;
  enlaces: EnlaceContextual[];
};

export const BLOQUES_ENLAZADO_CATALOGO: Record<"hierbas" | "rituales" | "colecciones", BloqueEnlazadoContextual> = {
  hierbas: {
    titulo: "Exploración relacionada desde hierbas",
    descripcion:
      "Amplía tu recorrido herbal con rutas editoriales y comerciales indexables para mantener una navegación temática coherente.",
    enlaces: [
      {
        href: "/rituales",
        anchor: "Ir al listado de rituales conectados por intención",
        descripcion: "Conecta cada planta con prácticas publicadas y contexto ritual aplicable.",
      },
      {
        href: "/colecciones",
        anchor: "Explorar colecciones rituales del catálogo",
        descripcion: "Consulta formatos y piezas listos para una selección comercial concreta.",
      },
      {
        href: "/la-botica",
        anchor: "Leer la filosofía editorial de La Botica",
        descripcion: "Entiende el criterio de curaduría antes de profundizar en fichas específicas.",
      },
      {
        href: "/guias",
        anchor: "Abrir el hub de guías editoriales publicadas",
        descripcion: "Encuentra recorridos temáticos para conectar plantas, rituales y colecciones.",
      },
    ],
  },
  rituales: {
    titulo: "Exploración relacionada desde rituales",
    descripcion:
      "Refuerza la conexión entre conocimiento herbal, rutas rituales y catálogo comercial sin depender de rutas transaccionales.",
    enlaces: [
      {
        href: "/hierbas",
        anchor: "Revisar fichas de hierbas vinculadas a rituales",
        descripcion: "Accede al plano botánico de cada intención para elegir con más criterio.",
      },
      {
        href: "/colecciones",
        anchor: "Ver colecciones rituales preparadas",
        descripcion: "Pasa a la selección comercial cuando ya tengas clara la intención.",
      },
      {
        href: "/la-botica",
        anchor: "Conocer el proceso de curaduría editorial",
        descripcion: "Consulta cómo se seleccionan materiales, guías y piezas de apoyo.",
      },
      {
        href: "/guias",
        anchor: "Ir al hub de guías con rutas temáticas de apoyo",
        descripcion: "Completa el contexto antes de pasar a una selección comercial final.",
      },
    ],
  },
  colecciones: {
    titulo: "Exploración relacionada desde colecciones",
    descripcion:
      "Completa tu decisión de compra conectando con secciones públicas indexables que amplían contexto y comparativa.",
    enlaces: [
      {
        href: "/hierbas",
        anchor: "Entrar al listado de hierbas a granel",
        descripcion: "Contrasta piezas comerciales con fichas herbales de referencia.",
      },
      {
        href: "/rituales",
        anchor: "Consultar rituales conectados por intención",
        descripcion: "Relaciona el producto con prácticas publicadas antes de cerrar una selección.",
      },
      {
        href: "/la-botica",
        anchor: "Explorar la propuesta de marca y curaduría",
        descripcion: "Revisa el marco editorial para mantener coherencia en tu recorrido.",
      },
      {
        href: "/guias",
        anchor: "Consultar guías para decidir por intención",
        descripcion: "Aterriza dudas de elección con contenidos editoriales conectados al catálogo.",
      },
    ],
  },
};
