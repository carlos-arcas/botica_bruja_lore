import type { Metadata } from "next";
import Link from "next/link";

import {
  EstadoErrorListadoHerbal,
  EstadoVacioListadoHerbal,
} from "@/componentes/herbal/EstadoListadoHerbal";
import { ListadoHerbal } from "@/componentes/herbal/ListadoHerbal";
import {
  INTRO_LISTADO_HIERBAS,
  METADATA_LISTADO_HIERBAS,
} from "@/contenido/catalogo/seoLandingsCatalogo";
import { obtenerListadoHerbal } from "@/infraestructura/api/herbal";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: METADATA_LISTADO_HIERBAS.title,
  description: METADATA_LISTADO_HIERBAS.description,
  rutaCanonical: METADATA_LISTADO_HIERBAS.rutaCanonical,
});

export default async function PaginaListadoHerbal(): Promise<JSX.Element> {
  const resultado = await obtenerListadoHerbal();

  return (
    <main className="contenedor-home">
      <section className="bloque-home">
        <p className="hero-portada__eyebrow">{INTRO_LISTADO_HIERBAS.eyebrow}</p>
        <h1>{INTRO_LISTADO_HIERBAS.h1}</h1>
        {INTRO_LISTADO_HIERBAS.parrafos.map((parrafo) => (
          <p key={parrafo}>{parrafo}</p>
        ))}
        <div className="hero-portada__acciones">
          {INTRO_LISTADO_HIERBAS.enlacesInternos.map((enlace) => (
            <Link key={enlace.href} href={enlace.href} className="boton boton--secundario">
              {enlace.etiqueta}
            </Link>
          ))}
        </div>
      </section>

      {resultado.estado === "error" ? (
        <EstadoErrorListadoHerbal mensaje={resultado.mensaje} />
      ) : resultado.plantas.length === 0 ? (
        <EstadoVacioListadoHerbal />
      ) : (
        <section className="bloque-home">
          <h2>Plantas disponibles</h2>
          <ListadoHerbal plantas={resultado.plantas} />
        </section>
      )}
    </main>
  );
}
