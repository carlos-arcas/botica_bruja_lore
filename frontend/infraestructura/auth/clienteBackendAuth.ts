import { API_BACKEND_BASE } from "./configuracion";

export type UsuarioBackoffice = { username: string; is_staff: boolean; is_superuser: boolean };

type ResultadoLogin = { autenticado: true; token: string; token_ttl: number; usuario: UsuarioBackoffice };

function construirCabeceras(token?: string): HeadersInit {
  return token
    ? { Accept: "application/json", Authorization: `Bearer ${token}` }
    : { Accept: "application/json" };
}

export async function loginBackofficeBackend(username: string, password: string): Promise<ResultadoLogin> {
  const respuesta = await fetch(`${API_BACKEND_BASE}/api/backoffice/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });

  if (!respuesta.ok) {
    throw new Error("Credenciales inválidas");
  }

  return (await respuesta.json()) as ResultadoLogin;
}

export async function validarSesionBackofficeBackend(token: string): Promise<UsuarioBackoffice | null> {
  const respuesta = await fetch(`${API_BACKEND_BASE}/api/backoffice/auth/session/`, {
    headers: construirCabeceras(token),
    cache: "no-store",
  });

  if (!respuesta.ok) {
    return null;
  }

  const data = (await respuesta.json()) as { usuario: UsuarioBackoffice };
  return data.usuario;
}

export async function logoutBackofficeBackend(token?: string): Promise<void> {
  await fetch(`${API_BACKEND_BASE}/api/backoffice/auth/logout/`, {
    method: "POST",
    headers: construirCabeceras(token),
    cache: "no-store",
  });
}
