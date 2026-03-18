export type ModuloNavegacionAdmin = {
  clave: "dashboard" | "productos" | "rituales" | "editorial" | "secciones" | "importacion" | "imagenes" | "ajustes";
  href: string;
  etiqueta: string;
  descripcion?: string;
};

export const MODULOS_NAVEGACION_ADMIN: ModuloNavegacionAdmin[] = [
  { clave: "dashboard", href: "/admin", etiqueta: "Dashboard", descripcion: "Estado general del backoffice." },
  { clave: "productos", href: "/admin/productos", etiqueta: "Productos", descripcion: "Catálogo comercial, publicación y orden." },
  { clave: "rituales", href: "/admin/rituales", etiqueta: "Rituales", descripcion: "Rutas rituales y relaciones con plantas." },
  { clave: "editorial", href: "/admin/editorial", etiqueta: "Artículos", descripcion: "Artículos, hubs y contenidos públicos." },
  { clave: "importacion", href: "/admin/importacion", etiqueta: "Importación masiva", descripcion: "Entrada operativa para cargas bulk." },
  { clave: "imagenes", href: "/admin/imagenes", etiqueta: "Imágenes", descripcion: "Control de activos visuales pendientes." },
  { clave: "ajustes", href: "/admin/ajustes", etiqueta: "Ajustes", descripcion: "Parámetros de operación y accesos." },
];

export function resolverHrefModuloAdmin(clave: ModuloNavegacionAdmin["clave"]): string {
  return MODULOS_NAVEGACION_ADMIN.find((modulo) => modulo.clave === clave)?.href ?? "/admin";
}
