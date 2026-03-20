import type { DetalleImportacion } from "../../infraestructura/api/backoffice";

export type ResultadoSincronizacionSecciones = {
  seccionesSincronizadas: string[];
  seccionesPendientes: { seccion: string; detalle: string }[];
};

export type ContextoVistaProductos = {
  modulo: string;
  seccionSincronizada: string;
  seccionVisible: string;
};

function extraerSeccionFila(detalleFila: Record<string, string>): string {
  return String(detalleFila.seccion_publica ?? "").trim();
}

function filaFueConfirmada(detalleFila: DetalleImportacion["filas"][number]): boolean {
  return detalleFila.estado === "confirmada";
}

export function debeActualizarVistaLocal({
  modulo,
  seccionSincronizada,
  seccionVisible,
}: ContextoVistaProductos): boolean {
  if (modulo !== "productos") return true;
  return seccionSincronizada === seccionVisible;
}

export function actualizarItemsSeccion(
  itemsActuales: Record<string, unknown>[],
  seccionObjetivo: string,
  itemsSeccion: Record<string, unknown>[],
): Record<string, unknown>[] {
  return [...itemsActuales.filter((item) => item.seccion_publica !== seccionObjetivo), ...itemsSeccion];
}

export function actualizarItemsSecciones(
  itemsActuales: Record<string, unknown>[],
  itemsPorSeccion: Record<string, Record<string, unknown>[]>,
): Record<string, unknown>[] {
  return Object.entries(itemsPorSeccion).reduce(
    (acumulado, [seccion, itemsSeccion]) => actualizarItemsSeccion(acumulado, seccion, itemsSeccion),
    itemsActuales,
  );
}

export function sincronizarProductoMutado(
  itemsActuales: Record<string, unknown>[],
  itemMutado: Record<string, unknown>,
): Record<string, unknown>[] {
  const resto = itemsActuales.filter((item) => String(item.id) !== String(itemMutado.id));
  return [...resto, itemMutado];
}

export function resolverSeccionesAfectadasImportacion(
  detalle: DetalleImportacion,
  seccionActiva: string,
): string[] {
  const secciones = new Set(
    detalle.filas
      .filter(filaFueConfirmada)
      .map((fila) => extraerSeccionFila(fila.datos))
      .filter(Boolean),
  );
  if (secciones.size === 0 && seccionActiva) secciones.add(seccionActiva);
  return Array.from(secciones);
}

export function construirDetalleSincronizacionSecciones(resultado: ResultadoSincronizacionSecciones): string {
  const mensajes: string[] = [];
  if (resultado.seccionesSincronizadas.length > 0) {
    mensajes.push(`Secciones sincronizadas: ${resultado.seccionesSincronizadas.join(", ")}.`);
  }
  if (resultado.seccionesPendientes.length > 0) {
    const pendientes = resultado.seccionesPendientes
      .map(({ seccion, detalle }) => `${seccion} (${detalle})`)
      .join(" · ");
    mensajes.push(`Sincronización pendiente en: ${pendientes}.`);
  }
  return mensajes.join(" ");
}
