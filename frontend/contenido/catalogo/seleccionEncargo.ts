import { PRODUCTOS_CATALOGO, ProductoCatalogo } from "./catalogo";

export type TipoLineaSeleccion =
  | "catalogo"
  | "fuera_catalogo"
  | "sugerencia_editorial";
export type EstadoReferenciaEconomica =
  | "sin_referencia"
  | "parcial"
  | "estimada";

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

export type LineaSeleccionPersistida = LineaSeleccionEncargo & {
  actualizadoEn: string;
};

export type ResumenEconomicoSeleccion = {
  estado: EstadoReferenciaEconomica;
  etiqueta: string;
  detalle: string;
  totalVisible: string | null;
};

export type ReferenciaEconomicaVisualLinea = {
  mensaje: string;
  referenciaUnitaria: string | null;
  subtotal: string | null;
};

export function resolverLineasSeleccionEncargo(
  lineas: LineaSeleccionPersistida[],
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): LineaSeleccionEncargo[] {
  return lineas.map((linea) => enriquecerLineaPersistida(linea, productos));
}

export function construirLineaPersistidaCatalogo(
  slug: string,
  cantidad: number,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): LineaSeleccionPersistida {
  return crearLineaPersistidaBase(
    resolverLineaDesdeCatalogo(slug, cantidad, productos),
  );
}

export function construirLineaPersistidaLegacy(
  slug: string,
  cantidad: number,
  actualizadoEn?: string,
  productos: ProductoCatalogo[] = PRODUCTOS_CATALOGO,
): LineaSeleccionPersistida {
  return {
    ...construirLineaPersistidaCatalogo(slug, cantidad, productos),
    actualizadoEn: actualizadoEn ?? new Date().toISOString(),
  };
}

export function construirResumenHumanoSeleccion(
  lineas: LineaSeleccionEncargo[],
): string {
  if (lineas.length === 0) {
    return "";
  }

  const piezas = lineas.map((linea) => {
    const descripcionTipo =
      linea.tipo_linea === "catalogo"
        ? linea.nombre
        : `${linea.nombre}${linea.formato ? ` (${linea.formato})` : ""}`;

    return `${linea.cantidad} ${descripcionTipo}`;
  });

  return `Selección enviada desde mi selección: ${piezas.join(" + ")}.`;
}

export function resolverResumenEconomicoSeleccion(
  lineas: LineaSeleccionEncargo[],
): ResumenEconomicoSeleccion {
  const lineasConReferencia = lineas.filter(
    (linea) => linea.referencia_economica.valor !== null,
  );
  const total = lineasConReferencia.reduce(
    (acumulado, linea) =>
      acumulado + (linea.referencia_economica.valor ?? 0) * linea.cantidad,
    0,
  );

  if (lineasConReferencia.length === 0) {
    return {
      estado: "sin_referencia",
      etiqueta: "Sin referencia económica",
      detalle:
        "Esta selección necesita revisión artesanal: no mostramos 0,00 € cuando no existe referencia editorial válida.",
      totalVisible: null,
    };
  }

  if (lineasConReferencia.length !== lineas.length) {
    return {
      estado: "parcial",
      etiqueta: "Referencia parcial",
      detalle:
        "Mostramos solo las piezas con referencia editorial disponible; el resto se confirma en la solicitud de encargo.",
      totalVisible: formatearMoneda(total),
    };
  }

  return {
    estado: "estimada",
    etiqueta: "Referencia estimada",
    detalle:
      "Importe editorial orientativo para ayudarte a revisar la selección antes del encargo. No equivale a checkout ni confirmación final.",
    totalVisible: formatearMoneda(total),
  };
}

export function resolverReferenciaEconomicaVisualLinea(
  linea: LineaSeleccionEncargo,
): ReferenciaEconomicaVisualLinea {
  const valorUnitario = linea.referencia_economica.valor;
  if (valorUnitario === null) {
    return {
      mensaje:
        "Referencia económica a confirmar durante la revisión artesanal.",
      referenciaUnitaria: null,
      subtotal: null,
    };
  }

  return {
    mensaje: linea.referencia_economica.etiqueta,
    referenciaUnitaria: formatearMoneda(valorUnitario),
    subtotal: formatearMoneda(valorUnitario * linea.cantidad),
  };
}

function enriquecerLineaPersistida(
  linea: LineaSeleccionPersistida,
  productos: ProductoCatalogo[],
): LineaSeleccionEncargo {
  if (!linea.slug) {
    return { ...linea };
  }

  const producto = productos.find((item) => item.slug === linea.slug);
  if (!producto) {
    return { ...linea };
  }

  const referencia_economica = producto.disponible
    ? {
        etiqueta: "Referencia editorial disponible",
        valor: convertirPrecioVisibleANumero(producto.precioVisible),
      }
    : linea.referencia_economica.valor !== null
      ? linea.referencia_economica
      : { etiqueta: "Referencia editorial no activa", valor: null };

  return {
    ...linea,
    id_producto: producto.id,
    nombre: linea.nombre || producto.nombre,
    formato: linea.formato ?? producto.categoria,
    imagen_url: linea.imagen_url ?? producto.imagen_url,
    referencia_economica,
    notas_origen: linea.notas_origen ?? producto.subtitulo,
    tipo_linea:
      linea.tipo_linea === "fuera_catalogo"
        ? "fuera_catalogo"
        : producto.disponible
          ? "catalogo"
          : "sugerencia_editorial",
  };
}

function crearLineaPersistidaBase(
  linea: LineaSeleccionEncargo,
): LineaSeleccionPersistida {
  return { ...linea, actualizadoEn: new Date().toISOString() };
}

function resolverLineaDesdeCatalogo(
  slug: string,
  cantidad: number,
  productos: ProductoCatalogo[],
): LineaSeleccionEncargo {
  const producto = productos.find((item) => item.slug === slug);
  if (!producto) {
    return {
      id_linea: `fuera-${slug}`,
      tipo_linea: "fuera_catalogo",
      slug,
      id_producto: null,
      nombre: humanizarSlug(slug),
      cantidad,
      formato: humanizarSlug(slug),
      imagen_url: null,
      referencia_economica: {
        etiqueta: "Sin referencia económica",
        valor: null,
      },
      notas_origen:
        "Recuperada desde una selección local sin ficha pública activa.",
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
    imagen_url: producto.imagen_url,
    referencia_economica: {
      etiqueta: producto.disponible
        ? "Referencia editorial disponible"
        : "Referencia editorial no activa",
      valor: producto.disponible
        ? convertirPrecioVisibleANumero(producto.precioVisible)
        : null,
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

function humanizarSlug(slug: string): string {
  return slug.replace(/-/g, " ");
}
