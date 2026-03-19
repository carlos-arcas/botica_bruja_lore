export type CuentaCliente = {
  id_usuario: string;
  email: string;
  nombre_visible: string;
  activo: boolean;
  email_verificado: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
};

export type PedidoCuentaCliente = {
  id_pedido: string;
  estado: string;
  estado_pago: string;
  subtotal: string;
  moneda: string;
  cliente: { email_contacto: string; es_invitado: boolean; id_usuario?: string };
  expedicion: { codigo_seguimiento?: string; transportista?: string };
};

export async function registrarCuentaCliente(payload: { email: string; nombre_visible: string; password: string }) {
  return enviarCuenta("registro", payload);
}

export async function loginCuentaCliente(payload: { email: string; password: string }) {
  return enviarCuenta("login", payload);
}

export async function logoutCuentaCliente() {
  const respuesta = await fetch("/api/cuenta/logout", { method: "POST", headers: { Accept: "application/json" } });
  return respuesta.ok;
}

export async function obtenerSesionCuentaCliente(): Promise<{ autenticado: boolean; cuenta: CuentaCliente | null; detalle?: string }> {
  const respuesta = await fetch("/api/cuenta/sesion", { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" });
  const data = await respuesta.json();
  return { autenticado: Boolean(data.autenticado), cuenta: (data.cuenta ?? null) as CuentaCliente | null, detalle: data.detalle as string | undefined };
}

export async function obtenerPedidosCuentaCliente(): Promise<{ pedidos: PedidoCuentaCliente[]; detalle?: string }> {
  const respuesta = await fetch("/api/cuenta/pedidos", { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" });
  const data = await respuesta.json();
  return respuesta.ok ? { pedidos: (data.pedidos ?? []) as PedidoCuentaCliente[] } : { pedidos: [], detalle: data.detalle as string | undefined };
}

async function enviarCuenta(path: string, payload: Record<string, string>): Promise<{ estado: "ok"; cuenta: CuentaCliente } | { estado: "error"; mensaje: string }> {
  try {
    const respuesta = await fetch(`/api/cuenta/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await respuesta.json();
    if (!respuesta.ok) return { estado: "error", mensaje: data.detalle ?? "No se pudo completar la autenticación." };
    return { estado: "ok", cuenta: data.cuenta as CuentaCliente };
  } catch {
    return { estado: "error", mensaje: "No pudimos conectar con la cuenta real." };
  }
}
