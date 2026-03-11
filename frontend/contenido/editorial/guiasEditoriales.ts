import dataGuias from "./guiasEditoriales.json";

export type TemaGuiaEditorial = "hierbas" | "rituales" | "colecciones";
export type SegmentoGuiaEditorial = "todas" | TemaGuiaEditorial;
export type HubEditorialRelacionado = "hierbas" | "rituales" | "colecciones" | "la-botica";
export type TipoFichaCatalogo = "hierbas" | "rituales" | "colecciones";

export type SeccionGuiaEditorial = {
  titulo: string;
  parrafos: string[];
};

export type EnlaceRelacionadoGuia = {
  href: string;
  anchor: string;
};

export type FichaRelacionadaGuia = {
  slug: string;
  anchor: string;
};

export type RelacionesGuiaEditorial = {
  hubs_relacionados: EnlaceRelacionadoGuia[];
  fichas_relacionadas: Record<TipoFichaCatalogo, FichaRelacionadaGuia[]>;
  prioridad?: number;
};

export type SeoGuiaEditorial = {
  title: string;
  description: string;
};

export type GuiaEditorial = {
  slug: string;
  titulo: string;
  h1: string;
  resumen: string;
  publicada: boolean;
  indexable: boolean;
  tema: TemaGuiaEditorial;
  fecha_publicacion: string;
  seo: SeoGuiaEditorial;
  secciones: SeccionGuiaEditorial[];
  relaciones: RelacionesGuiaEditorial;
};

export type GuiaRelacionada = {
  slug: string;
  titulo: string;
  resumen: string;
  href: string;
  anchor: string;
};

export type SegmentoGuiasResumen = {
  segmento: SegmentoGuiaEditorial;
  etiqueta: string;
  descripcion: string;
  conteo: number;
};

const MAPA_HUB_POR_RUTA: Record<string, HubEditorialRelacionado> = {
  "/hierbas": "hierbas",
  "/rituales": "rituales",
  "/colecciones": "colecciones",
  "/la-botica": "la-botica",
};

const GUIAS_EDITORIALES = dataGuias as GuiaEditorial[];

const ETIQUETAS_TEMA: Record<TemaGuiaEditorial, string> = {
  hierbas: "Hierbas",
  rituales: "Rituales",
  colecciones: "Colecciones",
};

const DESCRIPCIONES_TEMA: Record<TemaGuiaEditorial, string> = {
  hierbas: "Guías para elegir plantas y mezclas con intención editorial.",
  rituales: "Secuencias prácticas para sostener rituales realistas.",
  colecciones: "Recorridos para seleccionar colecciones según contexto.",
};

export const METADATA_HUB_GUIAS = {
  rutaCanonical: "/guias",
  title: "Guías editoriales conectadas al catálogo | La Botica de la Bruja Lore",
  description:
    "Explora guías editoriales de La Botica de la Bruja Lore para elegir hierbas, rituales y colecciones con criterio práctico y tono humano.",
  h1: "Guías editoriales para navegar la botica con criterio",
};

export const INTRO_HUB_GUIAS = [
  "Este espacio reúne guías publicadas para conectar intención, contexto editorial y selección de catálogo sin perder claridad.",
  "Cada guía propone un recorrido aplicable: qué observar, cómo decidir y qué rutas del sitio visitar después para seguir profundizando.",
];

export function obtenerGuiasPublicadasIndexables(): GuiaEditorial[] {
  return GUIAS_EDITORIALES.filter(esGuiaPublicadaIndexable);
}

export function obtenerResumenSegmentosGuias(): SegmentoGuiasResumen[] {
  const guias = obtenerGuiasPublicadasIndexables();
  const resumenTemas = (Object.keys(ETIQUETAS_TEMA) as TemaGuiaEditorial[]).map((tema) => ({
    segmento: tema,
    etiqueta: ETIQUETAS_TEMA[tema],
    descripcion: DESCRIPCIONES_TEMA[tema],
    conteo: guias.filter((guia) => guia.tema === tema).length,
  }));

  return [
    {
      segmento: "todas",
      etiqueta: "Todas",
      descripcion: "Vista editorial completa de guías indexables.",
      conteo: guias.length,
    },
    ...resumenTemas,
  ];
}

export function resolverSegmentoGuias(valor: string | undefined): SegmentoGuiaEditorial {
  if (!valor) {
    return "todas";
  }

  return valor in ETIQUETAS_TEMA ? (valor as TemaGuiaEditorial) : "todas";
}

export function obtenerGuiasPorSegmento(segmento: SegmentoGuiaEditorial): GuiaEditorial[] {
  const guias = obtenerGuiasPublicadasIndexables();

  if (segmento === "todas") {
    return guias;
  }

  return guias.filter((guia) => guia.tema === segmento);
}

export function obtenerGuiasAgrupadasPorTema(): Array<{
  tema: TemaGuiaEditorial;
  etiqueta: string;
  descripcion: string;
  guias: GuiaEditorial[];
}> {
  return (Object.keys(ETIQUETAS_TEMA) as TemaGuiaEditorial[])
    .map((tema) => ({
      tema,
      etiqueta: ETIQUETAS_TEMA[tema],
      descripcion: DESCRIPCIONES_TEMA[tema],
      guias: obtenerGuiasPorSegmento(tema),
    }))
    .filter((grupo) => grupo.guias.length > 0);
}

export function obtenerGuiaEditorialPorSlug(slug: string): GuiaEditorial | null {
  return GUIAS_EDITORIALES.find((guia) => guia.slug === slug) ?? null;
}

export function obtenerGuiasRelacionadasPorHub(hub: HubEditorialRelacionado, limite = 3): GuiaRelacionada[] {
  return obtenerGuiasPublicadasIndexables()
    .filter((guia) => guia.relaciones.hubs_relacionados.some((enlace) => resolverHubDesdeRuta(enlace.href) === hub))
    .map((guia) => ({
      slug: guia.slug,
      titulo: guia.titulo,
      resumen: guia.resumen,
      href: `/guias/${guia.slug}`,
      anchor: `Leer la guía: ${guia.titulo}`,
      prioridad: guia.relaciones.prioridad ?? 0,
    }))
    .sort((a, b) => b.prioridad - a.prioridad)
    .slice(0, limite)
    .map(({ prioridad: _, ...guia }) => guia);
}

export function obtenerGuiasRelacionadasPorFicha(args: {
  tipoFicha: TipoFichaCatalogo;
  slug: string;
  limite?: number;
}): GuiaRelacionada[] {
  const { tipoFicha, slug, limite = 2 } = args;

  return obtenerGuiasPublicadasIndexables()
    .filter((guia) => guia.relaciones.fichas_relacionadas[tipoFicha].some((ficha) => ficha.slug === slug))
    .map((guia) => {
      const ficha = guia.relaciones.fichas_relacionadas[tipoFicha].find((item) => item.slug === slug);
      return {
        slug: guia.slug,
        titulo: guia.titulo,
        resumen: guia.resumen,
        href: `/guias/${guia.slug}`,
        anchor: ficha?.anchor ?? `Leer guía relacionada: ${guia.titulo}`,
        prioridad: guia.relaciones.prioridad ?? 0,
      };
    })
    .sort((a, b) => b.prioridad - a.prioridad)
    .slice(0, limite)
    .map(({ prioridad: _, ...guia }) => guia);
}

export function obtenerEnlacesCatalogoParaGuia(guia: GuiaEditorial): EnlaceRelacionadoGuia[] {
  const enlaces = guia.relaciones.hubs_relacionados;
  const enlacesUnicos = new Map<string, EnlaceRelacionadoGuia>();

  for (const enlace of enlaces) {
    if (!enlacesUnicos.has(enlace.href)) {
      enlacesUnicos.set(enlace.href, enlace);
    }
  }

  return Array.from(enlacesUnicos.values());
}

export function obtenerEnlacesFichaParaGuia(guia: GuiaEditorial): EnlaceRelacionadoGuia[] {
  const enlaces = [
    ...mapearFichasAEnlaces("hierbas", guia.relaciones.fichas_relacionadas.hierbas),
    ...mapearFichasAEnlaces("rituales", guia.relaciones.fichas_relacionadas.rituales),
    ...mapearFichasAEnlaces("colecciones", guia.relaciones.fichas_relacionadas.colecciones),
  ];

  return deduplicarEnlaces(enlaces);
}

function esGuiaPublicadaIndexable(guia: GuiaEditorial): boolean {
  return guia.publicada && guia.indexable;
}

function resolverHubDesdeRuta(ruta: string): HubEditorialRelacionado | null {
  return MAPA_HUB_POR_RUTA[ruta] ?? null;
}

function mapearFichasAEnlaces(tipo: TipoFichaCatalogo, fichas: FichaRelacionadaGuia[]): EnlaceRelacionadoGuia[] {
  return fichas.map((ficha) => ({
    href: `/${tipo}/${ficha.slug}`,
    anchor: ficha.anchor,
  }));
}

function deduplicarEnlaces(enlaces: EnlaceRelacionadoGuia[]): EnlaceRelacionadoGuia[] {
  const unicos = new Map<string, EnlaceRelacionadoGuia>();

  for (const enlace of enlaces) {
    if (!unicos.has(enlace.href)) {
      unicos.set(enlace.href, enlace);
    }
  }

  return Array.from(unicos.values());
}
