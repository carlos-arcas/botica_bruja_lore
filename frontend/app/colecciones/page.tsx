import type { Metadata } from "next";
import Link from "next/link";

import { CatalogoColecciones } from "@/componentes/catalogo/CatalogoColecciones";
import { IndicadorCestaRitual } from "@/componentes/catalogo/cesta/IndicadorCestaRitual";
import { JsonLd } from "@/componentes/seo/JsonLd";
import {
  INTRO_LISTADO_COLECCIONES,
  METADATA_LISTADO_COLECCIONES,
} from "@/contenido/catalogo/seoLandingsCatalogo";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import { construirSchemasLandingCatalogo } from "@/infraestructura/seo/structuredData";

export const metadata: Metadata = construirMetadataSeo({
  title: METADATA_LISTADO_COLECCIONES.title,
  description: METADATA_LISTADO_COLECCIONES.description,
  rutaCanonical: METADATA_LISTADO_COLECCIONES.rutaCanonical,
});

type Props = {
  searchParams?: { q?: string; in?: string; cat?: string; ord?: string };
};

export default function PaginaColecciones({ searchParams }: Props): JSX.Element {
  const schemasLanding = construirSchemasLandingCatalogo({
    ruta: METADATA_LISTADO_COLECCIONES.rutaCanonical,
    titulo: METADATA_LISTADO_COLECCIONES.title,
    descripcion: METADATA_LISTADO_COLECCIONES.description,
    nombreListado: "Colecciones",
  });

  return (
    <main className="contenedor-home">
      {schemasLanding.length > 0 ? <JsonLd id="schema-landing-colecciones" data={schemasLanding} /> : null}
      <section className="bloque-home">
        <p className="hero-portada__eyebrow">{INTRO_LISTADO_COLECCIONES.eyebrow}</p>
        {INTRO_LISTADO_COLECCIONES.parrafos.map((parrafo) => (
          <p key={parrafo}>{parrafo}</p>
        ))}
      </section>

      <section className="bloque-home">
        <h2>Tu selección ritual</h2>
        <p>Guarda piezas de interés y prepara una consulta con varias referencias en un solo paso.</p>
        <IndicadorCestaRitual />
      </section>

      <CatalogoColecciones searchParamsIniciales={searchParams} />

      <section className="bloque-home">
        <h2>Exploración conectada</h2>
        <p>Accede a otras rutas clave del catálogo para complementar la decisión de compra con contexto editorial.</p>
        <div className="hero-portada__acciones">
          {INTRO_LISTADO_COLECCIONES.enlacesInternos.map((enlace) => (
            <Link key={enlace.href} href={enlace.href} className="boton boton--secundario">
              {enlace.etiqueta}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
