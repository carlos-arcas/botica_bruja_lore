import { CuentaDemo } from "../../infraestructura/api/cuentasDemo";

const CLAVE_ALMACEN = "botica.cuenta_demo.v1";

export type CamposCuentaDemo = {
  email: string;
  nombre_visible: string;
  clave_acceso_demo: string;
};

export function validarCamposRegistroDemo(campos: CamposCuentaDemo): string[] {
  const errores: string[] = [];

  if (!campos.email.trim() || !campos.email.includes("@")) {
    errores.push("Introduce un email válido para la cuenta demo.");
  }

  if (!campos.nombre_visible.trim()) {
    errores.push("El nombre visible es obligatorio.");
  }

  if (campos.clave_acceso_demo.trim().length < 4) {
    errores.push("La clave demo debe tener al menos 4 caracteres.");
  }

  return errores;
}

export function validarCamposAutenticacionDemo(campos: Pick<CamposCuentaDemo, "email" | "clave_acceso_demo">): string[] {
  const errores: string[] = [];

  if (!campos.email.trim() || !campos.email.includes("@")) {
    errores.push("Introduce el email usado en tu cuenta demo.");
  }

  if (!campos.clave_acceso_demo.trim()) {
    errores.push("La clave demo es obligatoria para entrar.");
  }

  return errores;
}

export function guardarSesionCuentaDemo(cuenta: CuentaDemo): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(cuenta));
}

export function leerSesionCuentaDemo(): CuentaDemo | null {
  if (typeof window === "undefined") {
    return null;
  }

  const valor = window.localStorage.getItem(CLAVE_ALMACEN);
  if (!valor) {
    return null;
  }

  try {
    const cuenta = JSON.parse(valor) as CuentaDemo;
    if (!cuenta.id_usuario || !cuenta.email || !cuenta.nombre_visible) {
      return null;
    }
    return cuenta;
  } catch {
    return null;
  }
}

export function limpiarSesionCuentaDemo(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(CLAVE_ALMACEN);
}
