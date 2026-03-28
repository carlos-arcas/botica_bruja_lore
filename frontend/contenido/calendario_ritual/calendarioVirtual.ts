export type AgendaDiaCalendarioVirtual = {
  nota: string;
  rituales: string[];
};

export type AgendaCalendarioVirtual = Record<string, AgendaDiaCalendarioVirtual>;

export type DiaCalendarioVirtual = {
  fechaISO: string;
  numeroDia: number;
  perteneceMesVisible: boolean;
  esHoy: boolean;
  tieneNota: boolean;
  totalRituales: number;
};

const TOTAL_CELDAS_MES = 42;

export function obtenerFechaLocalISO(referencia: Date = new Date()): string {
  return formatearFechaLocal(referencia.getFullYear(), referencia.getMonth(), referencia.getDate());
}

export function resolverClaveMes(fechaISO: string): string {
  return fechaISO.slice(0, 7);
}

export function desplazarClaveMes(claveMes: string, deltaMeses: number): string {
  const [year, month] = claveMes.split("-").map(Number);
  const referencia = new Date(year, (month ?? 1) - 1 + deltaMeses, 1);
  return `${referencia.getFullYear()}-${rellenarDosDigitos(referencia.getMonth() + 1)}`;
}

export function construirRejillaCalendario(
  claveMes: string,
  agenda: AgendaCalendarioVirtual,
  hoyISO: string = obtenerFechaLocalISO(),
): DiaCalendarioVirtual[] {
  const [year, month] = claveMes.split("-").map(Number);
  const inicioMes = new Date(year, (month ?? 1) - 1, 1);
  const offsetLunes = (inicioMes.getDay() + 6) % 7;
  const inicioRejilla = new Date(year, (month ?? 1) - 1, 1 - offsetLunes);

  return Array.from({ length: TOTAL_CELDAS_MES }, (_, indice) => {
    const fecha = new Date(inicioRejilla);
    fecha.setDate(inicioRejilla.getDate() + indice);
    const fechaISO = formatearFechaLocal(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
    const entrada = agenda[fechaISO];
    return {
      fechaISO,
      numeroDia: fecha.getDate(),
      perteneceMesVisible: fecha.getMonth() === inicioMes.getMonth(),
      esHoy: fechaISO === hoyISO,
      tieneNota: Boolean(entrada?.nota.trim()),
      totalRituales: entrada?.rituales.length ?? 0,
    };
  });
}

export function actualizarAgendaCalendario(
  agenda: AgendaCalendarioVirtual,
  fechaISO: string,
  nota: string,
  rituales: string[],
): AgendaCalendarioVirtual {
  const entrada = normalizarEntradaAgenda({ nota, rituales });
  const siguiente = { ...agenda };

  if (!entrada.nota && entrada.rituales.length === 0) {
    delete siguiente[fechaISO];
    return siguiente;
  }

  siguiente[fechaISO] = entrada;
  return siguiente;
}

export function normalizarAgendaCalendario(agenda: unknown): AgendaCalendarioVirtual {
  if (!agenda || typeof agenda !== "object") {
    return {};
  }

  const agendaNormalizada: AgendaCalendarioVirtual = {};
  for (const [fechaISO, valor] of Object.entries(agenda as Record<string, unknown>)) {
    if (!esFechaISOValida(fechaISO)) {
      continue;
    }

    const entrada = normalizarEntradaAgenda(valor);
    if (!entrada.nota && entrada.rituales.length === 0) {
      continue;
    }

    agendaNormalizada[fechaISO] = entrada;
  }

  return agendaNormalizada;
}

export function esFechaISOValida(fechaISO: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(fechaISO);
}

function normalizarEntradaAgenda(entrada: unknown): AgendaDiaCalendarioVirtual {
  const nota =
    typeof (entrada as { nota?: unknown })?.nota === "string"
      ? (entrada as { nota: string }).nota.trim()
      : "";
  const rituales = Array.isArray((entrada as { rituales?: unknown })?.rituales)
    ? Array.from(
        new Set(
          (entrada as { rituales: unknown[] }).rituales
            .filter((ritual): ritual is string => typeof ritual === "string")
            .map((ritual) => ritual.trim())
            .filter(Boolean),
        ),
      )
    : [];

  return { nota, rituales };
}

function formatearFechaLocal(year: number, monthIndex: number, day: number): string {
  return `${year}-${rellenarDosDigitos(monthIndex + 1)}-${rellenarDosDigitos(day)}`;
}

function rellenarDosDigitos(valor: number): string {
  return String(valor).padStart(2, "0");
}
