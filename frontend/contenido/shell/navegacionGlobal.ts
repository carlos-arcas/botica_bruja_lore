import { ENLACES_LEGALES_FOOTER } from "../legal/paginasLegalesComerciales";

type CoincidenciaRuta = "exacta" | "prefijo";

export type EnlaceSubnavegacion = {
  etiqueta: string;
  href: string;
  descripcion?: string;
  coincidencia: CoincidenciaRuta;
};

export type EnlaceNavegacionGlobal = {
  etiqueta: string;
  href: string;
  coincidencia: CoincidenciaRuta;
  submenu?: EnlaceSubnavegacion[];
};

type RutaNavegable = EnlaceNavegacionGlobal | EnlaceSubnavegacion;

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

const ENLACES_TIENDA: EnlaceSubnavegacion[] = [
  {
    etiqueta: "Botica",
    href: "/botica-natural",
    descripcion: "Hierbas, mezclas y fichas comerciales de la botica.",
    coincidencia: "prefijo",
  },
  {
    etiqueta: "Velas e incienso",
    href: "/velas-e-incienso",
    descripcion: "Velas rituales, humos suaves y atmosferas sensoriales.",
    coincidencia: "prefijo",
  },
  {
    etiqueta: "Minerales y energia",
    href: "/minerales-y-energia",
    descripcion: "Piedras, minerales y piezas de apoyo energetico.",
    coincidencia: "prefijo",
  },
  {
    etiqueta: "Herramientas esotericas",
    href: "/herramientas-esotericas",
    descripcion: "Utillaje ritual y objetos de practica simbolica.",
    coincidencia: "prefijo",
  },
];

const ENLACES_GUIAS: EnlaceSubnavegacion[] = [
  {
    etiqueta: "Compendio",
    href: "/guias",
    descripcion: "Indice editorial con rutas de lectura conectadas.",
    coincidencia: "prefijo",
  },
  {
    etiqueta: "Articulos",
    href: "/guias?vista=articulos",
    descripcion: "Seleccion de articulos y guias publicadas.",
    coincidencia: "prefijo",
  },
  {
    etiqueta: "Glosario botanico",
    href: "/guias?tema=hierbas",
    descripcion: "Entrada rapida al conocimiento herbal y sus terminos.",
    coincidencia: "prefijo",
  },
  {
    etiqueta: "Propiedades de las plantas",
    href: "/hierbas",
    descripcion: "Fichas de plantas con productos y rituales relacionados.",
    coincidencia: "prefijo",
  },
  {
    etiqueta: "Rituales",
    href: "/rituales",
    descripcion: "Practicas guiadas enlazadas con plantas y catalogo.",
    coincidencia: "prefijo",
  },
];

export const NAVEGACION_PRINCIPAL: EnlaceNavegacionGlobal[] = [
  { etiqueta: "Inicio", href: "/", coincidencia: "exacta" },
  {
    etiqueta: "Tienda",
    href: "/botica-natural",
    coincidencia: "prefijo",
    submenu: ENLACES_TIENDA,
  },
  {
    etiqueta: "Guias",
    href: "/guias",
    coincidencia: "prefijo",
    submenu: ENLACES_GUIAS,
  },
  { etiqueta: "Tarot", href: "/tarot", coincidencia: "exacta" },
  { etiqueta: "Calendario ritual", href: "/calendario-ritual", coincidencia: "exacta" },
  { etiqueta: "Mi selección", href: "/cesta", coincidencia: "exacta" },
  { etiqueta: "Checkout", href: "/checkout", coincidencia: "exacta" },
  { etiqueta: "Acceso", href: "/acceso", coincidencia: "exacta" },
  { etiqueta: "Mi cuenta", href: "/mi-cuenta", coincidencia: "prefijo" },
];

const ENLACES_BASE_FOOTER: EnlaceFooter[] = [
  { etiqueta: "Botica", href: "/botica-natural" },
  { etiqueta: "Velas e incienso", href: "/velas-e-incienso" },
  { etiqueta: "Minerales y energia", href: "/minerales-y-energia" },
  { etiqueta: "Herramientas esotericas", href: "/herramientas-esotericas" },
  { etiqueta: "Compendio de guias", href: "/guias" },
  { etiqueta: "Propiedades de las plantas", href: "/hierbas" },
  { etiqueta: "Rituales conectados", href: "/rituales" },
  { etiqueta: "Calendario ritual", href: "/calendario-ritual" },
  { etiqueta: "Tarot editorial", href: "/tarot" },
  { etiqueta: "Consulta personalizada", href: "/encargo" },
];

const ENLACES_LEGALES_SECUNDARIOS: EnlaceFooter[] = ENLACES_LEGALES_FOOTER.map((enlace) => ({
  etiqueta: enlace.texto,
  href: enlace.href,
}));

export const ENLACES_FOOTER: EnlaceFooter[] = [...ENLACES_BASE_FOOTER, ...ENLACES_LEGALES_SECUNDARIOS];

export function construirNavegacionPrincipal(mostrarLogs: boolean): EnlaceNavegacionGlobal[] {
  return mostrarLogs ? [...NAVEGACION_PRINCIPAL, ENLACE_LOGS_DEBUG] : NAVEGACION_PRINCIPAL;
}

export function esRutaActiva(rutaActual: string, enlace: RutaNavegable): boolean {
  if (coincideRuta(rutaActual, enlace)) {
    return true;
  }

  return "submenu" in enlace ? enlace.submenu?.some((item) => coincideRuta(rutaActual, item)) ?? false : false;
}

function coincideRuta(
  rutaActual: string,
  enlace: Pick<RutaNavegable, "href" | "coincidencia">,
): boolean {
  const rutaEnlace = obtenerRutaBase(enlace.href);

  if (enlace.coincidencia === "exacta") {
    return rutaActual === rutaEnlace;
  }

  if (rutaEnlace === "/") {
    return rutaActual === "/";
  }

  return rutaActual === rutaEnlace || rutaActual.startsWith(`${rutaEnlace}/`);
}

function obtenerRutaBase(href: string): string {
  return href.split("?")[0] ?? href;
}

export function construirTextoContadorCesta(totalUnidades: number): string {
  return `${totalUnidades} ${totalUnidades === 1 ? "unidad" : "unidades"} en el carrito`;
}

export function debeMostrarContadorCesta(totalUnidades: number): boolean {
  return totalUnidades > 0;
}
