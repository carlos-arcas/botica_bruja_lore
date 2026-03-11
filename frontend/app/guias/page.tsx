import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/componentes/seo/JsonLd";
import {
  INTRO_HUB_GUIAS,
  METADATA_HUB_GUIAS,
  obtenerGuiasAgrupadasPorTema,
  obtenerGuiasPorSegmento,
  obtenerResumenSegmentosGuias,
  resolverSegmentoGuias,
} from "@/contenido/editorial/guiasEditoriales";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import { construirSchemasHubEditorial } from "@/infraestructura/seo/structuredData";

export const metadata: Metadata = construirMetadataSeo({
  title: METADATA_HUB_GUIAS.title,
  description: METADATA_HUB_GUIAS.description,
  rutaCanonical: METADATA_HUB_GUIAS.rutaCanonical,
});

type Props = {
  searchParams?: {
    segmento?: string;
  };
};

export default function PaginaHubGuias({ searchParams }: Props): JSX.Element {
  const segmentoActivo = resolverSegmentoGuias(searchParams?.segmento);
  const resumenSegmentos = obtenerResumenSegmentosGuias();
  const guiasFiltradas = obtenerGuiasPorSegmento(segmentoActivo);
  const gruposGuias = obtenerGuiasAgrupadasPorTema();
  const segmento = resumenSegmentos.find((item) => item.segmento === segmentoActivo);
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
          <Link href="/colecciones" className="boton boton--secundario">
            Explorar colecciones conectadas
          </Link>
        </div>
      </section>

      <section className="bloque-home" aria-labelledby="titulo-filtros-guias">
        <h2 id="titulo-filtros-guias">Explorar por segmento editorial</h2>
        <p>Filtra por temática para navegar las guías según el tipo de decisión que quieras tomar.</p>
        <div className="hero-portada__acciones" role="navigation" aria-label="Filtros del hub de guías">
          {resumenSegmentos.map((item) => {
            const href = item.segmento === "todas" ? "/guias" : `/guias?segmento=${item.segmento}`;
            const etiqueta = `${item.etiqueta} (${item.conteo})`;

            return (
              <Link
                key={item.segmento}
                href={href}
                className="boton boton--secundario"
                aria-current={item.segmento === segmentoActivo ? "page" : undefined}
              >
                {etiqueta}
              </Link>
            );
          })}
        </div>
        {segmento ? (
          <p>
            Segmento activo: <strong>{segmento.etiqueta}</strong> · {segmento.descripcion}
          </p>
        ) : null}
      </section>

      <section className="bloque-home" aria-labelledby="titulo-listado-guias">
        <h2 id="titulo-listado-guias">Guías publicadas</h2>
        <p>
          Resultado actual: <strong>{guiasFiltradas.length}</strong> guía(s) indexable(s).
        </p>
        {guiasFiltradas.length === 0 ? (
          <p>No hay guías publicadas para este segmento por ahora. Prueba con otro filtro editorial.</p>
        ) : (
          <ul className="lista-destacada">
            {guiasFiltradas.map((guia) => (
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

      {segmentoActivo === "todas" ? (
        <section className="bloque-home" aria-labelledby="titulo-grupos-tematicos">
          <h2 id="titulo-grupos-tematicos">Navegación por grupos de guías</h2>
          {gruposGuias.map((grupo) => (
            <article key={grupo.tema}>
              <h3>{grupo.etiqueta}</h3>
              <p>{grupo.descripcion}</p>
              <ul>
                {grupo.guias.map((guia) => (
                  <li key={guia.slug}>
                    <Link href={`/guias/${guia.slug}`}>{guia.titulo}</Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
