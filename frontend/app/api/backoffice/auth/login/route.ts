import { NextResponse } from "next/server";

import { DURACION_COOKIE_BACKOFFICE_SEGUNDOS, NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";
import { loginBackofficeBackend } from "@/infraestructura/auth/clienteBackendAuth";

export async function POST(request: Request): Promise<Response> {
  try {
    const { username, password } = (await request.json()) as { username?: string; password?: string };
    if (!username || !password) {
      return NextResponse.json({ detalle: "Debes completar usuario y contraseña." }, { status: 400 });
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
    return NextResponse.json({ detalle: "Credenciales inválidas para backoffice." }, { status: 401 });
  }
}
