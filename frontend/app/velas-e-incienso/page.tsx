import {
  VELAS_E_INCIENSO_PUBLICA,
  resolverMensajeErrorCatalogoSeccionPublica,
} from "@/componentes/botica-natural/contratoSeccionPublica";
import { ListadoProductosBoticaNatural } from "@/componentes/botica-natural/ListadoProductosBoticaNatural";
import { HeroSeccionPrincipal } from "@/componentes/secciones/HeroSeccionPrincipal";
import { ContenedorPaginaComercial } from "@/componentes/shell/ContenedorPaginaComercial";
import { obtenerProductosPublicosPorSeccion } from "@/infraestructura/api/herbal";

export default async function PaginaVelasEIncienso(): Promise<JSX.Element> {
  const resultado = await obtenerProductosPublicosPorSeccion(VELAS_E_INCIENSO_PUBLICA.slug);

  return (
    <ContenedorPaginaComercial>
      <HeroSeccionPrincipal idSeccion="velas-e-incienso" nivelTitulo="h1" />
      <section
        aria-label={VELAS_E_INCIENSO_PUBLICA.ariaCatalogo}
        className="botica-natural__bloque botica-natural__bloque--catalogo"
      >
        <header className="botica-natural__cabecera">
          <p>{VELAS_E_INCIENSO_PUBLICA.descripcionCatalogo}</p>
        </header>
        {resultado.estado === "error" ? (
          <section aria-live="polite" className="botica-natural__estado-vacio">
            <h2>{VELAS_E_INCIENSO_PUBLICA.tituloErrorCatalogo}</h2>
            <p>
              {resolverMensajeErrorCatalogoSeccionPublica(
                VELAS_E_INCIENSO_PUBLICA,
                resultado.tipoError,
              )}
            </p>
          </section>
        ) : (
          <ListadoProductosBoticaNatural
            productos={resultado.productos}
            configuracionSeccion={VELAS_E_INCIENSO_PUBLICA}
          />
        )}
      </section>
    </ContenedorPaginaComercial>
  );
}
