import { NextRequest, NextResponse } from "next/server";

import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";

function esRutaLogin(pathname: string): boolean {
  return pathname === "/admin/login" || pathname === "/admin/login/";
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  if (!pathname.startsWith("/admin") || esRutaLogin(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  if (token) {
    return NextResponse.next();
  }

  const destino = new URL("/admin/login", request.url);
  destino.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: ["/admin/:path*"],
};
