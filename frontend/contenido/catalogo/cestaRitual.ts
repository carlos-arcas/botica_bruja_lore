import { PRODUCTOS_CATALOGO, ProductoCatalogo } from "./catalogo";
import {
  LineaSeleccionEncargo,
  LineaSeleccionPersistida,
  construirLineaPersistidaCatalogo,
  construirLineaPersistidaLegacy,
  resolverLineasSeleccionEncargo,
} from "./seleccionEncargo";

export const CANTIDAD_MINIMA_CESTA = 1;
export const CANTIDAD_MAXIMA_CESTA = 12;

export type LineaCestaRitual = LineaSeleccionPersistida;

export type CestaRitual = {
  lineas: LineaCestaRitual[];
};

export type ItemEncargoPreseleccionado = Omit<
  LineaSeleccionPersistida,
  "actualizadoEn"
>;

export function crearCestaVacia(): CestaRitual {
  return { lineas: [] };
}

export function agregarProducto(
  cesta: CestaRitual,
  slug: string,
  cantidad = CANTIDAD_MINIMA_CESTA,
): CestaRitual {
  const cantidadLimpia = normalizarCantidad(cantidad);
  const existente = cesta.lineas.find(
    (linea) => linea.slug === slug && linea.tipo_linea !== "fuera_catalogo",
  );

  if (!existente) {
    return {
      lineas: [
        ...cesta.lineas,
        construirLineaPersistidaCatalogo(slug, cantidadLimpia),
      ],
    };
  }

  return actualizarCantidad(
    cesta,
    existente.id_linea,
    existente.cantidad + cantidadLimpia,
  );
}

export function quitarProducto(
  cesta: CestaRitual,
  idLinea: string,
): CestaRitual {
  return { lineas: cesta.lineas.filter((linea) => linea.id_linea !== idLinea) };
}

export function actualizarCantidad(
  cesta: CestaRitual,
  idLinea: string,
  cantidad: number,
): CestaRitual {
  const cantidadLimpia = normalizarCantidad(cantidad);
  return {
    lineas: cesta.lineas.map((linea) =>
      linea.id_linea === idLinea
        ? {
            ...linea,
            cantidad: cantidadLimpia,
            actualizadoEn: new Date().toISOString(),
          }
        : linea,
    ),
  };
}

export function vaciarCesta(): CestaRitual {
  return crearCestaVacia();
}

export function contarUnidades(cesta: CestaRitual): number {
  return cesta.lineas.reduce(
    (acumulado, linea) => acumulado + linea.cantidad,
    0,
  );
}

export function resolverSubtotalVisible(
  cesta: CestaRitual,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): string {
  const total = cesta.lineas.reduce((acumulado, linea) => {
    const producto = linea.slug
      ? productos.find((item) => item.slug === linea.slug)
      : null;
    if (!producto) {
      return acumulado;
    }

    return (
      acumulado +
      convertirPrecioVisibleANumero(producto.precioVisible) * linea.cantidad
    );
  }, 0);

  return total.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

export function serializarCesta(cesta: CestaRitual): string {
  return JSON.stringify(cesta);
}

export function deserializarCesta(
  serializado: string | null | undefined,
): CestaRitual {
  if (!serializado) {
    return crearCestaVacia();
  }

  try {
    const objeto = JSON.parse(serializado) as { lineas?: unknown };
    if (!Array.isArray(objeto.lineas)) {
      return crearCestaVacia();
    }

    return {
      lineas: objeto.lineas
        .map(deserializarLinea)
        .filter((linea): linea is LineaCestaRitual => linea !== null),
    };
  } catch {
    return crearCestaVacia();
  }
}

export function convertirCestaAItemsEncargo(
  cesta: CestaRitual,
): ItemEncargoPreseleccionado[] {
  return cesta.lineas.map(({ actualizadoEn, ...linea }) => linea);
}

export function convertirCestaALineasSeleccion(
  cesta: CestaRitual,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): LineaSeleccionEncargo[] {
  return resolverLineasSeleccionEncargo(cesta.lineas, productos);
}

export function serializarItemsEncargo(
  items: ItemEncargoPreseleccionado[],
): string {
  return encodeURIComponent(JSON.stringify(items));
}

export function deserializarItemsEncargo(
  serializado: string | null | undefined,
): ItemEncargoPreseleccionado[] {
  if (!serializado) {
    return [];
  }

  try {
    const objeto = JSON.parse(decodeURIComponent(serializado)) as unknown;
    if (!Array.isArray(objeto)) {
      return [];
    }

    return objeto
      .map(deserializarItemEncargo)
      .filter((item): item is ItemEncargoPreseleccionado => item !== null);
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

  return items
    .map((item) => {
      if (item.nombre) {
        return `${item.cantidad} x ${item.nombre}`;
      }

      const producto = item.slug
        ? productos.find((registro) => registro.slug === item.slug)
        : null;
      return producto
        ? `${item.cantidad} x ${producto.nombre}`
        : `${item.cantidad} x Pieza artesanal sin ficha activa`;
    })
    .join("\n");
}

function deserializarLinea(linea: unknown): LineaCestaRitual | null {
  if (!linea || typeof linea !== "object") {
    return null;
  }

  if (esLineaPersistida(linea)) {
    return {
      ...linea,
      cantidad: normalizarCantidad(Number(linea.cantidad)),
      actualizadoEn:
        typeof linea.actualizadoEn === "string"
          ? linea.actualizadoEn
          : new Date().toISOString(),
    };
  }

  const legacy = linea as {
    slug?: unknown;
    cantidad?: unknown;
    actualizadoEn?: unknown;
  };
  if (typeof legacy.slug !== "string") {
    return null;
  }

  return construirLineaPersistidaLegacy(
    legacy.slug,
    normalizarCantidad(Number(legacy.cantidad)),
    typeof legacy.actualizadoEn === "string" ? legacy.actualizadoEn : undefined,
  );
}

function deserializarItemEncargo(
  item: unknown,
): ItemEncargoPreseleccionado | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  if (esLineaPersistida(item) || esItemEncargoPersistido(item)) {
    return {
      id_linea: item.id_linea,
      tipo_linea: item.tipo_linea,
      slug: item.slug,
      id_producto: item.id_producto,
      nombre: item.nombre,
      cantidad: normalizarCantidad(Number(item.cantidad)),
      formato: item.formato,
      imagen_url: item.imagen_url,
      referencia_economica: item.referencia_economica,
      notas_origen: item.notas_origen,
    };
  }

  const legacy = item as { slug?: unknown; cantidad?: unknown };
  if (typeof legacy.slug !== "string") {
    return null;
  }

  const { actualizadoEn, ...linea } = construirLineaPersistidaLegacy(
    legacy.slug,
    normalizarCantidad(Number(legacy.cantidad)),
  );
  return linea;
}

function esLineaPersistida(linea: unknown): linea is LineaSeleccionPersistida {
  return (
    esItemEncargoPersistido(linea) &&
    typeof (linea as { actualizadoEn?: unknown }).actualizadoEn === "string"
  );
}

function esItemEncargoPersistido(
  item: unknown,
): item is ItemEncargoPreseleccionado {
  if (!item || typeof item !== "object") {
    return false;
  }

  const registro = item as Record<string, unknown>;
  return (
    typeof registro.id_linea === "string" &&
    typeof registro.tipo_linea === "string" &&
    typeof registro.nombre === "string" &&
    "cantidad" in registro
  );
}

function normalizarCantidad(cantidad: number): number {
  if (!Number.isFinite(cantidad)) {
    return CANTIDAD_MINIMA_CESTA;
  }

  return Math.min(
    CANTIDAD_MAXIMA_CESTA,
    Math.max(CANTIDAD_MINIMA_CESTA, Math.round(cantidad)),
  );
}

function convertirPrecioVisibleANumero(precioVisible: string): number {
  const limpio = precioVisible.replace(/[^0-9,]/g, "").replace(",", ".");
  const numero = Number.parseFloat(limpio);
  return Number.isFinite(numero) ? numero : 0;
}
