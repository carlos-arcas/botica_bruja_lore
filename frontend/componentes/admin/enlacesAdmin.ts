import { MODULOS_NAVEGACION_ADMIN, ModuloNavegacionAdmin } from "../../infraestructura/configuracion/modulosAdmin";

export type VarianteEnlaceAdmin = "sidebar" | "tarjetas";

function permiteModuloEnVariante(modulo: ModuloNavegacionAdmin, variante: VarianteEnlaceAdmin): boolean {
  if (modulo.clave === "dashboard") {
    return false;
  }
  if (variante === "tarjetas" && (modulo.clave === "ajustes" || modulo.clave === "imagenes")) {
    return false;
  }
  return true;
}

function normalizarHrefModulo(modulo: ModuloNavegacionAdmin): string {
  if (modulo.clave === "rituales") {
    return "/admin/rituales";
  }
  return modulo.href;
}

export function obtenerEnlacesAdminVisibles(variante: VarianteEnlaceAdmin): ModuloNavegacionAdmin[] {
  return MODULOS_NAVEGACION_ADMIN
    .filter((modulo) => permiteModuloEnVariante(modulo, variante))
    .map((modulo) => ({ ...modulo, href: normalizarHrefModulo(modulo) }));
}
