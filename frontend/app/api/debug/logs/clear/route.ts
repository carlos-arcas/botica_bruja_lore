import { NextRequest } from "next/server";

import { API_BACKEND_BASE } from "@/infraestructura/auth/configuracion";
import { callBackendSafe, crearProxyResponse } from "@/infraestructura/http/callBackendSafe";

const DESTINO = `${API_BACKEND_BASE}/api/debug/logs/clear`;

export async function POST(request: NextRequest): Promise<Response> {
  const headers = new Headers({ Accept: "application/json", "Content-Type": "application/json" });
  const clave = request.headers.get("x-debug-log-key");
  if (clave) headers.set("X-Debug-Log-Key", clave);

  const respuesta = await callBackendSafe({
    url: DESTINO,
    method: "POST",
    headers,
    body: await request.text(),
  });

  return crearProxyResponse(respuesta, { "Cache-Control": "no-store" });
}
