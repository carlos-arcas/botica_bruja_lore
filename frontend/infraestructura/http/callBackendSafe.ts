import { NextResponse } from "next/server";

const DETALLE_SERVICIO_NO_DISPONIBLE = "Servicio no disponible temporalmente. Inténtalo de nuevo más tarde.";
const STATUS_SERVICIO_NO_DISPONIBLE = 503;
const encoder = new TextEncoder();

type BackendSafeRequest = {
  url: string;
  method: string;
  headers?: HeadersInit;
  body?: BodyInit;
  cache?: RequestCache;
};

export type BackendSafeResponse = {
  ok: boolean;
  status: number;
  body: ArrayBuffer;
  headers: Headers;
};

export async function callBackendSafe(request: BackendSafeRequest): Promise<BackendSafeResponse> {
  try {
    const response = await fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      cache: request.cache ?? "no-store",
    });
    return {
      ok: response.ok,
      status: response.status,
      body: await response.arrayBuffer(),
      headers: new Headers(response.headers),
    };
  } catch {
    return crearRespuestaBackendNoDisponible();
  }
}

export function crearProxyResponse(response: BackendSafeResponse, overrides: HeadersInit = {}): NextResponse {
  const headers = new Headers(overrides);
  headers.set("Content-Type", response.headers.get("content-type") ?? "application/json");
  return new NextResponse(response.body, { status: response.status, headers });
}

function crearRespuestaBackendNoDisponible(): BackendSafeResponse {
  return {
    ok: false,
    status: STATUS_SERVICIO_NO_DISPONIBLE,
    body: encoder.encode(JSON.stringify({ detalle: DETALLE_SERVICIO_NO_DISPONIBLE })).buffer,
    headers: new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store" }),
  };
}
