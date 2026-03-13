export const NOMBRE_COOKIE_BACKOFFICE = "botica_backoffice_session";

export const API_BACKEND_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

export const DURACION_COOKIE_BACKOFFICE_SEGUNDOS = Number(process.env.BACKOFFICE_SESSION_MAX_AGE_SECONDS ?? 8 * 60 * 60);
