import { PRODUCTOS_CATALOGO, ProductoCatalogo } from "./catalogo";
import { LineaSeleccionEncargo, resolverLineasSeleccionEncargo } from "./seleccionEncargo";

export const CANTIDAD_MINIMA_CESTA = 1;
export const CANTIDAD_MAXIMA_CESTA = 12;

export type LineaCestaRitual = {
  slug: string;
  cantidad: number;
  actualizadoEn: string;
};

export type CestaRitual = {
  lineas: LineaCestaRitual[];
};

export type ItemEncargoPreseleccionado = {
  slug: string;
  cantidad: number;
};

export function crearCestaVacia(): CestaRitual {
  return { lineas: [] };
}

export function agregarProducto(cesta: CestaRitual, slug: string, cantidad = CANTIDAD_MINIMA_CESTA): CestaRitual {
  const cantidadLimpia = normalizarCantidad(cantidad);
  const existente = cesta.lineas.find((linea) => linea.slug === slug);

  if (!existente) {
    return { lineas: [...cesta.lineas, crearLinea(slug, cantidadLimpia)] };
  }

  return {
    lineas: cesta.lineas.map((linea) => (linea.slug === slug
      ? crearLinea(slug, normalizarCantidad(linea.cantidad + cantidadLimpia))
      : linea)),
  };
}

export function quitarProducto(cesta: CestaRitual, slug: string): CestaRitual {
  return { lineas: cesta.lineas.filter((linea) => linea.slug !== slug) };
}

export function actualizarCantidad(cesta: CestaRitual, slug: string, cantidad: number): CestaRitual {
  const cantidadLimpia = normalizarCantidad(cantidad);
  return {
    lineas: cesta.lineas.map((linea) => (linea.slug === slug ? crearLinea(slug, cantidadLimpia) : linea)),
  };
}

export function vaciarCesta(): CestaRitual {
  return crearCestaVacia();
}

export function contarUnidades(cesta: CestaRitual): number {
  return cesta.lineas.reduce((acumulado, linea) => acumulado + linea.cantidad, 0);
}

export function resolverSubtotalVisible(
  cesta: CestaRitual,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): string {
  const total = cesta.lineas.reduce((acumulado, linea) => {
    const producto = productos.find((item) => item.slug === linea.slug);
    if (!producto) {
      return acumulado;
    }

    return acumulado + convertirPrecioVisibleANumero(producto.precioVisible) * linea.cantidad;
  }, 0);

  return total.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

export function serializarCesta(cesta: CestaRitual): string {
  return JSON.stringify(cesta);
}

export function deserializarCesta(serializado: string | null | undefined): CestaRitual {
  if (!serializado) {
    return crearCestaVacia();
  }

  try {
    const objeto = JSON.parse(serializado) as { lineas?: unknown };
    if (!Array.isArray(objeto.lineas)) {
      return crearCestaVacia();
    }

    return {
      lineas: objeto.lineas.map(deserializarLinea).filter((linea): linea is LineaCestaRitual => linea !== null),
    };
  } catch {
    return crearCestaVacia();
  }
}

export function convertirCestaAItemsEncargo(cesta: CestaRitual): ItemEncargoPreseleccionado[] {
  return cesta.lineas.map((linea) => ({ slug: linea.slug, cantidad: linea.cantidad }));
}

export function convertirCestaALineasSeleccion(
  cesta: CestaRitual,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): LineaSeleccionEncargo[] {
  return resolverLineasSeleccionEncargo(cesta, productos);
}

export function serializarItemsEncargo(items: ItemEncargoPreseleccionado[]): string {
  return encodeURIComponent(JSON.stringify(items));
}

export function deserializarItemsEncargo(serializado: string | null | undefined): ItemEncargoPreseleccionado[] {
  if (!serializado) {
    return [];
  }

  try {
    const objeto = JSON.parse(decodeURIComponent(serializado)) as unknown;
    if (!Array.isArray(objeto)) {
      return [];
    }

    return objeto.map(deserializarItemEncargo).filter((item): item is ItemEncargoPreseleccionado => item !== null);
  } catch {
    return [];
  }
}

export function construirResumenItemsEncargo(
  items: ItemEncargoPreseleccionado[],
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): string {
  if (items.length === 0) {
    return "";
  }

  return items.map((item) => {
    const producto = productos.find((registro) => registro.slug === item.slug);
    return producto ? `${item.cantidad} x ${producto.nombre}` : `${item.cantidad} x Producto fuera de catálogo (${item.slug})`;
  }).join("\n");
}

function deserializarLinea(linea: unknown): LineaCestaRitual | null {
  if (!linea || typeof linea !== "object") {
    return null;
  }

  const registro = linea as { slug?: unknown; cantidad?: unknown; actualizadoEn?: unknown };
  if (typeof registro.slug !== "string") {
    return null;
  }

  return {
    slug: registro.slug,
    cantidad: normalizarCantidad(Number(registro.cantidad)),
    actualizadoEn: typeof registro.actualizadoEn === "string" ? registro.actualizadoEn : new Date().toISOString(),
  };
}

function deserializarItemEncargo(item: unknown): ItemEncargoPreseleccionado | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const registro = item as { slug?: unknown; cantidad?: unknown };
  if (typeof registro.slug !== "string") {
    return null;
  }

  return { slug: registro.slug, cantidad: normalizarCantidad(Number(registro.cantidad)) };
}

function crearLinea(slug: string, cantidad: number): LineaCestaRitual {
  return { slug, cantidad, actualizadoEn: new Date().toISOString() };
}

function normalizarCantidad(cantidad: number): number {
  if (!Number.isFinite(cantidad)) {
    return CANTIDAD_MINIMA_CESTA;
  }

  return Math.min(CANTIDAD_MAXIMA_CESTA, Math.max(CANTIDAD_MINIMA_CESTA, Math.round(cantidad)));
}

function convertirPrecioVisibleANumero(precioVisible: string): number {
  const limpio = precioVisible.replace(/[^0-9,]/g, "").replace(",", ".");
  const numero = Number.parseFloat(limpio);
  return Number.isFinite(numero) ? numero : 0;
}
