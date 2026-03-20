import { NextRequest, NextResponse } from "next/server";

import { callBackendSafe, crearProxyResponse } from "../http/callBackendSafe";
import {
  API_BACKEND_BASE,
  DURACION_COOKIE_CUENTA_CLIENTE_SEGUNDOS,
  NOMBRE_COOKIE_CUENTA_CLIENTE,
} from "./configuracion";

const METODOS_SIN_CUERPO = new Set(["GET", "HEAD"]);

export function construirUrlBackendCuenta(request: NextRequest, ruta: string[]): string {
  const query = new URL(request.url).search;
  return `${API_BACKEND_BASE}/api/v1/cuenta/${ruta.join("/")}${ruta.length ? "/" : ""}${query}`;
}

export function construirCabecerasCuenta(request: NextRequest): Headers {
  const headers = new Headers({ Accept: "application/json" });
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  const sessionId = request.cookies.get(NOMBRE_COOKIE_CUENTA_CLIENTE)?.value;
  if (sessionId) headers.set("Cookie", `sessionid=${sessionId}`);
  return headers;
}

export async function reenviarCuenta(request: NextRequest, ruta: string[]): Promise<Response> {
  const respuesta = await callBackendSafe({
    url: construirUrlBackendCuenta(request, ruta),
    method: request.method,
    headers: construirCabecerasCuenta(request),
    body: await construirBodyCuenta(request),
  });
  const proxied = crearProxyResponse(respuesta, { "Cache-Control": "no-store" });
  sincronizarCookieSesion(proxied, respuesta.headers.get("set-cookie"));
  return proxied;
}

async function construirBodyCuenta(request: NextRequest): Promise<ArrayBuffer | undefined> {
  if (METODOS_SIN_CUERPO.has(request.method)) return undefined;
  return request.arrayBuffer();
}

export function limpiarCookieSesion(response: NextResponse): NextResponse {
  response.cookies.set(NOMBRE_COOKIE_CUENTA_CLIENTE, "", { maxAge: 0, path: "/" });
  return response;
}

function sincronizarCookieSesion(response: NextResponse, setCookieHeader: string | null): void {
  if (!setCookieHeader) return;
  const match = setCookieHeader.match(/sessionid=([^;]+)/i);
  if (!match) return;
  response.cookies.set(NOMBRE_COOKIE_CUENTA_CLIENTE, match[1], {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: DURACION_COOKIE_CUENTA_CLIENTE_SEGUNDOS,
    path: "/",
  });
}
