import type { Metadata } from "next";

export type ConfiguracionMetadataSeo = {
  title: string;
  description: string;
  rutaCanonical?: string;
  indexable?: boolean;
};

export function resolverBaseSitioPublico(
  entorno: NodeJS.ProcessEnv = process.env,
): string | null {
  const candidata = (entorno.PUBLIC_SITE_URL ?? entorno.NEXT_PUBLIC_SITE_URL ?? "")
    .trim()
    .replace(/\/$/, "");

  if (!candidata) {
    return null;
  }

  try {
    const url = new URL(candidata);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return candidata;
    }
  } catch {
    return null;
  }

  return null;
}

export function normalizarRutaCanonical(ruta: string): string {
  const rutaSinQuery = ruta.split("?")[0]?.split("#")[0] ?? "/";
  const conPrefijo = rutaSinQuery.startsWith("/") ? rutaSinQuery : `/${rutaSinQuery}`;

  if (conPrefijo === "/") {
    return "/";
  }

  return conPrefijo.replace(/\/+$/, "");
}

export function resolverUrlCanonicalAbsoluta(
  rutaCanonical: string,
  entorno: NodeJS.ProcessEnv = process.env,
): string | null {
  const baseSitio = resolverBaseSitioPublico(entorno);

  if (!baseSitio) {
    return null;
  }

  return `${baseSitio}${normalizarRutaCanonical(rutaCanonical)}`;
}

export function construirMetadataSeo({
  title,
  description,
  rutaCanonical,
  indexable = true,
}: ConfiguracionMetadataSeo): Metadata {
  const baseSitio = resolverBaseSitioPublico();
  const metadata: Metadata = {
    title,
    description,
    robots: {
      index: indexable,
      follow: true,
    },
  };

  if (baseSitio) {
    metadata.metadataBase = new URL(baseSitio);
  }

  if (indexable && rutaCanonical) {
    metadata.alternates = {
      canonical: normalizarRutaCanonical(rutaCanonical),
    };
  }

  return metadata;
}
