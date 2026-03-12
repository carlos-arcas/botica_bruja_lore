import type { Metadata } from "next";
import Link from "next/link";

import {
  EstadoErrorListadoRituales,
  EstadoVacioListadoRituales,
} from "@/componentes/rituales/EstadoListadoRituales";
import { ListadoRituales } from "@/componentes/rituales/ListadoRituales";
import { HeroSeccionPrincipal } from "@/componentes/secciones/HeroSeccionPrincipal";
import {
  INTRO_LISTADO_RITUALES,
  METADATA_LISTADO_RITUALES,
} from "@/contenido/catalogo/seoLandingsCatalogo";
import { obtenerListadoRituales } from "@/infraestructura/api/rituales";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import { JsonLd } from "@/componentes/seo/JsonLd";
import { BloqueGuiasRelacionadas } from "@/componentes/editorial/BloqueGuiasRelacionadas";
import { BloqueEnlazadoContextual } from "@/componentes/seo/BloqueEnlazadoContextual";
import { construirSchemasLandingCatalogo } from "@/infraestructura/seo/structuredData";
import { BLOQUES_ENLAZADO_CATALOGO } from "@/contenido/catalogo/enlazadoInterno";
import { obtenerGuiasRelacionadasPorHub } from "@/contenido/editorial/guiasEditoriales";

export const metadata: Metadata = construirMetadataSeo({
  title: METADATA_LISTADO_RITUALES.title,
  description: METADATA_LISTADO_RITUALES.description,
  rutaCanonical: METADATA_LISTADO_RITUALES.rutaCanonical,
});

export default async function PaginaListadoRituales(): Promise<JSX.Element> {
  const resultado = await obtenerListadoRituales();
  const bloqueEnlazado = BLOQUES_ENLAZADO_CATALOGO.rituales;
  const guiasRelacionadas = obtenerGuiasRelacionadasPorHub("rituales");
  const schemasLanding = construirSchemasLandingCatalogo({
    ruta: METADATA_LISTADO_RITUALES.rutaCanonical,
    titulo: METADATA_LISTADO_RITUALES.title,
    descripcion: METADATA_LISTADO_RITUALES.description,
    nombreListado: "Rituales",
  });

  return (
    <main className="contenedor-home">
      <HeroSeccionPrincipal idSeccion="rituales" nivelTitulo="h2" />
      {schemasLanding.length > 0 ? <JsonLd id="schema-pagina" data={schemasLanding} /> : null}
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

      <BloqueEnlazadoContextual bloque={bloqueEnlazado} />

      <BloqueGuiasRelacionadas
        titulo="Exploración guiada desde el catálogo"
        descripcion="Descubre guías editoriales para acompañar cada ritual y mantener una navegación editorial-comercial coherente."
        guias={guiasRelacionadas}
      />

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
