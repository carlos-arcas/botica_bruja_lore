import { NextResponse } from "next/server";

import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";
import { logoutBackofficeBackend } from "@/infraestructura/auth/clienteBackendAuth";

function extraerToken(cookieHeader: string): string | undefined {
  const coincidencia = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${NOMBRE_COOKIE_BACKOFFICE}=`));
  return coincidencia?.split("=")[1];
}

export async function POST(request: Request): Promise<Response> {
  const token = extraerToken(request.headers.get("cookie") ?? "");
  await logoutBackofficeBackend(token);

  const response = NextResponse.json({ logout: true });
  response.cookies.set(NOMBRE_COOKIE_BACKOFFICE, "", { maxAge: 0, path: "/" });
  return response;
}
