import { construirHrefSeccionPublica, SLUG_SECCION_PUBLICA_BASELINE } from "@/componentes/catalogo/rutasProductoPublico";
import type { ErrorProductosSeccion } from "@/infraestructura/api/herbal";

export type ConfiguracionSeccionPublica = {
  slug: string;
  nombre: string;
  descripcionCatalogo: string;
  ariaCatalogo: string;
  ariaFiltros: string;
  tituloErrorCatalogo: string;
  tituloVacio: string;
  descripcionVacio: string;
};

function construirNombreVisibleDesdeSlug(slugSeccion: string): string {
  return slugSeccion
    .split("-")
    .filter(Boolean)
    .map((parte) => `${parte[0]?.toUpperCase() ?? ""}${parte.slice(1)}`)
    .join(" ");
}

function crearConfiguracionSeccionPublica(
  slug: string,
  configuracion: Omit<ConfiguracionSeccionPublica, "slug">,
): ConfiguracionSeccionPublica {
  return { slug, ...configuracion };
}

export const BOTICA_NATURAL_PUBLICA: ConfiguracionSeccionPublica = crearConfiguracionSeccionPublica(
  SLUG_SECCION_PUBLICA_BASELINE,
  {
    nombre: "Botica Natural",
    descripcionCatalogo: "Seleccion herbal publica conectada con catalogo real en produccion.",
    ariaCatalogo: "Catalogo Botica Natural",
    ariaFiltros: "Filtros de Botica Natural",
    tituloErrorCatalogo: "No pudimos cargar Botica Natural",
    tituloVacio: "Botica Natural sin productos publicados",
    descripcionVacio:
      "No hay productos publicos en esta seccion ahora mismo. Cuando se publiquen en catalogo apareceran aqui.",
  },
);

export const VELAS_E_INCIENSO_PUBLICA: ConfiguracionSeccionPublica = crearConfiguracionSeccionPublica(
  "velas-e-incienso",
  {
    nombre: "Velas e Incienso",
    descripcionCatalogo: "Seleccion ritual publica conectada con catalogo real en produccion.",
    ariaCatalogo: "Catalogo Velas e Incienso",
    ariaFiltros: "Filtros de Velas e Incienso",
    tituloErrorCatalogo: "No pudimos cargar Velas e Incienso",
    tituloVacio: "Velas e Incienso sin productos publicados",
    descripcionVacio:
      "No hay productos publicos de velas e incienso en esta seccion ahora mismo. Cuando se publiquen en catalogo apareceran aqui.",
  },
);

const CONFIGURACIONES_SECCIONES_PUBLICAS = new Map<string, ConfiguracionSeccionPublica>([
  [BOTICA_NATURAL_PUBLICA.slug, BOTICA_NATURAL_PUBLICA],
  [VELAS_E_INCIENSO_PUBLICA.slug, VELAS_E_INCIENSO_PUBLICA],
]);

const MENSAJES_ERROR_CATALOGO: Record<ErrorProductosSeccion, string> = {
  fetch_error: "No hay conexion con el backend publico de {seccion}.",
  http_error: "No se pudo consultar el catalogo publico de {seccion} (error HTTP).",
  respuesta_invalida: "El catalogo publico respondio con un formato invalido y no se puede renderizar.",
};

export function resolverMensajeErrorCatalogoSeccionPublica(
  configuracion: ConfiguracionSeccionPublica,
  tipoError: ErrorProductosSeccion,
): string {
  return MENSAJES_ERROR_CATALOGO[tipoError].replace("{seccion}", configuracion.nombre);
}

function crearConfiguracionFallback(slugSeccion: string): ConfiguracionSeccionPublica {
  const nombre = construirNombreVisibleDesdeSlug(slugSeccion || BOTICA_NATURAL_PUBLICA.slug);
  return {
    slug: slugSeccion || BOTICA_NATURAL_PUBLICA.slug,
    nombre,
    descripcionCatalogo: `Seleccion publica conectada con catalogo real en produccion para ${nombre}.`,
    ariaCatalogo: `Catalogo ${nombre}`,
    ariaFiltros: `Filtros de ${nombre}`,
    tituloErrorCatalogo: `No pudimos cargar ${nombre}`,
    tituloVacio: `${nombre} sin productos publicados`,
    descripcionVacio:
      "No hay productos publicos en esta seccion ahora mismo. Cuando se publiquen en catalogo apareceran aqui.",
  };
}

export function resolverConfiguracionSeccionPublica(slugSeccion: string): ConfiguracionSeccionPublica {
  const slugNormalizado = slugSeccion.trim() || BOTICA_NATURAL_PUBLICA.slug;
  return CONFIGURACIONES_SECCIONES_PUBLICAS.get(slugNormalizado) ?? crearConfiguracionFallback(slugNormalizado);
}

export function construirNombreSeccionPublica(slugSeccion: string): string {
  if (!slugSeccion.trim()) {
    return BOTICA_NATURAL_PUBLICA.nombre;
  }
  return resolverConfiguracionSeccionPublica(slugSeccion).nombre;
}

export function construirHrefSeccionPublicaVisible(slugSeccion: string): string {
  return construirHrefSeccionPublica(slugSeccion || BOTICA_NATURAL_PUBLICA.slug);
}
