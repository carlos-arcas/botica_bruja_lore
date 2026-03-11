import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/componentes/seo/JsonLd";
import {
  INTRO_HUB_GUIAS,
  METADATA_HUB_GUIAS,
  obtenerGuiasPublicadasIndexables,
  obtenerSubhubsEditorialesIndexables,
} from "@/contenido/editorial/guiasEditoriales";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import { construirSchemasHubEditorial } from "@/infraestructura/seo/structuredData";

export const metadata: Metadata = construirMetadataSeo({
  title: METADATA_HUB_GUIAS.title,
  description: METADATA_HUB_GUIAS.description,
  rutaCanonical: METADATA_HUB_GUIAS.rutaCanonical,
});

export default function PaginaHubGuias(): JSX.Element {
  const guias = obtenerGuiasPublicadasIndexables();
  const subhubs = obtenerSubhubsEditorialesIndexables();
  const schemas = construirSchemasHubEditorial({
    titulo: METADATA_HUB_GUIAS.title,
    descripcion: METADATA_HUB_GUIAS.description,
    ruta: METADATA_HUB_GUIAS.rutaCanonical,
  });

  return (
    <main className="contenedor-home">
      {schemas.length > 0 ? <JsonLd id="schema-hub-guias" data={schemas} /> : null}
      <section className="bloque-home">
        <h1>{METADATA_HUB_GUIAS.h1}</h1>
        {INTRO_HUB_GUIAS.map((parrafo) => (
          <p key={parrafo}>{parrafo}</p>
        ))}
      </section>

      {subhubs.length > 0 ? (
        <section className="bloque-home" aria-labelledby="titulo-subhubs-editoriales">
          <h2 id="titulo-subhubs-editoriales">Subhubs temáticos para descubrir guías conectadas</h2>
          <ul className="lista-destacada">
            {subhubs.map((subhub) => (
              <li key={subhub.slug}>
                <article>
                  <h3>
                    <Link href={`/guias/temas/${subhub.slug}`}>{subhub.nombre}</Link>
                  </h3>
                  <p>{subhub.resumen}</p>
                </article>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="bloque-home" aria-labelledby="titulo-listado-guias">
        <h2 id="titulo-listado-guias">Guías publicadas</h2>
        <ul className="lista-destacada">
          {guias.map((guia) => (
            <li key={guia.slug}>
              <article>
                <h3>
                  <Link href={`/guias/${guia.slug}`}>{guia.titulo}</Link>
                </h3>
                <p>{guia.resumen}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
