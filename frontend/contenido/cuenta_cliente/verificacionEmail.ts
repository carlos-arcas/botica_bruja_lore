export type EstadoVerificacionCuenta = {
  email: string;
  email_verificado: boolean;
  expira_en?: string | null;
  reenviada?: boolean;
};

export type EstadoVistaVerificacion = "verificado" | "pendiente";
export type ResultadoConfirmacionToken = "exito" | "token_invalido" | "token_expirado" | "error";

export function resolverMensajePostRegistro(): string {
  return "Tu cuenta ya está creada. Antes de dar por cerrada la identidad real, verifica tu email desde el enlace enviado.";
}

export function resolverEstadoVistaVerificacion(estado: EstadoVerificacionCuenta): EstadoVistaVerificacion {
  return estado.email_verificado ? "verificado" : "pendiente";
}

export function describirEstadoVerificacion(estado: EstadoVerificacionCuenta): string {
  if (estado.email_verificado) return "Email verificado";
  return "Email pendiente de verificación";
}

export function describirResultadoReenvio(estado: EstadoVerificacionCuenta): string {
  if (estado.email_verificado) return "Tu email ya estaba verificado. No hace falta reenviar nada.";
  return "Hemos enviado un nuevo enlace de verificación a tu correo.";
}

export function resolverMensajeConfirmacion(resultado: ResultadoConfirmacionToken): string {
  switch (resultado) {
    case "exito":
      return "Tu email ha quedado verificado correctamente.";
    case "token_invalido":
      return "No hemos podido validar el enlace. Solicita un nuevo email de verificación.";
    case "token_expirado":
      return "El enlace ha expirado. Solicita un nuevo email de verificación desde tu cuenta.";
    default:
      return "No hemos podido completar la verificación ahora mismo.";
  }
}
