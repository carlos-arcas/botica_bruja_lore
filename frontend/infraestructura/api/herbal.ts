import { resolverApiBaseUrl } from "./apiBaseUrl";

export type IntencionPublica = {
  slug: string;
  nombre: string;
};

export type PlantaPublica = {
  slug: string;
  nombre: string;
  descripcion_breve: string;
  intenciones: IntencionPublica[];
  urlDetalle: string;
};

export type RitualRelacionadoHerbal = {
  slug: string;
  nombre: string;
  contexto_breve: string;
  intenciones: IntencionPublica[];
  urlDetalle: string;
};

export type ProductoHerbalMinimoPublico = {
  sku: string;
  slug: string;
  nombre: string;
  tipo_producto: string;
  categoria_comercial: string;
};

export type FichaHerbalPublica = {
  planta: PlantaPublica;
  productos: ProductoHerbalMinimoPublico[];
  rituales: RitualRelacionadoHerbal[];
};

type PlantaApi = {
  slug: string;
  nombre: string;
  descripcion_breve: string;
  intenciones: IntencionPublica[];
};

type RitualApi = {
  slug: string;
  nombre: string;
  contexto_breve: string;
  intenciones: IntencionPublica[];
};

type ProductoHerbalApi = {
  sku: string;
  slug: string;
  nombre: string;
  tipo_producto: string;
  categoria_comercial: string;
};

type RespuestaListadoHerbal = {
  plantas: PlantaApi[];
};

type RespuestaDetallePlanta = {
  planta: PlantaApi;
};

type RespuestaProductosPlanta = {
  planta_slug: string;
  productos: ProductoHerbalApi[];
};

type RespuestaRitualesPlanta = {
  planta_slug: string;
  rituales: RitualApi[];
};

export type ResultadoListadoHerbal =
  | { estado: "ok"; plantas: PlantaPublica[] }
  | { estado: "error"; mensaje: string };

export type ResultadoFichaHerbal =
  | { estado: "ok"; ficha: FichaHerbalPublica }
  | { estado: "no_encontrado" }
  | { estado: "error"; mensaje: string };

const API_BASE_URL = resolverApiBaseUrl();

function mapearPlanta(planta: PlantaApi): PlantaPublica {
  return {
    ...planta,
    urlDetalle: `/hierbas/${planta.slug}`,
  };
}

function mapearRitual(ritual: RitualApi): RitualRelacionadoHerbal {
  return {
    ...ritual,
    urlDetalle: `/rituales/${ritual.slug}`,
  };
}

export async function obtenerListadoHerbal(): Promise<ResultadoListadoHerbal> {
  const endpoint = `${API_BASE_URL}/api/v1/herbal/plantas/`;

  try {
    const respuesta = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    });

    if (!respuesta.ok) {
      return {
        estado: "error",
        mensaje:
          "No pudimos cargar el listado herbal ahora mismo. Revisa la conexión del backend o inténtalo de nuevo en unos minutos.",
      };
    }

    const data: RespuestaListadoHerbal = await respuesta.json();
    return { estado: "ok", plantas: data.plantas.map(mapearPlanta) };
  } catch {
    return {
      estado: "error",
      mensaje:
        "La línea herbal no está disponible temporalmente. Puedes continuar explorando la portada y volver a intentar en breve.",
    };
  }
}

export async function obtenerFichaHerbalConectada(slugPlanta: string): Promise<ResultadoFichaHerbal> {
  const endpointDetalle = `${API_BASE_URL}/api/v1/herbal/plantas/${slugPlanta}/`;
  const endpointProductos = `${API_BASE_URL}/api/v1/herbal/plantas/${slugPlanta}/productos/`;
  const endpointRituales = `${API_BASE_URL}/api/v1/herbal/plantas/${slugPlanta}/rituales/`;

  try {
    const [respuestaDetalle, respuestaProductos, respuestaRituales] = await Promise.all([
      fetch(endpointDetalle, {
        headers: { Accept: "application/json" },
        next: { revalidate: 120 },
      }),
      fetch(endpointProductos, {
        headers: { Accept: "application/json" },
        next: { revalidate: 120 },
      }),
      fetch(endpointRituales, {
        headers: { Accept: "application/json" },
        next: { revalidate: 120 },
      }),
    ]);

    if (
      respuestaDetalle.status === 404 ||
      respuestaProductos.status === 404 ||
      respuestaRituales.status === 404
    ) {
      return { estado: "no_encontrado" };
    }

    if (!respuestaDetalle.ok || !respuestaProductos.ok || !respuestaRituales.ok) {
      return {
        estado: "error",
        mensaje:
          "No pudimos cargar esta ficha herbal ahora mismo. Inténtalo de nuevo en unos minutos.",
      };
    }

    const detalle: RespuestaDetallePlanta = await respuestaDetalle.json();
    const resolucionComercial: RespuestaProductosPlanta = await respuestaProductos.json();
    const ritualesRelacionados: RespuestaRitualesPlanta = await respuestaRituales.json();

    return {
      estado: "ok",
      ficha: {
        planta: mapearPlanta(detalle.planta),
        productos: resolucionComercial.productos,
        rituales: ritualesRelacionados.rituales.map(mapearRitual),
      },
    };
  } catch {
    return {
      estado: "error",
      mensaje:
        "La ficha herbal no está disponible por un problema de conexión entre frontend y backend.",
    };
  }
}

export async function obtenerPreviewHerbal(): Promise<ResultadoListadoHerbal> {
  const resultado = await obtenerListadoHerbal();
  if (resultado.estado === "error") {
    return resultado;
  }
  return { estado: "ok", plantas: resultado.plantas.slice(0, 6) };
}
