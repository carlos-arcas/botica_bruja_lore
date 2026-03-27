import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

export const SLUG_SECCION_PUBLICA_BASELINE = "botica-natural";

const SECCIONES_CON_DETALLE_PUBLICO = new Set([
  SLUG_SECCION_PUBLICA_BASELINE,
  "velas-e-incienso",
  "minerales-y-energia",
]);

export function construirHrefSeccionPublica(slugSeccion: string): string {
  return `/${slugSeccion}`;
}

export function resolverSlugRutaDetallePublica(
  producto: Pick<ProductoSeccionPublica, "seccion_publica">,
): string {
  const slugSeccion = producto.seccion_publica?.trim();
  if (slugSeccion && SECCIONES_CON_DETALLE_PUBLICO.has(slugSeccion)) {
    return slugSeccion;
  }
  return SLUG_SECCION_PUBLICA_BASELINE;
}

export function construirHrefFichaProductoPublico(
  producto: Pick<ProductoSeccionPublica, "slug" | "seccion_publica">,
): string {
  return `${construirHrefSeccionPublica(resolverSlugRutaDetallePublica(producto))}/${producto.slug}`;
}
