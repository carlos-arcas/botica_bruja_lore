import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/componentes/seo/JsonLd";
import {
  obtenerEnlacesCatalogoParaSubhub,
  obtenerGuiasPorTema,
  obtenerSubhubEditorialPorSlug,
  obtenerSubhubsEditorialesIndexables,
} from "@/contenido/editorial/guiasEditoriales";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import { construirSchemasSubhubEditorial } from "@/infraestructura/seo/structuredData";

type Props = {
  params: { slug: string };
};

export function generateStaticParams(): Array<{ slug: string }> {
  return obtenerSubhubsEditorialesIndexables().map((subhub) => ({ slug: subhub.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const subhub = obtenerSubhubEditorialPorSlug(params.slug);

  if (!subhub) {
    return construirMetadataSeo({
      title: "Subhub editorial no disponible | La Botica de la Bruja Lore",
      description: "El subhub editorial solicitado no está publicado o no cumple criterios de indexación.",
      indexable: false,
    });
  }

  return construirMetadataSeo({
    title: subhub.seo.title,
    description: subhub.seo.description,
    rutaCanonical: `/guias/temas/${subhub.slug}`,
  });
}

export default function PaginaSubhubEditorial({ params }: Props): JSX.Element {
  const subhub = obtenerSubhubEditorialPorSlug(params.slug);

  if (!subhub) {
    notFound();
  }

  const guias = obtenerGuiasPorTema(subhub.tema);
  const enlacesCatalogo = obtenerEnlacesCatalogoParaSubhub(subhub);
  const schemas = construirSchemasSubhubEditorial(subhub);

  return (
    <main className="contenedor-home">
      {schemas.length > 0 ? <JsonLd id="schema-subhub-editorial" data={schemas} /> : null}
      <section className="bloque-home">
        <p className="hero-portada__eyebrow">Subhub editorial · {subhub.tema}</p>
        <h1>{subhub.h1}</h1>
        <p>{subhub.resumen}</p>
      </section>

      <section className="bloque-home" aria-labelledby="guias-del-subhub">
        <h2 id="guias-del-subhub">Guías relacionadas</h2>
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

      {enlacesCatalogo.length > 0 ? (
        <section className="bloque-home" aria-labelledby="hubs-catalogo-relacionados">
          <h2 id="hubs-catalogo-relacionados">Rutas de catálogo relacionadas</h2>
          <ul className="lista-destacada">
            {enlacesCatalogo.map((enlace) => (
              <li key={enlace.href}>
                <Link href={enlace.href}>{enlace.anchor}</Link>
              </li>
            ))}
          </ul>
          <Link href="/guias" className="boton boton--secundario">
            Volver al hub de guías
          </Link>
        </section>
      ) : null}
    </main>
  );
}
