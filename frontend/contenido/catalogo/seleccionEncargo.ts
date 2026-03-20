import { CestaRitual } from "./cestaRitual";
import { PRODUCTOS_CATALOGO, ProductoCatalogo } from "./catalogo";

export type TipoLineaSeleccion = "catalogo" | "fuera_catalogo" | "sugerencia_editorial";
export type EstadoReferenciaEconomica = "sin_referencia" | "parcial" | "estimada";

export type ReferenciaEconomicaLinea = {
  etiqueta: string;
  valor: number | null;
};

export type LineaSeleccionEncargo = {
  id_linea: string;
  tipo_linea: TipoLineaSeleccion;
  slug: string | null;
  id_producto: string | null;
  nombre: string;
  cantidad: number;
  formato: string | null;
  imagen_url: string | null;
  referencia_economica: ReferenciaEconomicaLinea;
  notas_origen: string | null;
};

export type ResumenEconomicoSeleccion = {
  estado: EstadoReferenciaEconomica;
  etiqueta: string;
  detalle: string;
  totalVisible: string | null;
};

export function resolverLineasSeleccionEncargo(
  cesta: CestaRitual,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): LineaSeleccionEncargo[] {
  return cesta.lineas.map((linea) => resolverLineaSeleccion(linea.slug, linea.cantidad, productos));
}

export function construirResumenHumanoSeleccion(lineas: LineaSeleccionEncargo[]): string {
  if (lineas.length === 0) {
    return "";
  }

  const piezas = lineas.map((linea) => {
    const descripcionTipo = linea.tipo_linea === "catalogo"
      ? linea.nombre
      : `${linea.nombre}${linea.formato ? ` (${linea.formato})` : ""}`;

    return `${linea.cantidad} ${descripcionTipo}`;
  });

  return `Selección enviada desde mi selección: ${piezas.join(" + ")}.`;
}

export function resolverResumenEconomicoSeleccion(lineas: LineaSeleccionEncargo[]): ResumenEconomicoSeleccion {
  const lineasConReferencia = lineas.filter((linea) => linea.referencia_economica.valor !== null);
  const total = lineasConReferencia.reduce(
    (acumulado, linea) => acumulado + (linea.referencia_economica.valor ?? 0) * linea.cantidad,
    0,
  );

  if (lineasConReferencia.length === 0) {
    return {
      estado: "sin_referencia",
      etiqueta: "Sin referencia económica",
      detalle: "Esta selección necesita revisión artesanal: no mostramos 0,00 € cuando no existe referencia editorial válida.",
      totalVisible: null,
    };
  }

  if (lineasConReferencia.length !== lineas.length) {
    return {
      estado: "parcial",
      etiqueta: "Referencia parcial",
      detalle: "Mostramos solo las piezas con referencia editorial disponible; el resto se confirma en la solicitud de encargo.",
      totalVisible: formatearMoneda(total),
    };
  }

  return {
    estado: "estimada",
    etiqueta: "Referencia estimada",
    detalle: "Importe editorial orientativo para ayudarte a revisar la selección antes del encargo. No equivale a checkout ni confirmación final.",
    totalVisible: formatearMoneda(total),
  };
}

function resolverLineaSeleccion(
  slug: string,
  cantidad: number,
  productos: ProductoCatalogo[],
): LineaSeleccionEncargo {
  const producto = productos.find((item) => item.slug === slug);
  if (!producto) {
    return {
      id_linea: slug,
      tipo_linea: "fuera_catalogo",
      slug,
      id_producto: null,
      nombre: "Pieza fuera de catálogo",
      cantidad,
      formato: slug.replace(/-/g, " "),
      imagen_url: null,
      referencia_economica: { etiqueta: "Sin referencia económica", valor: null },
      notas_origen: "Recuperada desde una selección local sin ficha pública activa.",
    };
  }

  return {
    id_linea: producto.id,
    tipo_linea: producto.disponible ? "catalogo" : "sugerencia_editorial",
    slug: producto.slug,
    id_producto: producto.id,
    nombre: producto.nombre,
    cantidad,
    formato: producto.categoria,
    imagen_url: null,
    referencia_economica: {
      etiqueta: producto.disponible ? "Referencia editorial disponible" : "Referencia editorial no activa",
      valor: producto.disponible ? convertirPrecioVisibleANumero(producto.precioVisible) : null,
    },
    notas_origen: producto.subtitulo,
  };
}

function convertirPrecioVisibleANumero(precioVisible: string): number | null {
  const limpio = precioVisible.replace(/[^0-9,]/g, "").replace(",", ".");
  const numero = Number.parseFloat(limpio);
  return Number.isFinite(numero) ? numero : null;
}

function formatearMoneda(valor: number): string {
  return valor.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}
