import { NextRequest, NextResponse } from "next/server";

import { API_BACKEND_BASE } from "@/infraestructura/auth/configuracion";

function construirDestino(request: NextRequest): string {
  const query = new URL(request.url).search;
  return `${API_BACKEND_BASE}/api/debug/logs${query}`;
}

export async function GET(request: NextRequest): Promise<Response> {
  const headers = new Headers({ Accept: "application/json" });
  const clave = request.headers.get("x-debug-log-key");
  if (clave) headers.set("X-Debug-Log-Key", clave);

  const respuesta = await fetch(construirDestino(request), {
    method: "GET",
    headers,
    cache: "no-store",
  });

  return new NextResponse(await respuesta.arrayBuffer(), {
    status: respuesta.status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
