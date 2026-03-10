import { esFechaIsoValida } from "../../contenido/rituales/calendarioRitual";

export type RitualCalendarioPublico = {
  slug: string;
  nombre: string;
  contexto_breve: string;
  nombre_regla: string;
  prioridad: number;
  urlDetalle: string;
};

type RitualCalendarioApi = {
  slug: string;
  nombre: string;
  contexto_breve: string;
  nombre_regla: string;
  prioridad: number;
};

type RespuestaCalendarioRitual = {
  fecha_consulta: string;
  rituales: RitualCalendarioApi[];
};

export type ResultadoCalendarioRitual =
  | { estado: "ok"; fechaConsulta: string; rituales: RitualCalendarioPublico[] }
  | { estado: "fecha_invalida"; mensaje: string }
  | { estado: "error"; mensaje: string };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

function mapearRitualCalendario(ritual: RitualCalendarioApi): RitualCalendarioPublico {
  return {
    ...ritual,
    urlDetalle: `/rituales/${ritual.slug}`,
  };
}

export async function consultarCalendarioRitualPorFecha(
  fechaConsulta: string,
): Promise<ResultadoCalendarioRitual> {
  if (!esFechaIsoValida(fechaConsulta)) {
    return {
      estado: "fecha_invalida",
      mensaje: "Indica una fecha válida con formato YYYY-MM-DD.",
    };
  }

  const endpoint = `${API_BASE_URL}/api/v1/calendario-ritual/?fecha=${encodeURIComponent(fechaConsulta)}`;

  try {
    const respuesta = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!respuesta.ok) {
      return {
        estado: "error",
        mensaje: "No pudimos consultar el calendario ritual en este momento.",
      };
    }

    const data: RespuestaCalendarioRitual = await respuesta.json();
    return {
      estado: "ok",
      fechaConsulta: data.fecha_consulta,
      rituales: data.rituales.map(mapearRitualCalendario),
    };
  } catch {
    return {
      estado: "error",
      mensaje: "Hay un problema de conexión entre frontend y backend para el calendario ritual.",
    };
  }
}
