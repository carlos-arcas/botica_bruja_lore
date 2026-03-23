export const RUTAS_CUENTA_CLIENTE = {
  registro: "/registro",
  acceso: "/acceso",
  cuenta: "/mi-cuenta",
  verificarEmail: "/verificar-email",
  recuperarPassword: "/recuperar-password",
  pedidos: "/mi-cuenta/pedidos",
  direcciones: "/mi-cuenta/direcciones",
  legadoDemo: "/cuenta-demo",
} as const;

export function resumenCuentaRealV1(): string[] {
  return [
    "Registro y login reales con sesión segura basada en backend.",
    "Mis pedidos reales asociados automáticamente al usuario autenticado.",
    "Verificación de email real con confirmación por token y reenvío controlado.",
    "Libreta de direcciones real con una única predeterminada por cuenta.",
    "CuentaDemo permanece congelada como flujo legado explícito.",
  ];
}
