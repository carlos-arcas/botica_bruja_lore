import { PRODUCTOS_CATALOGO } from "./catalogo";
import type { ProductoCatalogo } from "./catalogo";
import {
  convertirCestaAItemsEncargo,
} from "./cestaRitual";
import type { CestaRitual, ItemEncargoPreseleccionado } from "./cestaRitual";
import { esProductoComprable, resolverBloqueoCantidad } from "./disponibilidadStock";

export type EstadoLineaCestaReal =
  | "comprable"
  | "requiere_consulta"
  | "invalida"
  | "sin_stock";

export type LineaClasificadaCestaReal = ItemEncargoPreseleccionado & {
  estado_cesta_real: EstadoLineaCestaReal;
  motivo: string;
};

export type ResumenCestaReal = {
  lineasComprables: LineaClasificadaCestaReal[];
  lineasConsulta: LineaClasificadaCestaReal[];
  lineasInvalidas: LineaClasificadaCestaReal[];
  lineasSinStock: LineaClasificadaCestaReal[];
  puedeFinalizarCompra: boolean;
};

export function resolverResumenCestaReal(
  cesta: CestaRitual,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): ResumenCestaReal {
  const clasificadas = convertirCestaAItemsEncargo(cesta).map((linea) =>
    clasificarLineaCestaReal(linea, productos),
  );
  const lineasComprables = filtrarPorEstado(clasificadas, "comprable");
  const lineasConsulta = filtrarPorEstado(clasificadas, "requiere_consulta");
  const lineasInvalidas = filtrarPorEstado(clasificadas, "invalida");
  const lineasSinStock = filtrarPorEstado(clasificadas, "sin_stock");
  return {
    lineasComprables,
    lineasConsulta,
    lineasInvalidas,
    lineasSinStock,
    puedeFinalizarCompra:
      lineasComprables.length > 0 &&
      lineasConsulta.length === 0 &&
      lineasInvalidas.length === 0 &&
      lineasSinStock.length === 0,
  };
}

export function convertirCestaAItemsCheckoutReal(
  cesta: CestaRitual,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): ItemEncargoPreseleccionado[] {
  return resolverResumenCestaReal(cesta, productos).lineasComprables.map(
    quitarClasificacion,
  );
}

export function clasificarLineaCestaReal(
  linea: ItemEncargoPreseleccionado,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): LineaClasificadaCestaReal {
  if (linea.tipo_linea === "fuera_catalogo" || !linea.slug) {
    return clasificar(linea, "requiere_consulta", "Requiere consulta personalizada.");
  }
  const producto = productos.find((item) => item.slug === linea.slug);
  if (!producto || !producto.id) {
    return clasificar(linea, "invalida", "No encontramos una ficha comprable activa.");
  }
  const errorContrato = validarContratoProducto(producto, linea.cantidad);
  if (errorContrato) return clasificar(linea, "invalida", errorContrato);
  const errorStock = resolverBloqueoCantidad(producto, linea.cantidad);
  if (errorStock || !esProductoComprable(producto)) {
    return clasificar(linea, "sin_stock", errorStock ?? "Sin stock disponible.");
  }
  return clasificar(linea, "comprable", "Lista para finalizar compra.");
}

function validarContratoProducto(
  producto: ProductoCatalogo,
  cantidad: number,
): string | null {
  if (!Number.isFinite(cantidad) || cantidad <= 0) return "Cantidad no valida.";
  if (!["ud", "g", "ml"].includes(producto.unidad_comercial)) {
    return "Unidad comercial no valida para checkout.";
  }
  if (!precioValido(producto.precioVisible)) return "Precio no valido para checkout.";
  return null;
}

function precioValido(precioVisible: string): boolean {
  const limpio = precioVisible.replace(/[^\d,.-]/g, "").replace(",", ".");
  const numero = Number.parseFloat(limpio);
  return Number.isFinite(numero) && numero > 0;
}

function filtrarPorEstado(
  lineas: LineaClasificadaCestaReal[],
  estado: EstadoLineaCestaReal,
): LineaClasificadaCestaReal[] {
  return lineas.filter((linea) => linea.estado_cesta_real === estado);
}

function clasificar(
  linea: ItemEncargoPreseleccionado,
  estado: EstadoLineaCestaReal,
  motivo: string,
): LineaClasificadaCestaReal {
  return { ...linea, estado_cesta_real: estado, motivo };
}

function quitarClasificacion(
  linea: LineaClasificadaCestaReal,
): ItemEncargoPreseleccionado {
  const { estado_cesta_real, motivo, ...item } = linea;
  void estado_cesta_real;
  void motivo;
  return item;
}
