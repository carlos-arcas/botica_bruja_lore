import { NextResponse } from "next/server";

import { DURACION_COOKIE_BACKOFFICE_SEGUNDOS, NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";
import { loginBackofficeBackend } from "@/infraestructura/auth/clienteBackendAuth";

type Credenciales = { username?: string; password?: string };

function respuestaError(detalle: string, reasonCode: string, status: number): Response {
  return NextResponse.json({ detalle, reason_code: reasonCode }, { status });
}

export async function POST(request: Request): Promise<Response> {
  try {
    const { username, password } = (await request.json()) as Credenciales;
    if (!username || !password) {
      return respuestaError("Debes completar usuario y contraseña.", "missing_credentials", 400);
    }

    const resultado = await loginBackofficeBackend(username, password);
    const response = NextResponse.json({ autenticado: true, usuario: resultado.usuario });
    response.cookies.set(NOMBRE_COOKIE_BACKOFFICE, resultado.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: DURACION_COOKIE_BACKOFFICE_SEGUNDOS,
      path: "/",
    });
    return response;
  } catch {
    return respuestaError("Credenciales inválidas para backoffice.", "invalid_credentials", 401);
  }
}
