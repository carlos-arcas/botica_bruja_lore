import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/componentes/seo/JsonLd";
import {
  obtenerGuiaEditorialPorSlug,
  obtenerGuiasPublicadasIndexables,
} from "@/contenido/editorial/guiasEditoriales";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import { construirSchemasDetalleGuiaEditorial } from "@/infraestructura/seo/structuredData";

type Props = {
  params: { slug: string };
};

export function generateStaticParams(): Array<{ slug: string }> {
  return obtenerGuiasPublicadasIndexables().map((guia) => ({ slug: guia.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guia = obtenerGuiaEditorialPorSlug(params.slug);

  if (!guia || !guia.publicada || !guia.indexable) {
    return construirMetadataSeo({
      title: "Guía editorial no disponible | La Botica de la Bruja Lore",
      description: "La guía solicitada no está publicada o no se encuentra disponible en este momento.",
      indexable: false,
    });
  }

  return construirMetadataSeo({
    title: guia.seo.title,
    description: guia.seo.description,
    rutaCanonical: `/guias/${guia.slug}`,
  });
}

export default function PaginaDetalleGuia({ params }: Props): JSX.Element {
  const guia = obtenerGuiaEditorialPorSlug(params.slug);

  if (!guia || !guia.publicada) {
    notFound();
  }

  const schemas = construirSchemasDetalleGuiaEditorial(guia);

  return (
    <main className="contenedor-home">
      {schemas.length > 0 ? <JsonLd id="schema-guia-editorial" data={schemas} /> : null}
      <article className="bloque-home">
        <p className="hero-portada__eyebrow">Guía editorial · {guia.tema}</p>
        <h1>{guia.h1}</h1>
        <p>{guia.resumen}</p>
      </article>

      {guia.secciones.map((seccion) => (
        <section key={seccion.titulo} className="bloque-home" aria-labelledby={`seccion-${seccion.titulo}`}>
          <h2 id={`seccion-${seccion.titulo}`}>{seccion.titulo}</h2>
          {seccion.parrafos.map((parrafo) => (
            <p key={parrafo}>{parrafo}</p>
          ))}
        </section>
      ))}

      <section className="bloque-home" aria-labelledby="enlaces-relacionados-guia">
        <h2 id="enlaces-relacionados-guia">Rutas relacionadas para profundizar</h2>
        <ul className="lista-destacada">
          {guia.enlaces_relacionados.map((enlace) => (
            <li key={enlace.href}>
              <Link href={enlace.href}>{enlace.anchor}</Link>
            </li>
          ))}
        </ul>
        <Link href="/guias" className="boton boton--secundario">
          Volver al hub de guías
        </Link>
      </section>
    </main>
  );
}
