import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/componentes/seo/JsonLd";
import {
  obtenerOpcionesFiltroHub,
  obtenerOpcionesFiltroTema,
  resolverEstadoIndiceGuias,
} from "@/contenido/editorial/indiceGuias";
import { INTRO_HUB_GUIAS, METADATA_HUB_GUIAS, obtenerSubhubsEditorialesIndexables } from "@/contenido/editorial/guiasEditoriales";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import { construirSchemasHubEditorial } from "@/infraestructura/seo/structuredData";

export const metadata: Metadata = construirMetadataSeo({
  title: METADATA_HUB_GUIAS.title,
  description: METADATA_HUB_GUIAS.description,
  rutaCanonical: METADATA_HUB_GUIAS.rutaCanonical,
});

type Props = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function PaginaHubGuias({ searchParams }: Props): JSX.Element {
  const subhubs = obtenerSubhubsEditorialesIndexables();
  const estadoIndice = resolverEstadoIndiceGuias(searchParams);
  const filtrosTema = obtenerOpcionesFiltroTema();
  const filtrosHub = obtenerOpcionesFiltroHub();
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

      <section className="bloque-home" aria-labelledby="titulo-filtros-guias">
        <h2 id="titulo-filtros-guias">Segmentar guías por tema y hub relacionado</h2>
        <p>
          Mostrando <strong>{estadoIndice.resultados.length}</strong> de <strong>{estadoIndice.totalPublicadas}</strong> guías
          publicadas.
        </p>
        <h3>Filtrar por tema</h3>
        <ul className="lista-destacada">
          {filtrosTema.map((opcion) => (
            <li key={opcion.valor}>
              <Link
                href={construirHrefFiltro({ tema: opcion.valor, hub: estadoIndice.filtroHubActivo })}
                aria-current={estadoIndice.filtroTemaActivo === opcion.valor ? "page" : undefined}
              >
                {opcion.etiqueta} ({opcion.cantidad})
              </Link>
            </li>
          ))}
        </ul>
        <h3>Filtrar por hub conectado</h3>
        <ul className="lista-destacada">
          {filtrosHub.map((opcion) => (
            <li key={opcion.valor}>
              <Link
                href={construirHrefFiltro({ tema: estadoIndice.filtroTemaActivo, hub: opcion.valor })}
                aria-current={estadoIndice.filtroHubActivo === opcion.valor ? "page" : undefined}
              >
                {opcion.etiqueta} ({opcion.cantidad})
              </Link>
            </li>
          ))}
        </ul>
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
        {estadoIndice.resultados.length === 0 ? (
          <p>No encontramos guías para esta combinación. Prueba otro filtro para seguir navegando el índice editorial.</p>
        ) : (
          <ul className="lista-destacada">
            {estadoIndice.resultados.map((guia) => (
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
        )}
      </section>
    </main>
  );
}

function construirHrefFiltro(filtros: { tema: string; hub: string }): string {
  const params = new URLSearchParams();

  if (filtros.tema !== "todas") {
    params.set("tema", filtros.tema);
  }

  if (filtros.hub !== "todos") {
    params.set("hub", filtros.hub);
  }

  const query = params.toString();
  return query.length > 0 ? `/guias?${query}` : "/guias";
}
