import { ResultadoListado } from "../../infraestructura/api/backoffice";

export type EstadoListadoAdmin =
  | { tipo: "datos"; mensaje: string }
  | { tipo: "vacio"; mensaje: string }
  | { tipo: "denegado"; mensaje: string; detalle: string; operationId?: string }
  | { tipo: "error"; mensaje: string; detalle: string; operationId?: string };

export type EstadoRenderListadoAdmin = {
  items: Record<string, unknown>[];
  estado: EstadoListadoAdmin;
};

type OpcionesEstadoListadoAdmin = {
  mensajeVacio: string;
  mensajeDenegado: string;
  mensajeError: string;
};

function limpiarDetalle(detalle: string): string {
  return detalle.trim();
}

function construirDetalleVisible(detalle: string, operationId?: string): string {
  const detalleLimpio = limpiarDetalle(detalle);
  return operationId ? `${detalleLimpio} · operation_id: ${operationId}` : detalleLimpio;
}


export function resolverEstadoListadoVisible(
  estadoBase: EstadoListadoAdmin,
  itemsVisibles: Record<string, unknown>[],
  mensajeVacioVisible: string,
): EstadoListadoAdmin {
  if (estadoBase.tipo === "denegado" || estadoBase.tipo === "error") return estadoBase;
  if (itemsVisibles.length > 0) return { tipo: "datos", mensaje: "Datos cargados." };
  return { tipo: "vacio", mensaje: mensajeVacioVisible };
}

export function resolverEstadoRenderListadoAdmin(
  resultado: ResultadoListado,
  opciones: OpcionesEstadoListadoAdmin,
): EstadoRenderListadoAdmin {
  if (resultado.estado === "ok") {
    return resultado.items.length > 0
      ? { items: resultado.items, estado: { tipo: "datos", mensaje: "Datos cargados." } }
      : { items: [], estado: { tipo: "vacio", mensaje: opciones.mensajeVacio } };
  }

  if (resultado.estado === "denegado") {
    return {
      items: [],
      estado: {
        tipo: "denegado",
        mensaje: opciones.mensajeDenegado,
        detalle: construirDetalleVisible(resultado.detalle, resultado.operation_id),
        operationId: resultado.operation_id,
      },
    };
  }

  return {
    items: [],
    estado: {
      tipo: "error",
      mensaje: opciones.mensajeError,
      detalle: construirDetalleVisible(resultado.detalle, resultado.operation_id),
      operationId: resultado.operation_id,
    },
  };
}
