import type { Metadata } from "next";
import Link from "next/link";

import {
  EstadoErrorListadoRituales,
  EstadoVacioListadoRituales,
} from "@/componentes/rituales/EstadoListadoRituales";
import { ListadoRituales } from "@/componentes/rituales/ListadoRituales";
import {
  INTRO_LISTADO_RITUALES,
  METADATA_LISTADO_RITUALES,
} from "@/contenido/catalogo/seoLandingsCatalogo";
import { obtenerListadoRituales } from "@/infraestructura/api/rituales";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: METADATA_LISTADO_RITUALES.title,
  description: METADATA_LISTADO_RITUALES.description,
  rutaCanonical: METADATA_LISTADO_RITUALES.rutaCanonical,
});

export default async function PaginaListadoRituales(): Promise<JSX.Element> {
  const resultado = await obtenerListadoRituales();

  return (
    <main className="contenedor-home">
      <section className="bloque-home">
        <p className="hero-portada__eyebrow">{INTRO_LISTADO_RITUALES.eyebrow}</p>
        <h1>{INTRO_LISTADO_RITUALES.h1}</h1>
        {INTRO_LISTADO_RITUALES.parrafos.map((parrafo) => (
          <p key={parrafo}>{parrafo}</p>
        ))}
        <div className="hero-portada__acciones">
          {INTRO_LISTADO_RITUALES.enlacesInternos.map((enlace) => (
            <Link key={enlace.href} href={enlace.href} className="boton boton--secundario">
              {enlace.etiqueta}
            </Link>
          ))}
        </div>
      </section>

      {resultado.estado === "error" ? (
        <EstadoErrorListadoRituales mensaje={resultado.mensaje} />
      ) : resultado.rituales.length === 0 ? (
        <EstadoVacioListadoRituales />
      ) : (
        <section className="bloque-home">
          <h2>Rituales publicados</h2>
          <ListadoRituales rituales={resultado.rituales} />
        </section>
      )}
    </main>
  );
}
