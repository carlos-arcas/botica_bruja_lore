import {
  BOTICA_NATURAL_PUBLICA,
  resolverMensajeErrorCatalogoSeccionPublica,
} from "@/componentes/botica-natural/contratoSeccionPublica";
import { ListadoProductosBoticaNatural } from "@/componentes/botica-natural/ListadoProductosBoticaNatural";
import { PanelFiltrosBoticaNatural } from "@/componentes/botica-natural/filtros/PanelFiltrosBoticaNatural";
import { ContenedorPaginaComercial } from "@/componentes/shell/ContenedorPaginaComercial";
import { resolverFiltrosBoticaDesdeSearchParams } from "@/contenido/catalogo/filtrosBoticaNatural";
import { obtenerProductosPublicosPorSeccion } from "@/infraestructura/api/herbal";

export default async function PaginaBoticaNatural({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<JSX.Element> {
  const filtros = resolverFiltrosBoticaDesdeSearchParams((await searchParams) ?? {});
  const resultado = await obtenerProductosPublicosPorSeccion(BOTICA_NATURAL_PUBLICA.slug, filtros);

  if (resultado.estado === "error") {
    return (
      <ContenedorPaginaComercial>
        <section aria-label={BOTICA_NATURAL_PUBLICA.ariaCatalogo} className="botica-natural__bloque">
          <header className="botica-natural__cabecera">
            <h1>{BOTICA_NATURAL_PUBLICA.nombre}</h1>
            <p>{BOTICA_NATURAL_PUBLICA.descripcionCatalogo}</p>
          </header>
          <section aria-live="polite" className="botica-natural__estado-vacio">
            <h2>{BOTICA_NATURAL_PUBLICA.tituloErrorCatalogo}</h2>
            <p>{resolverMensajeErrorCatalogoSeccionPublica(BOTICA_NATURAL_PUBLICA, resultado.tipoError)}</p>
            <p>{resultado.mensaje}</p>
          </section>
        </section>
      </ContenedorPaginaComercial>
    );
  }

  return (
    <ContenedorPaginaComercial>
      <section aria-label={BOTICA_NATURAL_PUBLICA.ariaCatalogo} className="botica-natural__layout-catalogo">
        <aside className="botica-natural__rail-filtros" aria-label={BOTICA_NATURAL_PUBLICA.ariaFiltros}>
          <h2>Filtrar catalogo</h2>
          <PanelFiltrosBoticaNatural filtrosActivos={filtros} />
        </aside>
        <section className="botica-natural__bloque botica-natural__bloque--catalogo">
          <header className="botica-natural__cabecera">
            <h1>{BOTICA_NATURAL_PUBLICA.nombre}</h1>
            <p>{BOTICA_NATURAL_PUBLICA.descripcionCatalogo}</p>
          </header>
          <ListadoProductosBoticaNatural
            productos={resultado.productos}
            configuracionSeccion={BOTICA_NATURAL_PUBLICA}
          />
        </section>
      </section>
    </ContenedorPaginaComercial>
  );
}
