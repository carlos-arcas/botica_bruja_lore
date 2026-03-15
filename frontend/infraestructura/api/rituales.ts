export type IntencionPublica = {
  slug: string;
  nombre: string;
};

export type RitualPublico = {
  slug: string;
  nombre: string;
  contexto_breve: string;
  intenciones: IntencionPublica[];
  urlDetalle: string;
};

export type PlantaRelacionadaRitual = {
  slug: string;
  nombre: string;
  descripcion_breve: string;
  intenciones: IntencionPublica[];
  urlDetalle: string;
};

export type ProductoRelacionadoRitual = {
  sku: string;
  slug: string;
  nombre: string;
  tipo_producto: string;
  categoria_comercial: string;
  seccion_publica: string;
  descripcion_corta: string;
  precio_visible: string;
  imagen_url: string;
};

export type RitualDetallePublico = {
  slug: string;
  nombre: string;
  contexto_breve: string;
  intenciones: IntencionPublica[];
  ids_plantas_relacionadas: string[];
  ids_productos_relacionados: string[];
};

export type FichaRitualConectada = {
  ritual: RitualDetallePublico;
  plantas: PlantaRelacionadaRitual[];
  productos: ProductoRelacionadoRitual[];
};

type RitualApi = {
  slug: string;
  nombre: string;
  contexto_breve: string;
  intenciones: IntencionPublica[];
};

type PlantaApi = {
  slug: string;
  nombre: string;
  descripcion_breve: string;
  intenciones: IntencionPublica[];
};

type ProductoApi = ProductoRelacionadoRitual;

type RespuestaListadoRituales = {
  rituales: RitualApi[];
};

type RespuestaDetalleRitual = {
  ritual: RitualDetallePublico;
};

type RespuestaPlantasRitual = {
  ritual_slug: string;
  plantas: PlantaApi[];
};

type RespuestaProductosRitual = {
  ritual_slug: string;
  productos: ProductoApi[];
};

export type ResultadoListadoRituales =
  | { estado: "ok"; rituales: RitualPublico[] }
  | { estado: "error"; mensaje: string };

export type ResultadoFichaRitual =
  | { estado: "ok"; ficha: FichaRitualConectada }
  | { estado: "no_encontrado" }
  | { estado: "error"; mensaje: string };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

function mapearRitual(ritual: RitualApi): RitualPublico {
  return {
    ...ritual,
    urlDetalle: `/rituales/${ritual.slug}`,
  };
}

function mapearPlantaRelacionada(planta: PlantaApi): PlantaRelacionadaRitual {
  return {
    ...planta,
    urlDetalle: `/hierbas/${planta.slug}`,
  };
}

export async function obtenerListadoRituales(): Promise<ResultadoListadoRituales> {
  const endpoint = `${API_BASE_URL}/api/v1/rituales/`;

  try {
    const respuesta = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    });

    if (!respuesta.ok) {
      return {
        estado: "error",
        mensaje:
          "No pudimos cargar los rituales ahora mismo. Revisa la conexión del backend o inténtalo en unos minutos.",
      };
    }

    const data: RespuestaListadoRituales = await respuesta.json();
    return { estado: "ok", rituales: data.rituales.map(mapearRitual) };
  } catch {
    return {
      estado: "error",
      mensaje:
        "La capa ritual no está disponible temporalmente. Puedes seguir entrando por la línea herbal y volver más tarde.",
    };
  }
}

export async function obtenerFichaRitualConectada(slugRitual: string): Promise<ResultadoFichaRitual> {
  const endpointDetalle = `${API_BASE_URL}/api/v1/rituales/${slugRitual}/`;
  const endpointPlantas = `${API_BASE_URL}/api/v1/rituales/${slugRitual}/plantas/`;
  const endpointProductos = `${API_BASE_URL}/api/v1/rituales/${slugRitual}/productos/`;

  try {
    const [respuestaDetalle, respuestaPlantas, respuestaProductos] = await Promise.all([
      fetch(endpointDetalle, {
        headers: { Accept: "application/json" },
        next: { revalidate: 120 },
      }),
      fetch(endpointPlantas, {
        headers: { Accept: "application/json" },
        next: { revalidate: 120 },
      }),
      fetch(endpointProductos, {
        headers: { Accept: "application/json" },
        next: { revalidate: 120 },
      }),
    ]);

    if (
      respuestaDetalle.status === 404 ||
      respuestaPlantas.status === 404 ||
      respuestaProductos.status === 404
    ) {
      return { estado: "no_encontrado" };
    }

    if (!respuestaDetalle.ok || !respuestaPlantas.ok || !respuestaProductos.ok) {
      return {
        estado: "error",
        mensaje:
          "No pudimos cargar esta ficha ritual ahora mismo. Inténtalo de nuevo en unos minutos.",
      };
    }

    const detalle: RespuestaDetalleRitual = await respuestaDetalle.json();
    const plantas: RespuestaPlantasRitual = await respuestaPlantas.json();
    const productos: RespuestaProductosRitual = await respuestaProductos.json();

    return {
      estado: "ok",
      ficha: {
        ritual: detalle.ritual,
        plantas: plantas.plantas.map(mapearPlantaRelacionada),
        productos: productos.productos,
      },
    };
  } catch {
    return {
      estado: "error",
      mensaje:
        "La ficha ritual no está disponible por un problema de conexión entre frontend y backend.",
    };
  }
}
