import { ReactNode } from "react";

import { HeroSeccionPrincipal } from "@/componentes/secciones/HeroSeccionPrincipal";
import type { SlugSeccionComercial } from "@/contenido/catalogo/seccionesComerciales";
import {
  construirMensajeErrorSeccionComercial,
  obtenerConfiguracionSeccionComercial,
} from "@/contenido/catalogo/seccionesComerciales";
import type { ResultadoProductosSeccion } from "@/infraestructura/api/herbal";

import { ListadoProductosSeccionComercial } from "./ListadoProductosSeccionComercial";

type Props = {
  slug: SlugSeccionComercial;
  resultado: ResultadoProductosSeccion;
  filtros?: ReactNode;
};

export function SeccionComercialProductos({ slug, resultado, filtros }: Props): JSX.Element {
  const configuracion = obtenerConfiguracionSeccionComercial(slug);

  return (
    <>
      <HeroSeccionPrincipal idSeccion={slug} />
      <section aria-label={configuracion.tituloCatalogo} className="botica-natural__layout-catalogo">
        {filtros ? (
          <aside className="botica-natural__rail-filtros" aria-label={configuracion.etiquetaFiltros ?? "Filtros de seccion"}>
            {filtros}
          </aside>
        ) : null}
        <section className="botica-natural__bloque botica-natural__bloque--catalogo">
          <header className="botica-natural__cabecera">
            <h2>{configuracion.tituloCatalogo}</h2>
            <p>{configuracion.descripcionCatalogo}</p>
          </header>
          {resultado.estado === "error" ? (
            <EstadoErrorSeccion slug={slug} mensaje={resultado.mensaje} />
          ) : (
            <ListadoProductosSeccionComercial productos={resultado.productos} />
          )}
        </section>
      </section>
    </>
  );
}

function EstadoErrorSeccion({
  slug,
  mensaje,
}: {
  slug: SlugSeccionComercial;
  mensaje: string;
}): JSX.Element {
  return (
    <section aria-live="polite" className="botica-natural__estado-vacio">
      <h2>{construirMensajeErrorSeccionComercial(slug)}</h2>
      <p>{mensaje}</p>
    </section>
  );
}
