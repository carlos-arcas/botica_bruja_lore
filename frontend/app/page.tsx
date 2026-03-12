import type { Metadata } from "next";

import { HeroPortada } from "@/componentes/home/HeroPortada";
import { RejillaSeccionesPrincipales } from "@/componentes/home/RejillaSeccionesPrincipales";
import { JsonLd } from "@/componentes/seo/JsonLd";
import { SEO_HOME } from "@/contenido/home/seoHome";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import { construirSchemasHome } from "@/infraestructura/seo/structuredData";

export const metadata: Metadata = construirMetadataSeo({
  title: SEO_HOME.title,
  description: SEO_HOME.description,
  rutaCanonical: "/",
});

export default function Home(): JSX.Element {
  const schemasHome = construirSchemasHome(SEO_HOME.title, SEO_HOME.description);

  return (
    <main className="contenedor-home contenedor-home--portada">
      {schemasHome.length > 0 ? <JsonLd id="schema-home" data={schemasHome} /> : null}
      <HeroPortada />
      <RejillaSeccionesPrincipales />
    </main>
  );
}
