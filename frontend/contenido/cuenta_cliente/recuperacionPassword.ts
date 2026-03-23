export type EstadoVistaRecuperacion = "solicitud" | "token_invalido" | "token_expirado" | "token_usado" | "exito";

export function describirRecuperacionGenerica(): string {
  return "Si existe una cuenta para ese email, te enviaremos un enlace para crear una nueva contraseña.";
}

export function validarPasswordRecuperacion(password: string, confirmacion: string): string | null {
  if (password.trim().length < 8) return "La nueva contraseña debe tener al menos 8 caracteres.";
  if (password !== confirmacion) return "Las contraseñas no coinciden.";
  return null;
}

export function resolverEstadoRecuperacionPorCodigo(codigo?: string): EstadoVistaRecuperacion {
  switch (codigo) {
    case "token_expirado":
      return "token_expirado";
    case "token_usado":
      return "token_usado";
    case "token_invalido":
      return "token_invalido";
    default:
      return "solicitud";
  }
}

export function resolverMensajeEstadoRecuperacion(estado: EstadoVistaRecuperacion): string {
  switch (estado) {
    case "exito":
      return "Tu contraseña se ha actualizado correctamente. Ya puedes acceder con la nueva clave.";
    case "token_expirado":
      return "El enlace ha expirado. Solicita una nueva recuperación para continuar.";
    case "token_usado":
      return "Este enlace ya fue utilizado. Solicita una nueva recuperación si todavía la necesitas.";
    case "token_invalido":
      return "No hemos podido validar el enlace. Solicita una nueva recuperación.";
    default:
      return describirRecuperacionGenerica();
  }
}
