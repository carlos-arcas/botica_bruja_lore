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

type PlantaApi = {
  slug: string;
  nombre: string;
  descripcion_breve: string;
  intenciones: IntencionPublica[];
};

type RespuestaListadoHerbal = {
  plantas: PlantaApi[];
};

export type ResultadoListadoHerbal =
  | { estado: "ok"; plantas: PlantaPublica[] }
  | { estado: "error"; mensaje: string };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

function mapearPlanta(planta: PlantaApi): PlantaPublica {
  return {
    ...planta,
    urlDetalle: `/hierbas/${planta.slug}`,
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

export async function obtenerPreviewHerbal(): Promise<ResultadoListadoHerbal> {
  const resultado = await obtenerListadoHerbal();
  if (resultado.estado === "error") {
    return resultado;
  }
  return { estado: "ok", plantas: resultado.plantas.slice(0, 6) };
}
