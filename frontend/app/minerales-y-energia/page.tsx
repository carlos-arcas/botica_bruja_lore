import {
  MINERALES_Y_ENERGIA_PUBLICA,
  resolverMensajeErrorCatalogoSeccionPublica,
} from "@/componentes/botica-natural/contratoSeccionPublica";
import { ListadoProductosBoticaNatural } from "@/componentes/botica-natural/ListadoProductosBoticaNatural";
import { HeroSeccionPrincipal } from "@/componentes/secciones/HeroSeccionPrincipal";
import { ContenedorPaginaComercial } from "@/componentes/shell/ContenedorPaginaComercial";
import { obtenerProductosPublicosPorSeccion } from "@/infraestructura/api/herbal";

export default async function PaginaMineralesYEnergia(): Promise<JSX.Element> {
  const resultado = await obtenerProductosPublicosPorSeccion(MINERALES_Y_ENERGIA_PUBLICA.slug);

  return (
    <ContenedorPaginaComercial>
      <HeroSeccionPrincipal idSeccion="minerales-y-energia" nivelTitulo="h1" />
      <section
        aria-label={MINERALES_Y_ENERGIA_PUBLICA.ariaCatalogo}
        className="botica-natural__bloque botica-natural__bloque--catalogo"
      >
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
    </ContenedorPaginaComercial>
  );
}
