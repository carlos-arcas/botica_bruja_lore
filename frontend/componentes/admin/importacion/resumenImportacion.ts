import { DetalleImportacion, FilaImportacion, ResumenImportacion } from "../../../infraestructura/api/backoffice";


function crearResumenVacio(): ResumenImportacion {
  return {
    total: 0,
    validas: 0,
    warnings: 0,
    invalidas: 0,
    descartadas: 0,
    confirmadas: 0,
    con_imagen: 0,
    sin_imagen: 0,
    seleccionadas: 0,
  };
}

function resolverClaveEstado(estado: string): keyof Pick<ResumenImportacion, "validas" | "warnings" | "invalidas" | "descartadas" | "confirmadas"> | null {
  if (estado === "valida") return "validas";
  if (estado === "valida_warning" || estado === "warning") return "warnings";
  if (estado === "invalida") return "invalidas";
  if (estado === "descartada") return "descartadas";
  if (estado === "confirmada") return "confirmadas";
  return null;
}

function tieneImagen(fila: FilaImportacion): boolean {
  return Boolean(fila.imagen);
}

export function construirResumenImportacion(filas: FilaImportacion[]): ResumenImportacion {
  const resumen = crearResumenVacio();
  resumen.total = filas.length;

  filas.forEach((fila) => {
    const claveEstado = resolverClaveEstado(fila.estado);
    if (claveEstado) resumen[claveEstado] += 1;
    if (fila.seleccionado) resumen.seleccionadas += 1;
    if (tieneImagen(fila)) resumen.con_imagen += 1;
  });

  resumen.sin_imagen = resumen.total - resumen.con_imagen;
  return resumen;
}

export function actualizarDetalleImportacion(detalle: DetalleImportacion, filaActualizada: FilaImportacion): DetalleImportacion {
  const filas = detalle.filas.map((fila) => fila.id === filaActualizada.id ? filaActualizada : fila);
  return { ...detalle, filas, resumen: construirResumenImportacion(filas) };
}
