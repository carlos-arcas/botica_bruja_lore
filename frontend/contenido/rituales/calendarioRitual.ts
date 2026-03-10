export function esFechaIsoValida(fecha: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return false;
  }

  const [anoRaw, mesRaw, diaRaw] = fecha.split("-");
  const ano = Number(anoRaw);
  const mes = Number(mesRaw);
  const dia = Number(diaRaw);

  if (!Number.isInteger(ano) || !Number.isInteger(mes) || !Number.isInteger(dia)) {
    return false;
  }

  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) {
    return false;
  }

  const fechaUtc = new Date(Date.UTC(ano, mes - 1, dia));
  return (
    fechaUtc.getUTCFullYear() === ano &&
    fechaUtc.getUTCMonth() === mes - 1 &&
    fechaUtc.getUTCDate() === dia
  );
}

export function obtenerFechaIsoActual(): string {
  return new Date().toISOString().slice(0, 10);
}
