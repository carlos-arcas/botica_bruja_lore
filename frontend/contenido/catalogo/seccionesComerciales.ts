export type SlugSeccionComercial =
  | "botica-natural"
  | "velas-e-incienso"
  | "minerales-y-energia"
  | "herramientas-esotericas";

export type ConfiguracionSeccionComercial = {
  slug: SlugSeccionComercial;
  tituloCatalogo: string;
  descripcionCatalogo: string;
  etiquetaFiltros?: string;
};

const CONFIGURACION_SECCIONES: Record<SlugSeccionComercial, ConfiguracionSeccionComercial> = {
  "botica-natural": {
    slug: "botica-natural",
    tituloCatalogo: "Productos de Botica Natural",
    descripcionCatalogo: "Seleccion herbal publica conectada con el catalogo de la botica.",
    etiquetaFiltros: "Filtros de Botica Natural",
  },
  "velas-e-incienso": {
    slug: "velas-e-incienso",
    tituloCatalogo: "Velas e incienso",
    descripcionCatalogo: "Piezas aromaticas y de ambientacion ritual para preparar espacios con criterio.",
  },
  "minerales-y-energia": {
    slug: "minerales-y-energia",
    tituloCatalogo: "Minerales y energia",
    descripcionCatalogo: "Minerales, piedras y recursos simbolicos presentados como objetos culturales y decorativos.",
  },
  "herramientas-esotericas": {
    slug: "herramientas-esotericas",
    tituloCatalogo: "Herramientas esotericas",
    descripcionCatalogo: "Utensilios de practica ritual, lectura y cuidado simbolico para uso personal o regalo.",
  },
};

export function obtenerConfiguracionSeccionComercial(
  slug: SlugSeccionComercial,
): ConfiguracionSeccionComercial {
  return CONFIGURACION_SECCIONES[slug];
}

export function construirMensajeErrorSeccionComercial(slug: SlugSeccionComercial): string {
  return `No pudimos cargar los productos de ${CONFIGURACION_SECCIONES[slug].tituloCatalogo}.`;
}
