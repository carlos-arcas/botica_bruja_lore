import { NextRequest, NextResponse } from "next/server";

import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";
import { validarSesionBackofficeBackend } from "@/infraestructura/auth/clienteBackendAuth";

export async function GET(request: NextRequest): Promise<Response> {
  const token = request.cookies.get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  if (!token) {
    return NextResponse.json({ autenticado: false }, { status: 401 });
  }

  const usuario = await validarSesionBackofficeBackend(token);
  if (!usuario) {
    return NextResponse.json({ autenticado: false }, { status: 401 });
  }

  return NextResponse.json({ autenticado: true, usuario });
}
