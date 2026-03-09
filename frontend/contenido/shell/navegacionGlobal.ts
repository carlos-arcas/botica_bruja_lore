export type EnlaceNavegacionGlobal = {
  etiqueta: string;
  href: string;
  coincidencia: "exacta" | "prefijo";
};

export type EnlaceFooter = {
  etiqueta: string;
  href: string;
  categoria: "explorar" | "confianza";
};

export const NAVEGACION_PRINCIPAL: EnlaceNavegacionGlobal[] = [
  { etiqueta: "Inicio", href: "/", coincidencia: "exacta" },
  { etiqueta: "Colecciones", href: "/colecciones", coincidencia: "prefijo" },
  { etiqueta: "La Botica", href: "/la-botica", coincidencia: "exacta" },
  { etiqueta: "Cesta ritual", href: "/cesta", coincidencia: "exacta" },
  { etiqueta: "Encargo", href: "/encargo", coincidencia: "exacta" },
];

export const ENLACES_FOOTER: EnlaceFooter[] = [
  { etiqueta: "Colecciones curadas", href: "/colecciones", categoria: "explorar" },
  { etiqueta: "Ruta herbal", href: "/hierbas", categoria: "explorar" },
  { etiqueta: "Rituales conectados", href: "/rituales", categoria: "explorar" },
  { etiqueta: "La Botica", href: "/la-botica", categoria: "explorar" },
  { etiqueta: "Preparar encargo", href: "/encargo", categoria: "explorar" },
  { etiqueta: "Condiciones de encargo", href: "/condiciones-encargo", categoria: "confianza" },
  { etiqueta: "Envíos y preparación", href: "/envios-y-preparacion", categoria: "confianza" },
  { etiqueta: "Privacidad", href: "/privacidad", categoria: "confianza" },
];

export function esRutaActiva(rutaActual: string, enlace: EnlaceNavegacionGlobal): boolean {
  if (enlace.coincidencia === "exacta") {
    return rutaActual === enlace.href;
  }

  if (enlace.href === "/") {
    return rutaActual === "/";
  }

  return rutaActual === enlace.href || rutaActual.startsWith(`${enlace.href}/`);
}

export function construirTextoContadorCesta(totalUnidades: number): string {
  return `${totalUnidades} ${totalUnidades === 1 ? "unidad" : "unidades"} en cesta`;
}

export function debeMostrarContadorCesta(totalUnidades: number): boolean {
  return totalUnidades > 0;
}
