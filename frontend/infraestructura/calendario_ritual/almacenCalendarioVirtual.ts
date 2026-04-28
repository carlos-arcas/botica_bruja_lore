import {
  type AgendaCalendarioVirtual,
  normalizarAgendaCalendario,
} from "@/contenido/calendario_ritual/calendarioVirtual";

const CLAVE_CALENDARIO_VIRTUAL = "botica_bruja_calendario_virtual_v1";

export function leerAgendaCalendarioVirtualLocal(): AgendaCalendarioVirtual {
  if (!soportaAlmacenamientoLocal()) {
    return {};
  }

  try {
    const valor = window.localStorage.getItem(CLAVE_CALENDARIO_VIRTUAL);
    if (!valor) {
      return {};
    }
    return normalizarAgendaCalendario(JSON.parse(valor));
  } catch {
    return {};
  }
}

export function guardarAgendaCalendarioVirtualLocal(agenda: AgendaCalendarioVirtual): void {
  if (!soportaAlmacenamientoLocal()) {
    return;
  }

  window.localStorage.setItem(CLAVE_CALENDARIO_VIRTUAL, JSON.stringify(agenda));
}

function soportaAlmacenamientoLocal(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}
