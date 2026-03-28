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

export function construirRutaOnboardingEnvioCuenta(mensaje?: string): string {
  const params = new URLSearchParams({ onboarding: "1" });
  if (mensaje?.trim()) {
    params.set("mensaje", mensaje.trim());
  }
  return `${RUTAS_CUENTA_CLIENTE.direcciones}?${params.toString()}`;
}

export function resumenCuentaRealV1(): string[] {
  return [
    "Registro y login reales con sesión segura basada en backend.",
    "Acceso y alta con Google sobre la misma cuenta real, sin abrir un sistema paralelo.",
    "Mis pedidos reales asociados automáticamente al usuario autenticado.",
    "Verificación de email real con confirmación por token y reenvío controlado.",
    "Libreta de direcciones real con una única predeterminada por cuenta y onboarding opcional tras el alta.",
    "CuentaDemo permanece congelada como flujo legado explícito.",
  ];
}
