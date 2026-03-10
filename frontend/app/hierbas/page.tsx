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
import { JsonLd } from "@/componentes/seo/JsonLd";
import { BloqueGuiasRelacionadas } from "@/componentes/editorial/BloqueGuiasRelacionadas";
import { BloqueEnlazadoContextual } from "@/componentes/seo/BloqueEnlazadoContextual";
import { construirSchemasLandingCatalogo } from "@/infraestructura/seo/structuredData";
import { BLOQUES_ENLAZADO_CATALOGO } from "@/contenido/catalogo/enlazadoInterno";
import { obtenerGuiasRelacionadasPorHub } from "@/contenido/editorial/guiasEditoriales";

export const metadata: Metadata = construirMetadataSeo({
  title: METADATA_LISTADO_HIERBAS.title,
  description: METADATA_LISTADO_HIERBAS.description,
  rutaCanonical: METADATA_LISTADO_HIERBAS.rutaCanonical,
});

export default async function PaginaListadoHerbal(): Promise<JSX.Element> {
  const resultado = await obtenerListadoHerbal();
  const bloqueEnlazado = BLOQUES_ENLAZADO_CATALOGO.hierbas;
  const guiasRelacionadas = obtenerGuiasRelacionadasPorHub("hierbas");
  const schemasLanding = construirSchemasLandingCatalogo({
    ruta: METADATA_LISTADO_HIERBAS.rutaCanonical,
    titulo: METADATA_LISTADO_HIERBAS.title,
    descripcion: METADATA_LISTADO_HIERBAS.description,
    nombreListado: "Hierbas",
  });

  return (
    <main className="contenedor-home">
      {schemasLanding.length > 0 ? <JsonLd id="schema-pagina" data={schemasLanding} /> : null}
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

      <BloqueEnlazadoContextual bloque={bloqueEnlazado} />

      <BloqueGuiasRelacionadas
        titulo="Exploración guiada desde el catálogo"
        descripcion="Descubre guías editoriales para profundizar en hierbas y mantener una navegación editorial-comercial coherente."
        guias={guiasRelacionadas}
      />

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
