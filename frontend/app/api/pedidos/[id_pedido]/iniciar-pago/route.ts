import { NextRequest, NextResponse } from "next/server";

import { API_BACKEND_BASE, NOMBRE_COOKIE_CUENTA_CLIENTE } from "@/infraestructura/auth/configuracion";

function cabeceras(request: NextRequest): Headers {
  const headers = new Headers({ Accept: "application/json" });
  const sessionId = request.cookies.get(NOMBRE_COOKIE_CUENTA_CLIENTE)?.value;
  if (sessionId) headers.set("Cookie", `sessionid=${sessionId}`);
  return headers;
}

export async function POST(request: NextRequest, context: { params: { id_pedido: string } }): Promise<Response> {
  const respuesta = await fetch(`${API_BACKEND_BASE}/api/v1/pedidos/${encodeURIComponent(context.params.id_pedido)}/iniciar-pago/`, {
    method: "POST",
    headers: cabeceras(request),
    cache: "no-store",
  });
  return new NextResponse(await respuesta.arrayBuffer(), { status: respuesta.status, headers: { "Content-Type": respuesta.headers.get("content-type") ?? "application/json" } });
}
