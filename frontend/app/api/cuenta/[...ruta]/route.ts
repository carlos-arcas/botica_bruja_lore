import { NextRequest, NextResponse } from "next/server";

import { limpiarCookieSesion, reenviarCuenta } from "@/infraestructura/auth/cuentaClienteProxy";

export async function GET(request: NextRequest, context: { params: { ruta: string[] } }): Promise<Response> {
  return reenviarCuenta(request, context.params.ruta);
}

export async function POST(request: NextRequest, context: { params: { ruta: string[] } }): Promise<Response> {
  const respuesta = await reenviarCuenta(request, context.params.ruta);
  if (context.params.ruta.join("/") === "logout") {
    return limpiarCookieSesion(respuesta as NextResponse);
  }
  return respuesta;
}

export async function PUT(request: NextRequest, context: { params: { ruta: string[] } }): Promise<Response> {
  return reenviarCuenta(request, context.params.ruta);
}

export async function DELETE(request: NextRequest, context: { params: { ruta: string[] } }): Promise<Response> {
  return reenviarCuenta(request, context.params.ruta);
}
