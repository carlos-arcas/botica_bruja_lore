import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

export function construirHrefFichaProductoPublico(producto: Pick<ProductoSeccionPublica, "slug">): string {
  return `/botica-natural/${producto.slug}`;
}
