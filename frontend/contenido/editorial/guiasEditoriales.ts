import dataGuias from "./guiasEditoriales.json";
import dataSubhubs from "./subhubsEditoriales.json";

export type TemaGuiaEditorial = "hierbas" | "rituales" | "colecciones";
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

export type SubhubEditorial = {
  slug: string;
  tema: TemaGuiaEditorial;
  nombre: string;
  h1: string;
  resumen: string;
  seo: SeoGuiaEditorial;
  hubs_relacionados: EnlaceRelacionadoGuia[];
  publicada: boolean;
  indexable: boolean;
};

export type GuiaRelacionada = {
  slug: string;
  titulo: string;
  resumen: string;
  href: string;
  anchor: string;
};

const MAPA_HUB_POR_RUTA: Record<string, HubEditorialRelacionado> = {
  "/hierbas": "hierbas",
  "/rituales": "rituales",
  "/colecciones": "colecciones",
  "/la-botica": "la-botica",
};

const GUIAS_EDITORIALES = dataGuias as GuiaEditorial[];
const SUBHUBS_EDITORIALES = dataSubhubs as SubhubEditorial[];

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

export function obtenerGuiaEditorialPorSlug(slug: string): GuiaEditorial | null {
  return GUIAS_EDITORIALES.find((guia) => guia.slug === slug) ?? null;
}

export function obtenerSubhubsEditorialesIndexables(): SubhubEditorial[] {
  return SUBHUBS_EDITORIALES.filter(esSubhubIndexable).filter((subhub) => cumpleMasaMinimaSubhub(subhub.tema));
}

export function obtenerSubhubEditorialPorSlug(slug: string): SubhubEditorial | null {
  return obtenerSubhubsEditorialesIndexables().find((subhub) => subhub.slug === slug) ?? null;
}

export function obtenerGuiasPorTema(tema: TemaGuiaEditorial): GuiaEditorial[] {
  return obtenerGuiasPublicadasIndexables().filter((guia) => guia.tema === tema);
}

export function obtenerSubhubEditorialParaGuia(guia: GuiaEditorial): SubhubEditorial | null {
  return obtenerSubhubsEditorialesIndexables().find((subhub) => subhub.tema === guia.tema) ?? null;
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

export function obtenerEnlacesCatalogoParaSubhub(subhub: SubhubEditorial): EnlaceRelacionadoGuia[] {
  return deduplicarEnlaces(subhub.hubs_relacionados);
}

function esGuiaPublicadaIndexable(guia: GuiaEditorial): boolean {
  return guia.publicada && guia.indexable;
}

function esSubhubIndexable(subhub: SubhubEditorial): boolean {
  return subhub.publicada && subhub.indexable;
}

function cumpleMasaMinimaSubhub(tema: TemaGuiaEditorial): boolean {
  const guias = obtenerGuiasPorTema(tema);
  if (guias.length >= 2) {
    return true;
  }

  if (guias.length !== 1) {
    return false;
  }

  const [guia] = guias;
  const hubs = guia.relaciones.hubs_relacionados.length;
  const fichas = Object.values(guia.relaciones.fichas_relacionadas).flat().length;
  return hubs >= 2 && fichas >= 2;
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
