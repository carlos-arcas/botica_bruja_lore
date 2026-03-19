import { CuentaDemo } from "../../infraestructura/api/cuentasDemo";

const CLAVE_PEDIDO_RECIENTE = "botica.cuenta_demo.pedido_reciente.v1";
const VERSION_PEDIDO_RECIENTE = 1;
const ANTIGUEDAD_MAXIMA_MS = 1000 * 60 * 30;

export type PedidoRecienteDemo = {
  idPedido: string;
  idUsuario: string;
  creadoEn: string;
};

type PedidoRecienteDemoPersistido = {
  version: number;
  idPedido: string;
  idUsuario: string;
  creadoEn: string;
};

export function guardarPedidoRecienteDemo(idPedido: string, cuentaDemo: CuentaDemo | null): void {
  const payload = construirPedidoRecientePersistido(idPedido, cuentaDemo);
  if (!payload || !hayAlmacenamientoDisponible()) {
    return;
  }

  window.localStorage.setItem(CLAVE_PEDIDO_RECIENTE, JSON.stringify(payload));
}

export function leerPedidoRecienteDemo(): PedidoRecienteDemo | null {
  if (!hayAlmacenamientoDisponible()) {
    return null;
  }

  const valor = window.localStorage.getItem(CLAVE_PEDIDO_RECIENTE);
  if (!valor) {
    return null;
  }

  try {
    return restaurarPedidoReciente(JSON.parse(valor) as PedidoRecienteDemoPersistido);
  } catch {
    limpiarPedidoRecienteDemo();
    return null;
  }
}

export function limpiarPedidoRecienteDemo(): void {
  if (!hayAlmacenamientoDisponible()) {
    return;
  }

  window.localStorage.removeItem(CLAVE_PEDIDO_RECIENTE);
}

export function pedidoRecientePerteneceASesion(
  pedidoReciente: PedidoRecienteDemo | null,
  cuentaDemo: CuentaDemo | null,
  idPedido?: string | null,
): pedidoReciente is PedidoRecienteDemo {
  if (!pedidoReciente || !cuentaDemo) {
    return false;
  }

  if (pedidoReciente.idUsuario !== cuentaDemo.id_usuario.trim()) {
    return false;
  }

  return !idPedido || pedidoReciente.idPedido === idPedido.trim();
}

function construirPedidoRecientePersistido(
  idPedido: string,
  cuentaDemo: CuentaDemo | null,
): PedidoRecienteDemoPersistido | null {
  const idPedidoNormalizado = idPedido.trim();
  const idUsuario = cuentaDemo?.id_usuario.trim() ?? "";
  if (!idPedidoNormalizado || !idUsuario) {
    return null;
  }

  return {
    version: VERSION_PEDIDO_RECIENTE,
    idPedido: idPedidoNormalizado,
    idUsuario,
    creadoEn: new Date().toISOString(),
  };
}

function restaurarPedidoReciente(payload: PedidoRecienteDemoPersistido): PedidoRecienteDemo | null {
  if (!esPedidoRecienteValido(payload)) {
    limpiarPedidoRecienteDemo();
    return null;
  }

  return {
    idPedido: payload.idPedido.trim(),
    idUsuario: payload.idUsuario.trim(),
    creadoEn: payload.creadoEn,
  };
}

function esPedidoRecienteValido(payload: PedidoRecienteDemoPersistido): boolean {
  return payload.version === VERSION_PEDIDO_RECIENTE
    && typeof payload.idPedido === "string"
    && Boolean(payload.idPedido.trim())
    && typeof payload.idUsuario === "string"
    && Boolean(payload.idUsuario.trim())
    && !estaCaducado(payload.creadoEn);
}

function estaCaducado(creadoEn: string): boolean {
  const timestamp = Date.parse(creadoEn);
  return !Number.isFinite(timestamp) || Date.now() - timestamp > ANTIGUEDAD_MAXIMA_MS;
}

function hayAlmacenamientoDisponible(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}
