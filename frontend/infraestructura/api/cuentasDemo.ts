export type CuentaDemo = {
  id_usuario: string;
  email: string;
  nombre_visible: string;
};

export type PerfilCuentaDemo = CuentaDemo;

export type PedidoDemoHistorial = {
  id_pedido: string;
  estado: string;
  canal: string;
  email: string;
  resumen: {
    cantidad_total_items: number;
    subtotal_demo: string;
  };
};

export type ResultadoCuentaDemo =
  | { estado: "ok"; cuenta: CuentaDemo }
  | { estado: "error"; mensaje: string; codigo?: number };

export type ResultadoPerfilCuentaDemo =
  | { estado: "ok"; perfil: PerfilCuentaDemo }
  | { estado: "error"; mensaje: string; codigo?: number };

export type ResultadoHistorialCuentaDemo =
  | { estado: "ok"; idUsuario: string; pedidos: PedidoDemoHistorial[] }
  | { estado: "error"; mensaje: string; codigo?: number };

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

export async function registrarCuentaDemo(payload: {
  email: string;
  nombre_visible: string;
  clave_acceso_demo: string;
}): Promise<ResultadoCuentaDemo> {
  return enviarCuentaDemo("registro/", payload);
}

export async function autenticarCuentaDemo(payload: {
  email: string;
  clave_acceso_demo: string;
}): Promise<ResultadoCuentaDemo> {
  return enviarCuentaDemo("autenticacion/", payload);
}

export async function obtenerPerfilCuentaDemo(idUsuario: string): Promise<ResultadoPerfilCuentaDemo> {
  return consultarPerfilHistorial(`${encodeURIComponent(idUsuario)}/perfil/`, "perfil");
}

export async function obtenerHistorialCuentaDemo(idUsuario: string): Promise<ResultadoHistorialCuentaDemo> {
  const endpoint = `${API_BASE_URL}/api/v1/cuentas-demo/${encodeURIComponent(idUsuario)}/historial-pedidos/`;

  try {
    const respuesta = await fetch(endpoint, { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" });
    const payload = await respuesta.json();

    if (!respuesta.ok) {
      return {
        estado: "error",
        codigo: respuesta.status,
        mensaje: resolverMensajeError(payload, "No pudimos cargar el historial demo de pedidos."),
      };
    }

    return {
      estado: "ok",
      idUsuario: payload.id_usuario as string,
      pedidos: (payload.pedidos ?? []) as PedidoDemoHistorial[],
    };
  } catch {
    return { estado: "error", mensaje: "No hay conexión con la API de cuenta demo." };
  }
}

async function enviarCuentaDemo(path: string, body: Record<string, string>): Promise<ResultadoCuentaDemo> {
  const endpoint = `${API_BASE_URL}/api/v1/cuentas-demo/${path}`;

  try {
    const respuesta = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await respuesta.json();

    if (!respuesta.ok) {
      return {
        estado: "error",
        codigo: respuesta.status,
        mensaje: resolverMensajeError(payload, "No pudimos procesar la cuenta demo."),
      };
    }

    return { estado: "ok", cuenta: payload.cuenta as CuentaDemo };
  } catch {
    return { estado: "error", mensaje: "No hay conexión con la API de cuenta demo." };
  }
}

async function consultarPerfilHistorial(
  path: string,
  clave: "perfil",
): Promise<ResultadoPerfilCuentaDemo> {
  const endpoint = `${API_BASE_URL}/api/v1/cuentas-demo/${path}`;

  try {
    const respuesta = await fetch(endpoint, { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" });
    const payload = await respuesta.json();

    if (!respuesta.ok) {
      return {
        estado: "error",
        codigo: respuesta.status,
        mensaje: resolverMensajeError(payload, "No pudimos cargar el perfil demo."),
      };
    }

    return { estado: "ok", perfil: payload[clave] as PerfilCuentaDemo };
  } catch {
    return { estado: "error", mensaje: "No hay conexión con la API de cuenta demo." };
  }
}

function resolverMensajeError(payload: unknown, fallback: string): string {
  const detalle = typeof payload === "object" && payload !== null ? (payload as { detalle?: string }).detalle : null;
  return detalle?.trim() || fallback;
}
