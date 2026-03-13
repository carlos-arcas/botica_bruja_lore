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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

function construirCabeceras(cookieHeader?: string): HeadersInit {
  return cookieHeader ? { Accept: "application/json", Cookie: cookieHeader } : { Accept: "application/json" };
}

export async function obtenerEstadoBackoffice(cookieHeader?: string): Promise<EstadoAccesoBackoffice> {
  try {
    const respuesta = await fetch(`${API_BASE_URL}/api/v1/backoffice/estado/`, {
      headers: construirCabeceras(cookieHeader),
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

export async function obtenerProductosAdmin(
  query: URLSearchParams,
  cookieHeader?: string,
): Promise<ResultadoListadoProductosAdmin> {
  const endpoint = `${API_BASE_URL}/api/v1/backoffice/productos/?${query.toString()}`;

  try {
    const respuesta = await fetch(endpoint, {
      headers: construirCabeceras(cookieHeader),
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
