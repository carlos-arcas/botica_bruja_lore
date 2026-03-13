import { cookies } from "next/headers";

import { NOMBRE_COOKIE_BACKOFFICE } from "./configuracion";
import { UsuarioBackoffice, validarSesionBackofficeBackend } from "./clienteBackendAuth";

export async function obtenerUsuarioBackofficeSesionActual(): Promise<UsuarioBackoffice | null> {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  if (!token) {
    return null;
  }

  return validarSesionBackofficeBackend(token);
}
