const LIMITE_OPCIONES_VISIBLES = 6;

type OpcionFiltro = { valor: string; etiqueta: string };

export function obtenerOpcionesVisibles(opciones: OpcionFiltro[], mostrarTodas: boolean): OpcionFiltro[] {
  if (mostrarTodas) return opciones;
  return opciones.slice(0, LIMITE_OPCIONES_VISIBLES);
}

export function debeMostrarControlMostrarMas(opciones: OpcionFiltro[]): boolean {
  return opciones.length > LIMITE_OPCIONES_VISIBLES;
}

export function restaurarVisibilidadReducida(): boolean {
  return false;
}
