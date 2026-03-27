import {
  HERRAMIENTAS_ESOTERICAS_PUBLICA,
  resolverMensajeErrorCatalogoSeccionPublica,
} from "@/componentes/botica-natural/contratoSeccionPublica";
import { ListadoProductosBoticaNatural } from "@/componentes/botica-natural/ListadoProductosBoticaNatural";
import { HeroSeccionPrincipal } from "@/componentes/secciones/HeroSeccionPrincipal";
import { ContenedorPaginaComercial } from "@/componentes/shell/ContenedorPaginaComercial";
import { obtenerProductosPublicosPorSeccion } from "@/infraestructura/api/herbal";

export default async function PaginaHerramientasEsotericas(): Promise<JSX.Element> {
  const resultado = await obtenerProductosPublicosPorSeccion(HERRAMIENTAS_ESOTERICAS_PUBLICA.slug);

  return (
    <ContenedorPaginaComercial>
      <HeroSeccionPrincipal idSeccion="herramientas-esotericas" nivelTitulo="h1" />
      <section
        aria-label={HERRAMIENTAS_ESOTERICAS_PUBLICA.ariaCatalogo}
        className="botica-natural__bloque botica-natural__bloque--catalogo"
      >
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
    </ContenedorPaginaComercial>
  );
}
