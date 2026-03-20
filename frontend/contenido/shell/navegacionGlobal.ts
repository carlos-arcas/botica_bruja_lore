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

export const ETIQUETA_ENLACE_ADMIN_CABECERA = "Acceso admin";


const ENLACE_LOGS_DEBUG: EnlaceNavegacionGlobal = {
  etiqueta: "Logs",
  href: "/debug/logs",
  coincidencia: "exacta",
};

export const NAVEGACION_PRINCIPAL: EnlaceNavegacionGlobal[] = [
  { etiqueta: "Inicio", href: "/", coincidencia: "exacta" },
  { etiqueta: "Colecciones", href: "/colecciones", coincidencia: "prefijo" },
  { etiqueta: "La Botica", href: "/la-botica", coincidencia: "exacta" },
  { etiqueta: "Guías", href: "/guias", coincidencia: "prefijo" },
  { etiqueta: "Tarot", href: "/tarot", coincidencia: "exacta" },
  { etiqueta: "Calendario ritual", href: "/calendario-ritual", coincidencia: "exacta" },
  { etiqueta: "Mi selección", href: "/cesta", coincidencia: "exacta" },
  { etiqueta: "Encargo", href: "/encargo", coincidencia: "exacta" },
  { etiqueta: "Acceso", href: "/acceso", coincidencia: "exacta" },
  { etiqueta: "Mi cuenta", href: "/mi-cuenta", coincidencia: "prefijo" },
  { etiqueta: "Cuenta demo", href: "/cuenta-demo", coincidencia: "exacta" },
];

const ENLACES_BASE_FOOTER: EnlaceFooter[] = [
  { etiqueta: "Colecciones curadas", href: "/colecciones" },
  { etiqueta: "Ruta herbal", href: "/hierbas" },
  { etiqueta: "Rituales conectados", href: "/rituales" },
  { etiqueta: "Calendario ritual", href: "/calendario-ritual" },
  { etiqueta: "La Botica", href: "/la-botica" },
  { etiqueta: "Guías editoriales", href: "/guias" },
  { etiqueta: "Tarot editorial", href: "/tarot" },
  { etiqueta: "Preparar encargo", href: "/encargo" },
];

const ENLACES_LEGALES_SECUNDARIOS: EnlaceFooter[] = ENLACES_LEGALES_FOOTER.map((enlace) => ({
  etiqueta: enlace.texto,
  href: enlace.href,
}));

export const ENLACES_FOOTER: EnlaceFooter[] = [...ENLACES_BASE_FOOTER, ...ENLACES_LEGALES_SECUNDARIOS];

export function construirNavegacionPrincipal(mostrarLogs: boolean): EnlaceNavegacionGlobal[] {
  return mostrarLogs ? [...NAVEGACION_PRINCIPAL, ENLACE_LOGS_DEBUG] : NAVEGACION_PRINCIPAL;
}

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
  return `${totalUnidades} ${totalUnidades === 1 ? "unidad" : "unidades"} en mi selección`;
}

export function debeMostrarContadorCesta(totalUnidades: number): boolean {
  return totalUnidades > 0;
}
