export type CuentaCliente = {
  id_usuario: string;
  email: string;
  nombre_visible: string;
  activo: boolean;
  email_verificado: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
};

export type EstadoVerificacionEmail = {
  email: string;
  email_verificado: boolean;
  expira_en: string | null;
  reenviada: boolean;
};

export type EstadoRecuperacionPassword = {
  email: string;
  expira_en: string | null;
  solicitud_generada: boolean;
};

export type DireccionCuentaCliente = {
  id_direccion: string;
  alias: string;
  nombre_destinatario: string;
  telefono_contacto: string;
  linea_1: string;
  linea_2: string;
  codigo_postal: string;
  ciudad: string;
  provincia: string;
  pais_iso: string;
  predeterminada: boolean;
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

export async function solicitarRecuperacionPassword(payload: { email: string }) {
  return enviarRecuperacion("password/recuperacion/solicitar", payload, "No pudimos preparar la recuperación de contraseña.");
}

export async function confirmarRecuperacionPassword(payload: { token: string; password: string }) {
  return enviarCuenta("password/recuperacion/confirmar", payload, "No pudimos restablecer la contraseña.");
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

export async function obtenerEstadoVerificacionEmail(): Promise<{ estado: EstadoVerificacionEmail | null; detalle?: string }> {
  const respuesta = await fetch("/api/cuenta/verificacion-email/estado", { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" });
  const data = await respuesta.json();
  return respuesta.ok ? { estado: (data.verificacion ?? null) as EstadoVerificacionEmail | null } : { estado: null, detalle: data.detalle as string | undefined };
}

export async function reenviarVerificacionEmail(payload: { email: string }): Promise<{ estado: "ok"; verificacion: EstadoVerificacionEmail } | { estado: "error"; mensaje: string }> {
  return enviarVerificacion("verificacion-email/reenviar", payload);
}

export async function confirmarVerificacionEmail(payload: { token: string }): Promise<{ estado: "ok"; cuenta: CuentaCliente } | { estado: "error"; mensaje: string; codigo?: string }> {
  return enviarCuenta("verificacion-email/confirmar", payload, "No se pudo gestionar la verificación.");
}

export async function obtenerPedidosCuentaCliente(): Promise<{ pedidos: PedidoCuentaCliente[]; detalle?: string }> {
  const respuesta = await fetch("/api/cuenta/pedidos", { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" });
  const data = await respuesta.json();
  return respuesta.ok ? { pedidos: (data.pedidos ?? []) as PedidoCuentaCliente[] } : { pedidos: [], detalle: data.detalle as string | undefined };
}

async function enviarCuenta(path: string, payload: Record<string, string>, mensajeDefecto = "No se pudo completar la autenticación."): Promise<{ estado: "ok"; cuenta: CuentaCliente } | { estado: "error"; mensaje: string; codigo?: string }> {
  try {
    const respuesta = await fetch(`/api/cuenta/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await respuesta.json();
    if (!respuesta.ok) return { estado: "error", mensaje: data.detalle ?? mensajeDefecto, codigo: data.codigo as string | undefined };
    return { estado: "ok", cuenta: data.cuenta as CuentaCliente };
  } catch {
    return { estado: "error", mensaje: "No pudimos conectar con la cuenta real." };
  }
}

async function enviarVerificacion(path: string, payload: Record<string, string>): Promise<{ estado: "ok"; verificacion: EstadoVerificacionEmail } | { estado: "error"; mensaje: string }> {
  try {
    const respuesta = await fetch(`/api/cuenta/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await respuesta.json();
    if (!respuesta.ok) return { estado: "error", mensaje: data.detalle ?? "No se pudo gestionar la verificación." };
    return { estado: "ok", verificacion: data.verificacion as EstadoVerificacionEmail };
  } catch {
    return { estado: "error", mensaje: "No pudimos conectar con la verificación de email." };
  }
}

async function enviarRecuperacion(path: string, payload: Record<string, string>, mensajeDefecto: string): Promise<{ estado: "ok"; recuperacion: EstadoRecuperacionPassword; mensaje: string } | { estado: "error"; mensaje: string; codigo?: string }> {
  try {
    const respuesta = await fetch(`/api/cuenta/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await respuesta.json();
    if (!respuesta.ok) return { estado: "error", mensaje: data.detalle ?? mensajeDefecto, codigo: data.codigo as string | undefined };
    return { estado: "ok", recuperacion: data.recuperacion as EstadoRecuperacionPassword, mensaje: data.detalle as string };
  } catch {
    return { estado: "error", mensaje: "No pudimos conectar con la recuperación de contraseña." };
  }
}


export async function obtenerDireccionesCuentaCliente(): Promise<{ direcciones: DireccionCuentaCliente[]; detalle?: string }> {
  const respuesta = await fetch("/api/cuenta/direcciones", { method: "GET", headers: { Accept: "application/json" }, cache: "no-store" });
  const data = await respuesta.json();
  return respuesta.ok ? { direcciones: (data.direcciones ?? []) as DireccionCuentaCliente[] } : { direcciones: [], detalle: data.detalle as string | undefined };
}

export async function crearDireccionCuentaCliente(payload: Record<string, string>): Promise<{ estado: "ok"; direccion: DireccionCuentaCliente } | { estado: "error"; mensaje: string }> {
  return enviarDireccion("direcciones", { method: "POST", body: JSON.stringify(payload) }, "No se pudo crear la dirección.");
}

export async function actualizarDireccionCuentaCliente(idDireccion: string, payload: Record<string, string>): Promise<{ estado: "ok"; direccion: DireccionCuentaCliente } | { estado: "error"; mensaje: string }> {
  return enviarDireccion(`direcciones/${encodeURIComponent(idDireccion)}`, { method: "PUT", body: JSON.stringify(payload) }, "No se pudo actualizar la dirección.");
}

export async function eliminarDireccionCuentaCliente(idDireccion: string): Promise<{ estado: "ok" } | { estado: "error"; mensaje: string }> {
  try {
    const respuesta = await fetch(`/api/cuenta/direcciones/${encodeURIComponent(idDireccion)}`, { method: "DELETE", headers: { Accept: "application/json" } });
    const data = await respuesta.json();
    if (!respuesta.ok) return { estado: "error", mensaje: data.detalle ?? "No se pudo eliminar la dirección." };
    return { estado: "ok" };
  } catch {
    return { estado: "error", mensaje: "No pudimos conectar con la libreta de direcciones." };
  }
}

export async function marcarDireccionPredeterminadaCuentaCliente(idDireccion: string): Promise<{ estado: "ok"; direccion: DireccionCuentaCliente } | { estado: "error"; mensaje: string }> {
  return enviarDireccion(`direcciones/${encodeURIComponent(idDireccion)}/predeterminada`, { method: "POST" }, "No se pudo marcar la dirección predeterminada.");
}

async function enviarDireccion(url: string, init: RequestInit, mensajeDefecto: string): Promise<{ estado: "ok"; direccion: DireccionCuentaCliente } | { estado: "error"; mensaje: string }> {
  try {
    const respuesta = await fetch(`/api/cuenta/${url}`, {
      ...init,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
    });
    const data = await respuesta.json();
    if (!respuesta.ok) return { estado: "error", mensaje: data.detalle ?? mensajeDefecto };
    return { estado: "ok", direccion: data.direccion as DireccionCuentaCliente };
  } catch {
    return { estado: "error", mensaje: "No pudimos conectar con la libreta de direcciones." };
  }
}
