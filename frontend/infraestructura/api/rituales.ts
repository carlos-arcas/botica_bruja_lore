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

type RitualApi = {
  slug: string;
  nombre: string;
  contexto_breve: string;
  intenciones: IntencionPublica[];
};

type RespuestaListadoRituales = {
  rituales: RitualApi[];
};

export type ResultadoListadoRituales =
  | { estado: "ok"; rituales: RitualPublico[] }
  | { estado: "error"; mensaje: string };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

function mapearRitual(ritual: RitualApi): RitualPublico {
  return {
    ...ritual,
    urlDetalle: `/rituales/${ritual.slug}`,
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
