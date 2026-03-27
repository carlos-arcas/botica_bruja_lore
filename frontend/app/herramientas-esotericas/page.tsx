import {
  HERRAMIENTAS_ESOTERICAS_PUBLICA,
  resolverMensajeErrorCatalogoSeccionPublica,
} from "@/componentes/botica-natural/contratoSeccionPublica";
import { ListadoProductosBoticaNatural } from "@/componentes/botica-natural/ListadoProductosBoticaNatural";
import { PanelFiltrosBoticaNatural } from "@/componentes/botica-natural/filtros/PanelFiltrosBoticaNatural";
import { HeroSeccionPrincipal } from "@/componentes/secciones/HeroSeccionPrincipal";
import { ContenedorPaginaComercial } from "@/componentes/shell/ContenedorPaginaComercial";
import { resolverFiltrosBoticaDesdeSearchParams } from "@/contenido/catalogo/filtrosBoticaNatural";
import { obtenerProductosPublicosPorSeccion } from "@/infraestructura/api/herbal";

export default async function PaginaHerramientasEsotericas({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<JSX.Element> {
  const filtros = resolverFiltrosBoticaDesdeSearchParams((await searchParams) ?? {});
  const resultado = await obtenerProductosPublicosPorSeccion(HERRAMIENTAS_ESOTERICAS_PUBLICA.slug, filtros);

  return (
    <ContenedorPaginaComercial>
      <HeroSeccionPrincipal idSeccion="herramientas-esotericas" nivelTitulo="h1" />
      <section aria-label={HERRAMIENTAS_ESOTERICAS_PUBLICA.ariaCatalogo} className="botica-natural__layout-catalogo">
        <aside className="botica-natural__rail-filtros" aria-label={HERRAMIENTAS_ESOTERICAS_PUBLICA.ariaFiltros}>
          <h2>Filtrar catalogo</h2>
          <PanelFiltrosBoticaNatural
            filtrosActivos={filtros}
            rutaSeccion={`/${HERRAMIENTAS_ESOTERICAS_PUBLICA.slug}`}
            textoAyuda="Ajusta los filtros para encontrar la herramienta ritual que mejor sostiene tu practica."
          />
        </aside>
        <section className="botica-natural__bloque botica-natural__bloque--catalogo">
          <header className="botica-natural__cabecera">
            <p>{HERRAMIENTAS_ESOTERICAS_PUBLICA.descripcionCatalogo}</p>
          </header>
          {resultado.estado === "error" ? (
            <section aria-live="polite" className="botica-natural__estado-vacio">
              <h2>{HERRAMIENTAS_ESOTERICAS_PUBLICA.tituloErrorCatalogo}</h2>
              <p>
                {resolverMensajeErrorCatalogoSeccionPublica(
                  HERRAMIENTAS_ESOTERICAS_PUBLICA,
                  resultado.tipoError,
                )}
              </p>
            </section>
          ) : (
            <ListadoProductosBoticaNatural
              productos={resultado.productos}
              configuracionSeccion={HERRAMIENTAS_ESOTERICAS_PUBLICA}
            />
          )}
        </section>
      </section>
    </ContenedorPaginaComercial>
  );
}
