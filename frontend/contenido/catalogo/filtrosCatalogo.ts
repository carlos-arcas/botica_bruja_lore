import { ProductoCatalogo } from "./catalogo";
import { buscarProductosPorTexto } from "./busquedaCatalogo";

export type OrdenCatalogo = "destacados" | "precio-asc" | "nombre-asc";

export function filtrarPorIntencion(productos: ProductoCatalogo[], intencion: string): ProductoCatalogo[] {
  if (intencion === "todas") return productos;
  return productos.filter((producto) => producto.intencion === intencion);
}

export function filtrarPorCategoria(productos: ProductoCatalogo[], categoria: string): ProductoCatalogo[] {
  if (categoria === "todas") return productos;
  return productos.filter((producto) => producto.categoria === categoria);
}

export function ordenarCatalogo(productos: ProductoCatalogo[], orden: OrdenCatalogo): ProductoCatalogo[] {
  const copia = [...productos];

  if (orden === "destacados") {
    return copia.sort((a, b) => Number(b.destacado) - Number(a.destacado) || a.nombre.localeCompare(b.nombre, "es"));
  }

  if (orden === "precio-asc") {
    return copia.sort((a, b) => obtenerPrecioNumerico(a.precioVisible) - obtenerPrecioNumerico(b.precioVisible));
  }

  return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

export function resolverCatalogo(
  productos: ProductoCatalogo[],
  intencion: string,
  categoria: string,
  orden: OrdenCatalogo,
  busqueda = "",
): ProductoCatalogo[] {
  const porBusqueda = buscarProductosPorTexto(productos, busqueda);
  const porIntencion = filtrarPorIntencion(porBusqueda, intencion);
  const porCategoria = filtrarPorCategoria(porIntencion, categoria);
  return ordenarCatalogo(porCategoria, orden);
}

function obtenerPrecioNumerico(precioVisible: string): number {
  const precio = precioVisible.replace("€", "").replace(",", ".").trim();
  return Number(precio);
}
