import { ENLACES_LEGALES_FOOTER } from "../legal/paginasLegalesComerciales";

export type EnlaceNavegacionGlobal = {
  etiqueta: string;
  href: string;
  coincidencia: "exacta" | "prefijo";
};

export type EnlaceFooter = {
  etiqueta: string;
  href: string;
};

export const NAVEGACION_PRINCIPAL: EnlaceNavegacionGlobal[] = [
  { etiqueta: "Inicio", href: "/", coincidencia: "exacta" },
  { etiqueta: "Colecciones", href: "/colecciones", coincidencia: "prefijo" },
  { etiqueta: "La Botica", href: "/la-botica", coincidencia: "exacta" },
  { etiqueta: "Cesta ritual", href: "/cesta", coincidencia: "exacta" },
  { etiqueta: "Encargo", href: "/encargo", coincidencia: "exacta" },
];

const ENLACES_BASE_FOOTER: EnlaceFooter[] = [
  { etiqueta: "Colecciones curadas", href: "/colecciones" },
  { etiqueta: "Ruta herbal", href: "/hierbas" },
  { etiqueta: "Rituales conectados", href: "/rituales" },
  { etiqueta: "La Botica", href: "/la-botica" },
  { etiqueta: "Preparar encargo", href: "/encargo" },
];

export const ENLACES_FOOTER: EnlaceFooter[] = [
  ...ENLACES_BASE_FOOTER,
  ...ENLACES_LEGALES_FOOTER.map((enlace) => ({ etiqueta: enlace.texto, href: enlace.href })),
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
