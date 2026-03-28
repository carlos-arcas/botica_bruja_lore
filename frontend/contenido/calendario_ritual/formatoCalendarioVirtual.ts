export const NOMBRES_DIAS_CALENDARIO = [
  "Lun",
  "Mar",
  "Mie",
  "Jue",
  "Vie",
  "Sab",
  "Dom",
] as const;

export function formatearMesCalendario(claveMes: string): string {
  const [year, month] = claveMes.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, (month ?? 1) - 1, 1));
}

export function formatearFechaLargaCalendario(fechaISO: string): string {
  const [year, month, day] = fechaISO.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, (month ?? 1) - 1, day ?? 1));
}
