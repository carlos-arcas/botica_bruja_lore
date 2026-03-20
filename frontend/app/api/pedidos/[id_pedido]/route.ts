import { NextRequest } from "next/server";

import { API_BACKEND_BASE, NOMBRE_COOKIE_CUENTA_CLIENTE } from "@/infraestructura/auth/configuracion";
import { callBackendSafe, crearProxyResponse } from "@/infraestructura/http/callBackendSafe";

function cabeceras(request: NextRequest): Headers {
  const headers = new Headers({ Accept: "application/json" });
  const sessionId = request.cookies.get(NOMBRE_COOKIE_CUENTA_CLIENTE)?.value;
  if (sessionId) headers.set("Cookie", `sessionid=${sessionId}`);
  return headers;
}

export async function GET(request: NextRequest, context: { params: { id_pedido: string } }): Promise<Response> {
  const respuesta = await callBackendSafe({
    url: `${API_BACKEND_BASE}/api/v1/pedidos/${encodeURIComponent(context.params.id_pedido)}/`,
    method: "GET",
    headers: cabeceras(request),
  });
  return crearProxyResponse(respuesta);
}
