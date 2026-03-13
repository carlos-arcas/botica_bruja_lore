import { NextResponse, type NextRequest } from "next/server";

import { resolverDestinoAdmin } from "@/infraestructura/configuracion/adminRedirect";

export function GET(
  request: NextRequest,
  contexto: { params: { rutaAdmin?: string[] } },
): NextResponse {
  return NextResponse.redirect(resolverDestinoAdmin(request.nextUrl.search, contexto.params.rutaAdmin), 307);
}
