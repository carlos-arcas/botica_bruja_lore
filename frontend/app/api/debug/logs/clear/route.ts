import { NextRequest, NextResponse } from "next/server";

import { API_BACKEND_BASE } from "@/infraestructura/auth/configuracion";

const DESTINO = `${API_BACKEND_BASE}/api/debug/logs/clear`;

export async function POST(request: NextRequest): Promise<Response> {
  const headers = new Headers({ Accept: "application/json", "Content-Type": "application/json" });
  const clave = request.headers.get("x-debug-log-key");
  if (clave) headers.set("X-Debug-Log-Key", clave);

  const respuesta = await fetch(DESTINO, {
    method: "POST",
    headers,
    body: await request.text(),
    cache: "no-store",
  });

  return new NextResponse(await respuesta.arrayBuffer(), {
    status: respuesta.status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
