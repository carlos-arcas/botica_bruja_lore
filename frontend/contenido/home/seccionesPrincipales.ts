export type IdSeccionPrincipal =
  | "botica-natural"
  | "velas-e-incienso"
  | "minerales-y-energia"
  | "herramientas-esotericas"
  | "tarot"
  | "rituales"
  | "agenda-mistica";

export type SeccionPrincipal = {
  id: IdSeccionPrincipal;
  claveI18nTitulo: string;
  ruta: string;
  imagenCard: string;
  imagenHero: string;
  orden: number;
};

const TITULOS_SECCIONES_I18N: Record<string, string> = {
  "home.secciones.boticaNatural.titulo": "Botica natural",
  "home.secciones.velasEIncienso.titulo": "Velas e incienso",
  "home.secciones.mineralesYEnergia.titulo": "Minerales y energía",
  "home.secciones.herramientasEsotericas.titulo": "Herramientas esotéricas",
  "home.secciones.tarot.titulo": "Tarot",
  "home.secciones.rituales.titulo": "Rituales",
  "home.secciones.agendaMistica.titulo": "Agenda mística",
};

export const SECCIONES_PRINCIPALES: SeccionPrincipal[] = [
  {
    id: "botica-natural",
    claveI18nTitulo: "home.secciones.boticaNatural.titulo",
    ruta: "/botica-natural",
    imagenCard: "/fondos/botica_natural_card.webp",
    imagenHero: "/fondos/botica_natural_hero.webp",
    orden: 1,
  },
  {
    id: "velas-e-incienso",
    claveI18nTitulo: "home.secciones.velasEIncienso.titulo",
    ruta: "/velas-e-incienso",
    imagenCard: "/fondos/velas_e_incienso_card.webp",
    imagenHero: "/fondos/velas_e_incienso_hero.webp",
    orden: 2,
  },
  {
    id: "minerales-y-energia",
    claveI18nTitulo: "home.secciones.mineralesYEnergia.titulo",
    ruta: "/minerales-y-energia",
    imagenCard: "/fondos/minerales_y_energia_card.webp",
    imagenHero: "/fondos/minerales_y_energia_hero.webp",
    orden: 3,
  },
  {
    id: "herramientas-esotericas",
    claveI18nTitulo: "home.secciones.herramientasEsotericas.titulo",
    ruta: "/herramientas-esotericas",
    imagenCard: "/fondos/herramientas_esotericas_card.webp",
    imagenHero: "/fondos/herramientas_esotericas_hero.webp",
    orden: 4,
  },
  {
    id: "tarot",
    claveI18nTitulo: "home.secciones.tarot.titulo",
    ruta: "/tarot",
    imagenCard: "/fondos/tarot_card.webp",
    imagenHero: "/fondos/tarot_hero.webp",
    orden: 5,
  },
  {
    id: "rituales",
    claveI18nTitulo: "home.secciones.rituales.titulo",
    ruta: "/rituales",
    imagenCard: "/fondos/rituales_card.webp",
    imagenHero: "/fondos/rituales_hero.webp",
    orden: 6,
  },
  {
    id: "agenda-mistica",
    claveI18nTitulo: "home.secciones.agendaMistica.titulo",
    ruta: "/agenda-mistica",
    imagenCard: "/fondos/agenda_mistica_card.webp",
    imagenHero: "/fondos/agenda_mistica_hero.webp",
    orden: 7,
  },
];

export function traducirSeccionPrincipal(claveI18nTitulo: string): string {
  return TITULOS_SECCIONES_I18N[claveI18nTitulo] ?? claveI18nTitulo;
}

export function obtenerSeccionesPrincipalesOrdenadas(): SeccionPrincipal[] {
  return [...SECCIONES_PRINCIPALES].sort((a, b) => a.orden - b.orden);
}

export function obtenerSeccionPrincipalPorId(id: IdSeccionPrincipal): SeccionPrincipal {
  const seccion = SECCIONES_PRINCIPALES.find((item) => item.id === id);

  if (!seccion) {
    throw new Error(`Sección principal no encontrada: ${id}`);
  }

  return seccion;
}
