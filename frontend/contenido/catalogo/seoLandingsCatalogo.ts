export type MetadataLandingCatalogo = {
  title: string;
  description: string;
  rutaCanonical: string;
};

export type EnlaceLandingCatalogo = {
  href: string;
  etiqueta: string;
};

export type IntroduccionLandingCatalogo = {
  eyebrow: string;
  h1: string;
  parrafos: string[];
  enlacesInternos: EnlaceLandingCatalogo[];
};

export const METADATA_LISTADO_HIERBAS: MetadataLandingCatalogo = {
  title: "Hierbas a granel y plantas rituales | La Botica de la Bruja Lore",
  description:
    "Explora el listado de hierbas y plantas rituales de La Botica de la Bruja Lore con acceso a fichas públicas, usos editoriales y navegación por intención.",
  rutaCanonical: "/hierbas",
};

export const INTRO_LISTADO_HIERBAS: IntroduccionLandingCatalogo = {
  eyebrow: "Catálogo herbal principal",
  h1: "Hierbas y plantas rituales",
  parrafos: [
    "Esta sección reúne las hierbas publicadas de la botica para que puedas comparar cada planta desde su intención principal y su contexto editorial.",
    "Empieza por las fichas públicas del listado y, cuando quieras ampliar recorrido, conecta con rituales y colecciones relacionadas.",
  ],
  enlacesInternos: [
    { href: "/rituales", etiqueta: "Explorar rituales conectados" },
    { href: "/colecciones", etiqueta: "Ver colecciones rituales" },
    { href: "/la-botica", etiqueta: "Conocer la curaduría de la botica" },
  ],
};

export const METADATA_LISTADO_RITUALES: MetadataLandingCatalogo = {
  title: "Rituales por intención | La Botica de la Bruja Lore",
  description:
    "Descubre rituales publicados por intención en La Botica de la Bruja Lore y entra a cada ficha para revisar materiales y enfoque editorial.",
  rutaCanonical: "/rituales",
};

export const INTRO_LISTADO_RITUALES: IntroduccionLandingCatalogo = {
  eyebrow: "Biblioteca ritual navegable",
  h1: "Rituales conectados por intención",
  parrafos: [
    "Aquí encontrarás rituales publicados para distintas intenciones, con una lectura breve que te ayuda a elegir un recorrido coherente.",
    "Cada ficha conecta con plantas relacionadas y te permite pasar a la zona comercial cuando necesites preparar una selección concreta.",
  ],
  enlacesInternos: [
    { href: "/hierbas", etiqueta: "Ver fichas de hierbas relacionadas" },
    { href: "/colecciones", etiqueta: "Explorar colecciones rituales curadas" },
    { href: "/la-botica", etiqueta: "Revisar la curaduría editorial de la botica" },
  ],
};


export const METADATA_CALENDARIO_RITUAL: MetadataLandingCatalogo = {
  title: "Calendario ritual editorial por fecha | La Botica de la Bruja Lore",
  description:
    "Consulta el calendario ritual editorial por fecha para descubrir rituales activos según reglas temporales publicadas.",
  rutaCanonical: "/calendario-ritual",
};

export const INTRO_CALENDARIO_RITUAL: IntroduccionLandingCatalogo = {
  eyebrow: "Consulta editorial temporal",
  h1: "Calendario ritual por fecha",
  parrafos: [
    "Esta entrada editorial conecta reglas temporales del calendario con rituales publicados para facilitar un descubrimiento guiado por fecha.",
    "El calendario mantiene la lógica temporal oficial; aquí solo eliges una fecha para visualizar resultados activos y navegar a cada ritual.",
  ],
  enlacesInternos: [
    { href: "/rituales", etiqueta: "Ver todos los rituales publicados" },
    { href: "/hierbas", etiqueta: "Explorar hierbas relacionadas" },
    { href: "/colecciones", etiqueta: "Continuar al catálogo comercial" },
  ],
};

export const METADATA_LISTADO_COLECCIONES: MetadataLandingCatalogo = {
  title: "Colecciones esotéricas y packs rituales | La Botica de la Bruja Lore",
  description:
    "Navega colecciones esotéricas y packs rituales de La Botica de la Bruja Lore con filtros por intención, formato y acceso directo a fichas de producto.",
  rutaCanonical: "/colecciones",
};

export const INTRO_LISTADO_COLECCIONES: IntroduccionLandingCatalogo = {
  eyebrow: "Catálogo comercial principal",
  h1: "Colecciones rituales de la botica",
  parrafos: [
    "Esta landing concentra el catálogo comercial de colecciones para facilitar una búsqueda rápida por intención, formato y disponibilidad.",
    "Puedes revisar fichas de producto desde la rejilla y complementar tu decisión volviendo a hierbas o rituales según el tipo de recorrido que prefieras.",
  ],
  enlacesInternos: [
    { href: "/hierbas", etiqueta: "Revisar hierbas publicadas por intención" },
    { href: "/rituales", etiqueta: "Consultar rituales conectados por intención" },
    { href: "/la-botica", etiqueta: "Entender el criterio editorial de la botica" },
  ],
};
