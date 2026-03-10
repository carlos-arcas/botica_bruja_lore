import dataGuias from "./guiasEditoriales.json";

export type TemaGuiaEditorial = "hierbas" | "rituales" | "colecciones";

export type SeccionGuiaEditorial = {
  titulo: string;
  parrafos: string[];
};

export type EnlaceRelacionadoGuia = {
  href: string;
  anchor: string;
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
  enlaces_relacionados: EnlaceRelacionadoGuia[];
};

const GUIAS_EDITORIALES = dataGuias as GuiaEditorial[];

export const METADATA_HUB_GUIAS = {
  rutaCanonical: "/guias",
  title: "Guías editoriales | Hierbas, rituales y colecciones con contexto",
  description:
    "Explora guías editoriales de La Botica de la Bruja Lore para elegir hierbas, rituales y colecciones con criterio práctico y tono humano.",
  h1: "Guías editoriales para navegar la botica con criterio",
};

export const INTRO_HUB_GUIAS = [
  "Este espacio reúne guías publicadas para conectar intención, contexto editorial y selección de catálogo sin perder claridad.",
  "Cada guía propone un recorrido aplicable: qué observar, cómo decidir y qué rutas del sitio visitar después para seguir profundizando.",
];

export function obtenerGuiasPublicadasIndexables(): GuiaEditorial[] {
  return GUIAS_EDITORIALES.filter((guia) => guia.publicada && guia.indexable);
}

export function obtenerGuiaEditorialPorSlug(slug: string): GuiaEditorial | null {
  return GUIAS_EDITORIALES.find((guia) => guia.slug === slug) ?? null;
}
