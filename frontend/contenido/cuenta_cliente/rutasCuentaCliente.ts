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
    "Registro y acceso a tu cuenta de cliente.",
    "Pedidos asociados automaticamente a tu usuario.",
    "Verificacion de email y reenvio controlado cuando lo necesites.",
    "Libreta de direcciones con una direccion predeterminada por cuenta.",
    "La experiencia principal se centraliza en Mi cuenta.",
  ];
}
