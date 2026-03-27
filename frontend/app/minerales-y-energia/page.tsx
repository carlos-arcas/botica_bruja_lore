import {
  MINERALES_Y_ENERGIA_PUBLICA,
  resolverMensajeErrorCatalogoSeccionPublica,
} from "@/componentes/botica-natural/contratoSeccionPublica";
import { ListadoProductosBoticaNatural } from "@/componentes/botica-natural/ListadoProductosBoticaNatural";
import { PanelFiltrosBoticaNatural } from "@/componentes/botica-natural/filtros/PanelFiltrosBoticaNatural";
import { HeroSeccionPrincipal } from "@/componentes/secciones/HeroSeccionPrincipal";
import { ContenedorPaginaComercial } from "@/componentes/shell/ContenedorPaginaComercial";
import { resolverFiltrosBoticaDesdeSearchParams } from "@/contenido/catalogo/filtrosBoticaNatural";
import { obtenerProductosPublicosPorSeccion } from "@/infraestructura/api/herbal";

export default async function PaginaMineralesYEnergia({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<JSX.Element> {
  const filtros = resolverFiltrosBoticaDesdeSearchParams((await searchParams) ?? {});
  const resultado = await obtenerProductosPublicosPorSeccion(MINERALES_Y_ENERGIA_PUBLICA.slug, filtros);

  return (
    <ContenedorPaginaComercial>
      <HeroSeccionPrincipal idSeccion="minerales-y-energia" nivelTitulo="h1" />
      <section aria-label={MINERALES_Y_ENERGIA_PUBLICA.ariaCatalogo} className="botica-natural__layout-catalogo">
        <aside className="botica-natural__rail-filtros" aria-label={MINERALES_Y_ENERGIA_PUBLICA.ariaFiltros}>
          <h2>Filtrar catalogo</h2>
          <PanelFiltrosBoticaNatural
            filtrosActivos={filtros}
            rutaSeccion={`/${MINERALES_Y_ENERGIA_PUBLICA.slug}`}
            textoAyuda="Ajusta los filtros para encontrar la pieza mineral que mejor encaja con tu altar o mesa."
          />
        </aside>
        <section className="botica-natural__bloque botica-natural__bloque--catalogo">
          <header className="botica-natural__cabecera">
            <p>{MINERALES_Y_ENERGIA_PUBLICA.descripcionCatalogo}</p>
          </header>
          {resultado.estado === "error" ? (
            <section aria-live="polite" className="botica-natural__estado-vacio">
              <h2>{MINERALES_Y_ENERGIA_PUBLICA.tituloErrorCatalogo}</h2>
              <p>
                {resolverMensajeErrorCatalogoSeccionPublica(
                  MINERALES_Y_ENERGIA_PUBLICA,
                  resultado.tipoError,
                )}
              </p>
            </section>
          ) : (
            <ListadoProductosBoticaNatural
              productos={resultado.productos}
              configuracionSeccion={MINERALES_Y_ENERGIA_PUBLICA}
            />
          )}
        </section>
      </section>
    </ContenedorPaginaComercial>
  );
}
