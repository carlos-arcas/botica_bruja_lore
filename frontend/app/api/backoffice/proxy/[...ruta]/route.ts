import { NextRequest, NextResponse } from "next/server";

import { API_BACKEND_BASE, NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";

const METODOS_SIN_CUERPO = new Set(["GET", "HEAD"]);

function construirUrlBackend(request: NextRequest, ruta: string[]): string {
  const query = new URL(request.url).search;
  return `${API_BACKEND_BASE}/${ruta.join("/")}/${query}`;
}

function construirCabeceras(request: NextRequest): Headers {
  const headers = new Headers();
  const auth = request.headers.get("authorization");
  const tokenCookie = request.cookies.get(NOMBRE_COOKIE_BACKOFFICE)?.value;

  if (auth) {
    headers.set("Authorization", auth);
  } else if (tokenCookie) {
    headers.set("Authorization", `Bearer ${tokenCookie}`);
  }

  const accept = request.headers.get("accept");
  if (accept) headers.set("Accept", accept);
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);
  return headers;
}

async function reenviar(request: NextRequest, context: { params: { ruta: string[] } }): Promise<Response> {
  const url = construirUrlBackend(request, context.params.ruta);
  const init: RequestInit = {
    method: request.method,
    headers: construirCabeceras(request),
    body: METODOS_SIN_CUERPO.has(request.method) ? undefined : await request.arrayBuffer(),
    cache: "no-store",
  };

  const respuesta = await fetch(url, init);
  const contentType = respuesta.headers.get("content-type") || "application/octet-stream";
  const headers = new Headers({ "Content-Type": contentType, "Cache-Control": "no-store" });
  const disposition = respuesta.headers.get("content-disposition");
  if (disposition) headers.set("Content-Disposition", disposition);
  return new NextResponse(await respuesta.arrayBuffer(), { status: respuesta.status, headers });
}

export async function GET(request: NextRequest, context: { params: { ruta: string[] } }): Promise<Response> {
  return reenviar(request, context);
}

export async function POST(request: NextRequest, context: { params: { ruta: string[] } }): Promise<Response> {
  return reenviar(request, context);
}
