const MARCA_BOTICA = "La Botica de la Bruja Lore";

type ConfiguracionMetadataFicha = {
  nombre: string;
  tipoFicha: "hierba" | "ritual" | "coleccion";
  resumen?: string;
  intenciones?: string[];
};

const CONTEXTO_TITLE: Record<ConfiguracionMetadataFicha["tipoFicha"], string> = {
  hierba: "Ficha herbal",
  ritual: "Ficha ritual",
  coleccion: "Colección editorial",
};

const ETIQUETA_TIPO: Record<ConfiguracionMetadataFicha["tipoFicha"], string> = {
  hierba: "hierba",
  ritual: "ritual",
  coleccion: "colección",
};

function limpiarTextoBase(texto: string): string {
  return texto.trim().replace(/\s+/g, " ");
}

function resolverBloqueIntenciones(intenciones: string[] = []): string {
  if (intenciones.length === 0) {
    return "";
  }

  return ` Intención asociada: ${intenciones.join(", ")}.`;
}

function capitalizar(texto: string): string {
  if (!texto) {
    return texto;
  }

  return texto[0].toUpperCase() + texto.slice(1);
}

export function construirTitleFichaPublica({
  nombre,
  tipoFicha,
}: ConfiguracionMetadataFicha): string {
  const nombreLimpio = limpiarTextoBase(nombre);
  return `${nombreLimpio} | ${CONTEXTO_TITLE[tipoFicha]} | ${MARCA_BOTICA}`;
}

export function construirDescriptionFichaPublica({
  nombre,
  tipoFicha,
  resumen,
  intenciones,
}: ConfiguracionMetadataFicha): string {
  const nombreLimpio = limpiarTextoBase(nombre);
  const resumenLimpio = limpiarTextoBase(
    resumen ?? `Conoce esta ${ETIQUETA_TIPO[tipoFicha]} dentro del catálogo público.`,
  );

  return `${capitalizar(ETIQUETA_TIPO[tipoFicha])} ${nombreLimpio}. ${resumenLimpio}${resolverBloqueIntenciones(intenciones)}`;
}

