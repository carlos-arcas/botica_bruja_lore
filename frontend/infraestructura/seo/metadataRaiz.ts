import type { Metadata } from "next";

import { resolverTokenVerificacionGoogle } from "./verificacionSearchConsole";

export function construirMetadataRaiz(entorno: NodeJS.ProcessEnv = process.env): Metadata {
  const tokenVerificacionGoogle = resolverTokenVerificacionGoogle(entorno);

  return {
    title: "La Botica de la Bruja Lore | Botica artesanal y ritual",
    description:
      "Home editorial-comercial de La Botica de la Bruja Lore: alquimia del deseo, colecciones por intención y guía ritual accesible.",
    verification: tokenVerificacionGoogle
      ? {
          google: tokenVerificacionGoogle,
        }
      : undefined,
  };
}
