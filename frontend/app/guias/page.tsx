import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/componentes/seo/JsonLd";
import {
  INTRO_HUB_GUIAS,
  METADATA_HUB_GUIAS,
  obtenerGuiasPublicadasIndexables,
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
        <div className="hero-portada__acciones">
          <Link href="/hierbas" className="boton boton--secundario">
            Conectar con hierbas publicadas
          </Link>
          <Link href="/rituales" className="boton boton--secundario">
            Conectar con rituales publicados
          </Link>
        </div>
      </section>

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
