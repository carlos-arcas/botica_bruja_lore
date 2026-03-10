import type { Metadata } from "next";
import Link from "next/link";

import { CalendarioRitualEditorial } from "@/componentes/calendario_ritual/CalendarioRitualEditorial";
import {
  INTRO_CALENDARIO_RITUAL,
  METADATA_CALENDARIO_RITUAL,
} from "@/contenido/catalogo/seoLandingsCatalogo";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: METADATA_CALENDARIO_RITUAL.title,
  description: METADATA_CALENDARIO_RITUAL.description,
  rutaCanonical: METADATA_CALENDARIO_RITUAL.rutaCanonical,
});

export default function PaginaCalendarioRitual(): JSX.Element {
  return (
    <main className="contenedor-home">
      <section className="bloque-home">
        <p className="hero-portada__eyebrow">{INTRO_CALENDARIO_RITUAL.eyebrow}</p>
        <h1>{INTRO_CALENDARIO_RITUAL.h1}</h1>
        {INTRO_CALENDARIO_RITUAL.parrafos.map((parrafo) => (
          <p key={parrafo}>{parrafo}</p>
        ))}
        <div className="hero-portada__acciones">
          {INTRO_CALENDARIO_RITUAL.enlacesInternos.map((enlace) => (
            <Link key={enlace.href} href={enlace.href} className="boton boton--secundario">
              {enlace.etiqueta}
            </Link>
          ))}
        </div>
      </section>
      <CalendarioRitualEditorial />
    </main>
  );
}
