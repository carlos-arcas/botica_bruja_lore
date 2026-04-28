import { ProductoCatalogo } from "./catalogo";

export type ProductoConDisponibilidad = Pick<ProductoCatalogo, "slug" | "nombre" | "disponible"> & {
  disponible_compra?: boolean;
  cantidad_disponible?: number;
  mensaje_disponibilidad?: string;
};

export type LineaBloqueadaStock = {
  id_linea: string;
  slug: string;
  nombre: string;
  cantidad: number;
  motivo: string;
};

export function esProductoComprable(producto: ProductoConDisponibilidad | null | undefined): boolean {
  if (!producto) return false;
  return producto.disponible_compra ?? producto.disponible;
}

export function resolverMensajeDisponibilidad(producto: ProductoConDisponibilidad): string {
  if (producto.mensaje_disponibilidad?.trim()) return producto.mensaje_disponibilidad;
  return esProductoComprable(producto) ? "Disponible para compra." : "Sin stock disponible en este momento.";
}

export function resolverBloqueoCantidad(
  producto: ProductoConDisponibilidad,
  cantidad: number,
): string | null {
  if (!esProductoComprable(producto)) return resolverMensajeDisponibilidad(producto);
  if (typeof producto.cantidad_disponible !== "number") return null;
  if (cantidad <= producto.cantidad_disponible) return null;
  return `Solo hay ${producto.cantidad_disponible} disponible. Ajusta la cantidad o elimina la linea.`;
}

export function resolverLineasBloqueadasPorStock(
  lineas: Array<{ id_linea: string; slug: string | null; nombre: string; cantidad: number }>,
  productos: ProductoConDisponibilidad[],
): LineaBloqueadaStock[] {
  return lineas.flatMap((linea) => {
    if (!linea.slug) return [];
    const producto = productos.find((item) => item.slug === linea.slug);
    const motivo = producto ? resolverBloqueoCantidad(producto, linea.cantidad) : null;
    return motivo ? [{ id_linea: linea.id_linea, slug: linea.slug, nombre: linea.nombre, cantidad: linea.cantidad, motivo }] : [];
  });
}
