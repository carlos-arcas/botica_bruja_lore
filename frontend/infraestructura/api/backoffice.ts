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

export type ModuloAdmin = "productos" | "rituales" | "editorial" | "secciones";
export type EstadoImagenImportacion = "optimizada" | "pendiente" | "ausente";

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
};

export type DetalleImportacion = { lote: Record<string, unknown>; filas: FilaImportacion[] };

export type EstadoAccesoBackoffice =
  | { estado: "autorizado"; usuario: { username: string; is_staff: boolean; is_superuser: boolean } }
  | { estado: "denegado"; detalle: string }
  | { estado: "error"; detalle: string };

export type ResultadoListado = { estado: "ok"; items: Record<string, unknown>[] } | { estado: "denegado"; detalle: string } | { estado: "error"; detalle: string };

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


export type PlantaAsociadaBackoffice = {
  id: string;
  nombre: string;
};

export async function obtenerPlantasAsociadasBackoffice(token?: string): Promise<PlantaAsociadaBackoffice[]> {
  const r = await fetch(construirUrlBackoffice("/api/v1/backoffice/productos/plantas/"), { headers: cabecerasConToken(token, false), cache: "no-store" });
  if (!r.ok) throw new Error("No se pudieron cargar las plantas disponibles.");
  const data = (await r.json()) as { items?: PlantaAsociadaBackoffice[] };
  return Array.isArray(data.items) ? data.items : [];
}
export async function guardarRegistroAdmin(modulo: ModuloAdmin, payload: Record<string, unknown>, token?: string): Promise<Record<string, unknown>> {
  const r = await fetch(construirUrlBackoffice(`/api/v1/backoffice/${modulo}/guardar/`), { method: "POST", headers: cabecerasConToken(token), body: JSON.stringify(payload) });
  if (!r.ok) throw new Error("No se pudo guardar");
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

export async function confirmarLoteImportacion(loteId: number, filasIds: number[], token?: string): Promise<number> {
  const r = await fetch(construirUrlBackoffice(`/api/v1/backoffice/importacion/lotes/${loteId}/confirmar/`), { method: "POST", headers: cabecerasConToken(token), body: JSON.stringify({ filas_ids: filasIds }) });
  if (!r.ok) throw new Error("Error confirmando lote");
  const data = (await r.json()) as { confirmadas: number };
  return data.confirmadas;
}

export async function revalidarLoteImportacion(loteId: number, token?: string): Promise<void> {
  const r = await fetch(construirUrlBackoffice(`/api/v1/backoffice/importacion/lotes/${loteId}/revalidar/`), { method: "POST", headers: cabecerasConToken(token), body: JSON.stringify({}) });
  if (!r.ok) throw new Error("Error revalidando lote");
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
