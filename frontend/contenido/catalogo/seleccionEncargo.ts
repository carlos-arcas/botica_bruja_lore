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

export type ContextoResumenEconomicoSeleccion =
  | "seleccion"
  | "pedido_real"
  | "fuera_pedido_real";

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
  contexto: ContextoResumenEconomicoSeleccion = "seleccion",
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
      etiqueta: resolverEtiquetaSinReferencia(contexto),
      detalle: resolverDetalleSinReferencia(contexto),
      totalVisible: null,
    };
  }

  if (lineasConReferencia.length !== lineas.length) {
    return {
      estado: "parcial",
      etiqueta: resolverEtiquetaParcial(contexto),
      detalle: resolverDetalleParcial(contexto),
      totalVisible: formatearMoneda(total),
    };
  }

  return {
    estado: "estimada",
    etiqueta: resolverEtiquetaEstimada(contexto),
    detalle: resolverDetalleEstimado(contexto),
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

function resolverEtiquetaSinReferencia(
  contexto: ContextoResumenEconomicoSeleccion,
): string {
  if (contexto === "pedido_real") {
    return "Pedido real sin referencia económica";
  }

  if (contexto === "fuera_pedido_real") {
    return "Fuera del pedido real sin referencia económica";
  }

  return "Sin referencia económica";
}

function resolverDetalleSinReferencia(
  contexto: ContextoResumenEconomicoSeleccion,
): string {
  if (contexto === "pedido_real") {
    return "Las líneas convertibles necesitan revisión económica antes de confirmar el pedido real: no mostramos 0,00 € cuando no existe referencia editorial válida.";
  }

  if (contexto === "fuera_pedido_real") {
    return "Estas líneas visibles han quedado fuera del pedido real y no aportan una referencia económica válida al total principal.";
  }

  return "Esta selección necesita revisión artesanal: no mostramos 0,00 € cuando no existe referencia editorial válida.";
}

function resolverEtiquetaParcial(
  contexto: ContextoResumenEconomicoSeleccion,
): string {
  if (contexto === "pedido_real") {
    return "Pedido real con referencia parcial";
  }

  if (contexto === "fuera_pedido_real") {
    return "Contexto económico fuera del pedido real";
  }

  return "Referencia parcial";
}

function resolverDetalleParcial(
  contexto: ContextoResumenEconomicoSeleccion,
): string {
  if (contexto === "pedido_real") {
    return "Mostramos solo el importe de las líneas convertibles con referencia editorial disponible; cualquier revisión adicional se confirma antes del pago real.";
  }

  if (contexto === "fuera_pedido_real") {
    return "Esta referencia pertenece solo a líneas visibles que no entran en el pedido real. Sirve como contexto y no contamina el total principal.";
  }

  return "Mostramos solo las piezas con referencia editorial disponible; el resto se confirma en la solicitud de encargo.";
}

function resolverEtiquetaEstimada(
  contexto: ContextoResumenEconomicoSeleccion,
): string {
  if (contexto === "pedido_real") {
    return "Total orientativo del pedido real";
  }

  if (contexto === "fuera_pedido_real") {
    return "Contexto visible fuera del pedido real";
  }

  return "Referencia estimada";
}

function resolverDetalleEstimado(
  contexto: ContextoResumenEconomicoSeleccion,
): string {
  if (contexto === "pedido_real") {
    return "Importe orientativo calculado solo con las líneas convertibles que sí entrarían en el pedido real.";
  }

  if (contexto === "fuera_pedido_real") {
    return "Importe orientativo solo de las líneas visibles bloqueadas o pendientes. No forma parte del pedido real convertible.";
  }

  return "Importe editorial orientativo para ayudarte a revisar la selección antes del encargo. No equivale a checkout ni confirmación final.";
}
