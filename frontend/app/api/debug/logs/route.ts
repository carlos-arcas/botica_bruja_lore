import { NextRequest } from "next/server";

import { API_BACKEND_BASE } from "@/infraestructura/auth/configuracion";
import { callBackendSafe, crearProxyResponse } from "@/infraestructura/http/callBackendSafe";

function construirDestino(request: NextRequest): string {
  const query = new URL(request.url).search;
  return `${API_BACKEND_BASE}/api/debug/logs${query}`;
}

export async function GET(request: NextRequest): Promise<Response> {
  const headers = new Headers({ Accept: "application/json" });
  const clave = request.headers.get("x-debug-log-key");
  if (clave) headers.set("X-Debug-Log-Key", clave);

  const respuesta = await callBackendSafe({
    url: construirDestino(request),
    method: "GET",
    headers,
  });

  return crearProxyResponse(respuesta, { "Cache-Control": "no-store" });
}
