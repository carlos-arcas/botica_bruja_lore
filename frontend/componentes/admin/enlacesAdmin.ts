import { MODULOS_NAVEGACION_ADMIN, ModuloNavegacionAdmin } from "../../infraestructura/configuracion/modulosAdmin";

export type VarianteEnlaceAdmin = "topbar" | "tarjetas";

function permiteModuloEnVariante(modulo: ModuloNavegacionAdmin, variante: VarianteEnlaceAdmin): boolean {
  if (modulo.clave === "dashboard" || modulo.clave === "importacion" || modulo.clave === "secciones") {
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

function normalizarEtiquetaModulo(modulo: ModuloNavegacionAdmin): string {
  if (modulo.clave === "editorial") return "Artículos";
  return modulo.etiqueta;
}

export function obtenerEnlacesAdminVisibles(variante: VarianteEnlaceAdmin): ModuloNavegacionAdmin[] {
  return MODULOS_NAVEGACION_ADMIN
    .filter((modulo) => permiteModuloEnVariante(modulo, variante))
    .map((modulo) => ({ ...modulo, href: normalizarHrefModulo(modulo), etiqueta: normalizarEtiquetaModulo(modulo) }));
}
