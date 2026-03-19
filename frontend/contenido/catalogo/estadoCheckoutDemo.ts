import { DatosConsulta } from "./encargoConsulta";

const CLAVE_BORRADOR_CHECKOUT = "botica.checkout_demo.borrador.v1";
const VERSION_BORRADOR = 1;
const ANTIGUEDAD_MAXIMA_MS = 1000 * 60 * 60 * 24 * 7;

type BorradorCheckoutDemoPersistido = {
  version: number;
  actualizadoEn: string;
  datos: Omit<DatosConsulta, "consentimiento"> & { consentimiento?: boolean };
  continuarComoInvitado?: boolean;
};

export type BorradorCheckoutDemo = {
  datos: DatosConsulta;
  continuarComoInvitado: boolean;
};

export function guardarBorradorCheckoutDemo(datos: DatosConsulta, continuarComoInvitado: boolean): void {
  if (!hayAlmacenamientoDisponible()) {
    return;
  }

  const payload: BorradorCheckoutDemoPersistido = {
    version: VERSION_BORRADOR,
    actualizadoEn: new Date().toISOString(),
    datos: construirDatosPersistibles(datos),
    continuarComoInvitado,
  };

  window.localStorage.setItem(CLAVE_BORRADOR_CHECKOUT, JSON.stringify(payload));
}

export function leerBorradorCheckoutDemo(): BorradorCheckoutDemo | null {
  if (!hayAlmacenamientoDisponible()) {
    return null;
  }

  const valor = window.localStorage.getItem(CLAVE_BORRADOR_CHECKOUT);
  if (!valor) {
    return null;
  }

  try {
    return restaurarBorradorDesdeJson(JSON.parse(valor) as BorradorCheckoutDemoPersistido);
  } catch {
    limpiarBorradorCheckoutDemo();
    return null;
  }
}

export function limpiarBorradorCheckoutDemo(): void {
  if (!hayAlmacenamientoDisponible()) {
    return;
  }

  window.localStorage.removeItem(CLAVE_BORRADOR_CHECKOUT);
}

export function esRutaInternaSeguraParaReturnTo(ruta: string | null | undefined): ruta is string {
  if (!ruta) {
    return false;
  }

  return /^\/(?!\/)/.test(ruta);
}

export function construirRutaCuentaDemoConRetornoSeguro(rutaRetorno: string): string {
  const destino = esRutaInternaSeguraParaReturnTo(rutaRetorno) ? rutaRetorno : "/cuenta-demo";
  const params = new URLSearchParams({ returnTo: destino });
  return `/cuenta-demo?${params.toString()}`;
}

function construirDatosPersistibles(datos: DatosConsulta): BorradorCheckoutDemoPersistido["datos"] {
  return {
    nombre: datos.nombre,
    email: datos.email,
    telefono: datos.telefono,
    productoSlug: datos.productoSlug,
    cantidad: datos.cantidad,
    mensaje: datos.mensaje,
  };
}

function restaurarBorradorDesdeJson(payload: BorradorCheckoutDemoPersistido): BorradorCheckoutDemo | null {
  if (!esBorradorPersistidoValido(payload)) {
    limpiarBorradorCheckoutDemo();
    return null;
  }

  return {
    datos: {
      ...payload.datos,
      consentimiento: false,
    },
    continuarComoInvitado: payload.continuarComoInvitado ?? true,
  };
}

function esBorradorPersistidoValido(payload: BorradorCheckoutDemoPersistido): boolean {
  return payload.version === VERSION_BORRADOR && !estaCaducado(payload.actualizadoEn) && tieneDatosMinimos(payload.datos);
}

function estaCaducado(actualizadoEn: string): boolean {
  const timestamp = Date.parse(actualizadoEn);
  return !Number.isFinite(timestamp) || Date.now() - timestamp > ANTIGUEDAD_MAXIMA_MS;
}

function tieneDatosMinimos(datos: BorradorCheckoutDemoPersistido["datos"]): boolean {
  return typeof datos.nombre === "string"
    && typeof datos.email === "string"
    && typeof datos.telefono === "string"
    && typeof datos.productoSlug === "string"
    && typeof datos.cantidad === "string"
    && typeof datos.mensaje === "string";
}

function hayAlmacenamientoDisponible(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}
