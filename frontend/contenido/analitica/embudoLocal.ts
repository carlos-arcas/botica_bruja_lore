export const TIPOS_EVENTO_EMBUDO_LOCAL = [
  "producto_visto",
  "producto_anadido_cesta",
  "checkout_iniciado",
  "pedido_creado",
  "pago_simulado_iniciado",
  "pago_simulado_confirmado",
  "pedido_pagado",
  "error_stock",
] as const;

export type TipoEventoEmbudoLocal = (typeof TIPOS_EVENTO_EMBUDO_LOCAL)[number];

export type EventoEmbudoLocal = {
  tipo: TipoEventoEmbudoLocal;
  timestamp: string;
  ruta?: string;
  session_id?: string;
  operation_id?: string;
  id_producto?: string;
  slug_producto?: string;
  id_pedido?: string;
  proveedor_pago?: string;
  codigo_error?: string;
  cantidad?: number;
};

export type DatosEventoEmbudoLocal = Omit<EventoEmbudoLocal, "tipo" | "timestamp">;

const CAMPOS_PII_BLOQUEADOS = [
  "email",
  "email_contacto",
  "telefono",
  "telefono_contacto",
  "direccion",
  "direccion_entrega",
  "nombre_contacto",
  "nombre_destinatario",
  "linea_1",
  "linea_2",
  "codigo_postal",
] as const;

export function construirEventoEmbudoLocal(
  tipo: TipoEventoEmbudoLocal,
  datos: DatosEventoEmbudoLocal = {},
  timestamp = new Date().toISOString(),
): EventoEmbudoLocal {
  return limpiarEvento({
    ...datos,
    tipo,
    timestamp,
  });
}

export function analiticaLocalActiva(valor = process.env.NEXT_PUBLIC_ANALITICA_LOCAL): boolean {
  return valor === "true" || (valor !== "false" && process.env.NODE_ENV === "development");
}

export function emitirEventoEmbudoLocal(tipo: TipoEventoEmbudoLocal, datos: DatosEventoEmbudoLocal = {}): void {
  if (!analiticaLocalActiva()) return;
  if (typeof console === "undefined") return;
  console.info("botica_embudo_local", construirEventoEmbudoLocal(tipo, datos));
}

export function contieneCamposPersonales(payload: Record<string, unknown>): boolean {
  return Object.keys(payload).some((clave) => CAMPOS_PII_BLOQUEADOS.includes(clave as (typeof CAMPOS_PII_BLOQUEADOS)[number]));
}

function limpiarEvento(evento: EventoEmbudoLocal): EventoEmbudoLocal {
  const limpio: EventoEmbudoLocal = {
    tipo: evento.tipo,
    timestamp: limpiarTexto(evento.timestamp) || new Date().toISOString(),
  };
  asignarTexto(limpio, "ruta", evento.ruta);
  asignarTexto(limpio, "session_id", evento.session_id);
  asignarTexto(limpio, "operation_id", evento.operation_id);
  asignarTexto(limpio, "id_producto", evento.id_producto);
  asignarTexto(limpio, "slug_producto", evento.slug_producto);
  asignarTexto(limpio, "id_pedido", evento.id_pedido);
  asignarTexto(limpio, "proveedor_pago", evento.proveedor_pago);
  asignarTexto(limpio, "codigo_error", evento.codigo_error);
  if (typeof evento.cantidad === "number" && Number.isFinite(evento.cantidad)) {
    limpio.cantidad = Math.max(0, Math.round(evento.cantidad));
  }
  return limpio;
}

function asignarTexto<K extends keyof EventoEmbudoLocal>(evento: EventoEmbudoLocal, clave: K, valor: EventoEmbudoLocal[K]): void {
  if (typeof valor !== "string") return;
  const limpio = limpiarTexto(valor);
  if (limpio) {
    evento[clave] = limpio as EventoEmbudoLocal[K];
  }
}

function limpiarTexto(valor: string): string {
  return valor.trim().slice(0, 120);
}
