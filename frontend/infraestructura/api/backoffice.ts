import { API_BACKEND_BASE, NOMBRE_COOKIE_BACKOFFICE } from "../auth/configuracion";

const API_BACKOFFICE_PROXY_BASE = "/api/backoffice/proxy";

export function resolverBaseBackoffice(esNavegador: boolean): string {
  return esNavegador ? API_BACKOFFICE_PROXY_BASE : API_BACKEND_BASE;
}

function construirUrlBackoffice(ruta: string): string {
  if (typeof window === "undefined") {
    return `${resolverBaseBackoffice(false)}${ruta}`;
  }
  const normalizada = ruta.replace(/\/(\?|$)/, "$1");
  return `${resolverBaseBackoffice(true)}${normalizada}`;
}

export type ModuloAdmin = "productos" | "pedidos" | "rituales" | "editorial" | "secciones";
export type EstadoImagenImportacion = "optimizada" | "pendiente" | "ausente";

export type ResumenImportacion = {
  total: number;
  validas: number;
  warnings: number;
  invalidas: number;
  descartadas: number;
  confirmadas: number;
  con_imagen: number;
  sin_imagen: number;
  seleccionadas: number;
};

export type FilaImportacion = {
  id: number;
  numero: number;
  datos: Record<string, string>;
  errores: string[];
  warnings: string[];
  estado: string;
  seleccionado: boolean;
  imagen: string;
  estado_imagen: EstadoImagenImportacion;
  resultado_confirmacion: string;
  identificador: string;
  titulo: string;
  tipo: string;
  resumen_datos: string;
};

export type DetalleImportacion = { lote: Record<string, unknown>; resumen: ResumenImportacion; filas: FilaImportacion[] };
export type ResultadoConfirmacionImportacion = { confirmadas: number; detalle: DetalleImportacion };

export type EstadoAccesoBackoffice =
  | { estado: "autorizado"; usuario: { username: string; is_staff: boolean; is_superuser: boolean } }
  | { estado: "denegado"; detalle: string }
  | { estado: "error"; detalle: string };

export type ResultadoListado = { estado: "ok"; items: Record<string, unknown>[] } | { estado: "denegado"; detalle: string } | { estado: "error"; detalle: string };

export type PlantaAsociable = { id: string; nombre: string };

export type PayloadEnvioPedido = {
  transportista: string;
  codigo_seguimiento: string;
  envio_sin_seguimiento: boolean;
  observaciones_operativas: string;
};

function formatearErroresValidacion(errores?: Record<string, string>): string {
  if (!errores) return "";
  const entradas = Object.entries(errores).filter(([, mensaje]) => Boolean(mensaje));
  return entradas.map(([campo, mensaje]) => `${campo}: ${mensaje}`).join(" · ");
}

function cabecerasConToken(token?: string, json = true): HeadersInit {
  const base: Record<string, string> = { Accept: "application/json" };
  if (json) base["Content-Type"] = "application/json";
  if (token) base.Authorization = `Bearer ${token}`;
  return base;
}

export function extraerTokenBackoffice(cookieHeader: string): string | null {
  const entrada = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${NOMBRE_COOKIE_BACKOFFICE}=`));
  return entrada ? entrada.split("=")[1] ?? null : null;
}

export async function obtenerEstadoBackoffice(token?: string): Promise<EstadoAccesoBackoffice> {
  try {
    const respuesta = await fetch(construirUrlBackoffice("/api/v1/backoffice/estado/"), { headers: cabecerasConToken(token, false), cache: "no-store" });
    if (respuesta.status === 401 || respuesta.status === 403) return { estado: "denegado", detalle: "Debes iniciar sesión como staff para acceder al backoffice." };
    if (!respuesta.ok) return { estado: "error", detalle: "No pudimos validar la sesión administrativa en backend." };
    const data = (await respuesta.json()) as { usuario: { username: string; is_staff: boolean; is_superuser: boolean } };
    return { estado: "autorizado", usuario: data.usuario };
  } catch {
    return { estado: "error", detalle: "Error de conexión entre Next.js y backend de administración." };
  }
}

export async function obtenerListadoAdmin(modulo: ModuloAdmin, query: URLSearchParams, token?: string): Promise<ResultadoListado> {
  try {
    const respuesta = await fetch(construirUrlBackoffice(`/api/v1/backoffice/${modulo}/?${query.toString()}`), { headers: cabecerasConToken(token, false), cache: "no-store" });
    if (respuesta.status === 401 || respuesta.status === 403) return { estado: "denegado", detalle: "Sin permisos staff." };
    if (!respuesta.ok) return { estado: "error", detalle: "No se pudo cargar el módulo." };
    const data = (await respuesta.json()) as { items: Record<string, unknown>[] };
    return { estado: "ok", items: data.items ?? [] };
  } catch {
    return { estado: "error", detalle: "Error de red." };
  }
}


export async function obtenerPlantasAsociables(token?: string): Promise<PlantaAsociable[]> {
  const respuesta = await fetch(construirUrlBackoffice("/api/v1/backoffice/productos/plantas-asociables/"), { headers: cabecerasConToken(token, false), cache: "no-store" });
  if (!respuesta.ok) throw new Error("No se pudo cargar la lista de plantas asociables.");
  const data = (await respuesta.json()) as { items?: PlantaAsociable[] };
  return Array.isArray(data.items) ? data.items : [];
}

export async function guardarRegistroAdmin(modulo: ModuloAdmin, payload: Record<string, unknown>, token?: string): Promise<Record<string, unknown>> {
  const r = await fetch(construirUrlBackoffice(`/api/v1/backoffice/${modulo}/guardar/`), { method: "POST", headers: cabecerasConToken(token), body: JSON.stringify(payload) });
  if (!r.ok) {
    const data = (await r.json().catch(() => ({ detalle: "No se pudo guardar" }))) as {
      detalle?: string;
      errores?: Record<string, string>;
      operation_id?: string;
    };
    const detalle = data.detalle || "No se pudo guardar";
    const errores = formatearErroresValidacion(data.errores);
    const operationId = data.operation_id ? ` (operation_id: ${data.operation_id})` : "";
    const mensaje = [detalle, errores].filter(Boolean).join(" · ");
    throw new Error(`${mensaje || "No se pudo guardar"}${operationId}`);
  }
  const data = (await r.json()) as { item: Record<string, unknown> };
  return data.item;
}

export async function cambiarPublicacionAdmin(modulo: ModuloAdmin, id: string | number, publicado: boolean, token?: string): Promise<Record<string, unknown>> {
  const r = await fetch(construirUrlBackoffice(`/api/v1/backoffice/${modulo}/${id}/publicacion/`), { method: "POST", headers: cabecerasConToken(token), body: JSON.stringify({ publicado }) });
  if (!r.ok) throw new Error("No se pudo actualizar publicación");
  const data = (await r.json()) as { item: Record<string, unknown> };
  return data.item;
}

export async function crearLoteImportacion(formData: FormData, token?: string): Promise<number> {
  const r = await fetch(construirUrlBackoffice("/api/v1/backoffice/importacion/lotes/"), { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: formData });
  if (!r.ok) throw new Error("Error creando lote");
  const data = (await r.json()) as { lote_id: number };
  return data.lote_id;
}

export async function obtenerLoteImportacion(loteId: number, token?: string): Promise<DetalleImportacion> {
  const r = await fetch(construirUrlBackoffice(`/api/v1/backoffice/importacion/lotes/${loteId}/`), { headers: cabecerasConToken(token, false), cache: "no-store" });
  if (!r.ok) throw new Error("Error consultando lote");
  return (await r.json()) as DetalleImportacion;
}

export async function confirmarLoteImportacion(loteId: number, filasIds: number[], token?: string): Promise<ResultadoConfirmacionImportacion> {
  const r = await fetch(construirUrlBackoffice(`/api/v1/backoffice/importacion/lotes/${loteId}/confirmar/`), { method: "POST", headers: cabecerasConToken(token), body: JSON.stringify({ filas_ids: filasIds }) });
  if (!r.ok) throw new Error("Error confirmando lote");
  return (await r.json()) as ResultadoConfirmacionImportacion;
}

export async function confirmarValidasLoteImportacion(loteId: number, token?: string): Promise<ResultadoConfirmacionImportacion> {
  const r = await fetch(construirUrlBackoffice(`/api/v1/backoffice/importacion/lotes/${loteId}/confirmar-validas/`), { method: "POST", headers: cabecerasConToken(token), body: JSON.stringify({}) });
  if (!r.ok) throw new Error("Error confirmando filas válidas");
  return (await r.json()) as ResultadoConfirmacionImportacion;
}

export async function revalidarLoteImportacion(loteId: number, token?: string): Promise<{ revalidado: boolean; detalle: DetalleImportacion }> {
  const r = await fetch(construirUrlBackoffice(`/api/v1/backoffice/importacion/lotes/${loteId}/revalidar/`), { method: "POST", headers: cabecerasConToken(token), body: JSON.stringify({}) });
  if (!r.ok) throw new Error("Error revalidando lote");
  return (await r.json()) as { revalidado: boolean; detalle: DetalleImportacion };
}

export async function cancelarLoteImportacion(loteId: number, token?: string): Promise<void> {
  const r = await fetch(construirUrlBackoffice(`/api/v1/backoffice/importacion/lotes/${loteId}/cancelar/`), { method: "POST", headers: cabecerasConToken(token), body: JSON.stringify({}) });
  if (!r.ok) throw new Error("Error cancelando lote");
}

export async function cambiarSeleccionFilaImportacion(loteId: number, filaId: number, seleccionado: boolean, token?: string): Promise<FilaImportacion> {
  const r = await fetch(construirUrlBackoffice(`/api/v1/backoffice/importacion/lotes/${loteId}/filas/${filaId}/seleccion/`), { method: "POST", headers: cabecerasConToken(token), body: JSON.stringify({ seleccionado }) });
  if (!r.ok) throw new Error("Error cambiando selección");
  const data = (await r.json()) as { fila: FilaImportacion };
  return data.fila;
}

export async function descartarFilaImportacion(loteId: number, filaId: number, token?: string): Promise<FilaImportacion> {
  const r = await fetch(construirUrlBackoffice(`/api/v1/backoffice/importacion/lotes/${loteId}/filas/${filaId}/descartar/`), { method: "POST", headers: cabecerasConToken(token), body: JSON.stringify({}) });
  if (!r.ok) throw new Error("Error descartando fila");
  const data = (await r.json()) as { fila: FilaImportacion };
  return data.fila;
}

export async function adjuntarImagenFilaImportacion(loteId: number, filaId: number, imagen: File, token?: string): Promise<FilaImportacion> {
  const formData = new FormData();
  formData.set("imagen", imagen);
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const r = await fetch(construirUrlBackoffice(`/api/v1/backoffice/importacion/lotes/${loteId}/filas/${filaId}/imagen/`), { method: "POST", headers, body: formData });
  if (!r.ok) throw new Error((await r.json()).detalle || "Error adjuntando imagen");
  const data = (await r.json()) as { fila: FilaImportacion };
  return data.fila;
}

export async function eliminarImagenFilaImportacion(loteId: number, filaId: number, token?: string): Promise<FilaImportacion> {
  const r = await fetch(construirUrlBackoffice(`/api/v1/backoffice/importacion/lotes/${loteId}/filas/${filaId}/imagen/eliminar/`), { method: "POST", headers: cabecerasConToken(token), body: JSON.stringify({}) });
  if (!r.ok) throw new Error("Error eliminando imagen");
  const data = (await r.json()) as { fila: FilaImportacion };
  return data.fila;
}



export async function subirImagenBackoffice(imagen: File, prefijo: string, token?: string): Promise<string> {
  const formData = new FormData();
  formData.set("imagen", imagen);
  formData.set("prefijo", prefijo);
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const r = await fetch(construirUrlBackoffice("/api/v1/backoffice/imagenes/subir/"), { method: "POST", headers, body: formData });
  if (!r.ok) {
    const data = (await r.json().catch(() => ({ detalle: "No se pudo subir la imagen." }))) as { detalle?: string };
    throw new Error(data.detalle || "No se pudo subir la imagen.");
  }
  const data = (await r.json()) as { imagen_url: string };
  return data.imagen_url;
}

export async function descargarPlantillaImportacion(entidad: "productos" | "rituales" | "articulos_editoriales" | "secciones_publicas", formato: "csv" | "xlsx", token?: string): Promise<Blob> {
  const modulo = entidad === "articulos_editoriales" ? "editorial" : entidad === "secciones_publicas" ? "secciones" : entidad;
  return descargarExportacionAdmin(modulo, "plantilla", formato, token);
}

export async function descargarExportacionAdmin(modulo: ModuloAdmin, tipo: "plantilla" | "inventario", formato: "csv" | "xlsx", token?: string, seccion = ""): Promise<Blob> {
  const query = new URLSearchParams({ tipo, formato });
  if (seccion) query.set("seccion", seccion);
  const r = await fetch(construirUrlBackoffice(`/api/v1/backoffice/${modulo}/exportar/?${query.toString()}`), { headers: cabecerasConToken(token, false) });
  if (!r.ok) throw new Error("Error exportando módulo");
  return r.blob();
}

export async function obtenerProductosAdmin(query: URLSearchParams, token?: string): Promise<{ estado: "ok"; productos: Record<string, unknown>[]; metricas: { total: number; publicados: number; borrador: number } } | { estado: "denegado"; detalle: string } | { estado: "error"; detalle: string }> {
  const resultado = await obtenerListadoAdmin("productos", query, token);
  if (resultado.estado !== "ok") return resultado;
  const productos = resultado.items;
  return { estado: "ok", productos, metricas: { total: productos.length, publicados: productos.filter((p) => p.publicado).length, borrador: productos.filter((p) => !p.publicado).length } };
}


export async function marcarPedidoPreparando(id: string, token?: string): Promise<Record<string, unknown>> {
  return ejecutarAccionPedido(`/api/v1/backoffice/pedidos/${id}/preparando/`, {}, token, "No se pudo marcar el pedido como preparando");
}

export async function marcarPedidoEnviado(id: string, payload: PayloadEnvioPedido, token?: string): Promise<Record<string, unknown>> {
  return ejecutarAccionPedido(`/api/v1/backoffice/pedidos/${id}/enviado/`, payload, token, "No se pudo marcar el pedido como enviado");
}

export async function marcarPedidoEntregado(id: string, observaciones_operativas: string, token?: string): Promise<Record<string, unknown>> {
  return ejecutarAccionPedido(`/api/v1/backoffice/pedidos/${id}/entregado/`, { observaciones_operativas }, token, "No se pudo marcar el pedido como entregado");
}

async function ejecutarAccionPedido(ruta: string, payload: Record<string, unknown>, token: string | undefined, mensajeError: string): Promise<Record<string, unknown>> {
  const r = await fetch(construirUrlBackoffice(ruta), { method: "POST", headers: cabecerasConToken(token), body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(mensajeError);
  const data = (await r.json()) as { item: Record<string, unknown> };
  return data.item;
}
