import { ListadoProductosBoticaNatural } from "@/componentes/botica-natural/ListadoProductosBoticaNatural";
import { HeroSeccionPrincipal } from "@/componentes/secciones/HeroSeccionPrincipal";
import { obtenerProductosPublicosPorSeccion } from "@/infraestructura/api/herbal";

export default async function PaginaBoticaNatural(): Promise<JSX.Element> {
  const resultado = await obtenerProductosPublicosPorSeccion("botica-natural");

  return (
    <main className="contenedor-home">
      <HeroSeccionPrincipal idSeccion="botica-natural" />
      <section aria-label="Catálogo Botica Natural">
        {resultado.estado === "ok" ? (
          <ListadoProductosBoticaNatural productos={resultado.productos} />
        ) : (
          <p>{resultado.mensaje}</p>
        )}
      </section>
    </main>
  );
}
