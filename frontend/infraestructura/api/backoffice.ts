import { API_BACKEND_BASE, NOMBRE_COOKIE_BACKOFFICE } from "../auth/configuracion";

export type EstadoAccesoBackoffice =
  | { estado: "autorizado"; usuario: { username: string; is_staff: boolean; is_superuser: boolean } }
  | { estado: "denegado"; detalle: string }
  | { estado: "error"; detalle: string };

export type ProductoAdmin = {
  id: string;
  sku: string;
  slug: string;
  nombre: string;
  tipo_producto: string;
  categoria_comercial: string;
  seccion_publica: string;
  precio_visible: string;
  publicado: boolean;
};

export type ResultadoListadoProductosAdmin =
  | {
      estado: "ok";
      productos: ProductoAdmin[];
      metricas: { total: number; publicados: number; borrador: number };
    }
  | { estado: "denegado"; detalle: string }
  | { estado: "error"; detalle: string };

function cabecerasConToken(token?: string): HeadersInit {
  if (!token) {
    return { Accept: "application/json" };
  }
  return { Accept: "application/json", Authorization: `Bearer ${token}` };
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
    const respuesta = await fetch(`${API_BACKEND_BASE}/api/v1/backoffice/estado/`, {
      headers: cabecerasConToken(token),
      cache: "no-store",
    });

    if (respuesta.status === 401 || respuesta.status === 403) {
      return { estado: "denegado", detalle: "Debes iniciar sesión como staff para acceder al backoffice." };
    }
    if (!respuesta.ok) {
      return { estado: "error", detalle: "No pudimos validar la sesión administrativa en backend." };
    }

    const data = (await respuesta.json()) as { usuario: { username: string; is_staff: boolean; is_superuser: boolean } };
    return { estado: "autorizado", usuario: data.usuario };
  } catch {
    return { estado: "error", detalle: "Error de conexión entre Next.js y backend de administración." };
  }
}

export async function obtenerProductosAdmin(query: URLSearchParams, token?: string): Promise<ResultadoListadoProductosAdmin> {
  const endpoint = `${API_BACKEND_BASE}/api/v1/backoffice/productos/?${query.toString()}`;

  try {
    const respuesta = await fetch(endpoint, {
      headers: cabecerasConToken(token),
      cache: "no-store",
    });

    if (respuesta.status === 401 || respuesta.status === 403) {
      return { estado: "denegado", detalle: "Tu sesión no tiene permisos staff para gestionar productos." };
    }
    if (!respuesta.ok) {
      return { estado: "error", detalle: "No se pudo cargar el listado administrativo de productos." };
    }

    const data = (await respuesta.json()) as {
      productos: ProductoAdmin[];
      metricas: { total: number; publicados: number; borrador: number };
    };

    return { estado: "ok", productos: data.productos, metricas: data.metricas };
  } catch {
    return { estado: "error", detalle: "Error de red al consultar productos en backoffice." };
  }
}
