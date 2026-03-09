import { CategoriaCatalogo, IntencionCatalogo, PRODUCTOS_CATALOGO, ProductoCatalogo } from "./catalogo";

const ETIQUETAS_INTENCION: Record<IntencionCatalogo, string> = {
  calma: "Calma",
  enraizamiento: "Enraizamiento",
  claridad: "Claridad",
  proteccion: "Protección",
  abundancia: "Abundancia",
};

const ETIQUETAS_CATEGORIA: Record<CategoriaCatalogo, string> = {
  "mezcla-herbal": "Mezcla herbal",
  "ritual-guiado": "Ritual guiado",
  herramienta: "Herramienta",
  "pack-regalo": "Pack regalo",
};

const GUIAS_RITUAL: Record<IntencionCatalogo, { titulo: string; pasos: string[] }> = {
  calma: {
    titulo: "Ritual de cierre suave",
    pasos: [
      "Prepara una taza y enciende una luz cálida para marcar el cambio de ritmo.",
      "Respira tres veces y deja que el aroma abra espacio a una pausa consciente.",
      "Cierra el momento con una intención breve de descanso y presencia.",
    ],
  },
  enraizamiento: {
    titulo: "Ritual de presencia corporal",
    pasos: [
      "Sirve la mezcla en una taza de base amplia y sostén el calor entre las manos.",
      "Nombra tres cosas por las que agradeces hoy antes del primer sorbo.",
      "Anota una acción concreta para cuidar tu energía mañana.",
    ],
  },
  claridad: {
    titulo: "Ritual de enfoque delicado",
    pasos: [
      "Ordena tu superficie de trabajo para crear un inicio limpio.",
      "Activa el producto y define una única prioridad para la siguiente hora.",
      "Cierra con una micro revisión: qué funcionó y qué ajustarás mañana.",
    ],
  },
  proteccion: {
    titulo: "Ritual para cuidar el espacio",
    pasos: [
      "Ventila el lugar unos minutos y abre una ventana de renovación.",
      "Recorre el ambiente de forma pausada, llevando tu atención a cada rincón.",
      "Finaliza con una frase de cuidado para tu hogar o altar cotidiano.",
    ],
  },
  abundancia: {
    titulo: "Ritual de apertura y constancia",
    pasos: [
      "Comienza nombrando lo que ya está floreciendo en tu semana.",
      "Usa el producto como ancla para una práctica de diez minutos sin interrupciones.",
      "Define un compromiso pequeño y sostenible para sostener tu avance.",
    ],
  },
};

export function obtenerProductoPorSlug(slug: string, productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO): ProductoCatalogo | null {
  const slugNormalizado = slug.trim().toLowerCase();
  return productos.find((producto) => producto.slug === slugNormalizado) ?? null;
}

export function obtenerProductosRelacionados(
  productoBase: ProductoCatalogo,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
  limite = 4,
): ProductoCatalogo[] {
  const candidatos = productos.filter((producto) => producto.id !== productoBase.id);
  const mismosPorIntencion = candidatos.filter((producto) => producto.intencion === productoBase.intencion);
  const mismosPorCategoria = candidatos.filter((producto) => producto.categoria === productoBase.categoria);
  const destacados = candidatos.filter((producto) => producto.destacado);
  const ordenados = [...mismosPorIntencion, ...mismosPorCategoria, ...destacados, ...candidatos];

  return deduplicarPorId(ordenados).slice(0, limite);
}

export function obtenerEtiquetaIntencion(intencion: IntencionCatalogo): string {
  return ETIQUETAS_INTENCION[intencion];
}

export function obtenerEtiquetaCategoria(categoria: CategoriaCatalogo): string {
  return ETIQUETAS_CATEGORIA[categoria];
}

export function obtenerGuiaRitual(intencion: IntencionCatalogo): { titulo: string; pasos: string[] } {
  return GUIAS_RITUAL[intencion];
}

function deduplicarPorId(productos: ProductoCatalogo[]): ProductoCatalogo[] {
  const ids = new Set<string>();
  return productos.filter((producto) => {
    if (ids.has(producto.id)) {
      return false;
    }

    ids.add(producto.id);
    return true;
  });
}
