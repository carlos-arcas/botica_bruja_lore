import { ListadoProductosBoticaNatural } from "@/componentes/botica-natural/ListadoProductosBoticaNatural";
import { obtenerProductosPublicosPorSeccion } from "@/infraestructura/api/herbal";

export default async function PaginaBoticaNatural(): Promise<JSX.Element> {
  const resultado = await obtenerProductosPublicosPorSeccion("botica-natural");

  return (
    <main className="contenedor-home">
      <section aria-label="Catálogo Botica Natural" className="botica-natural__bloque">
        <header className="botica-natural__cabecera">
          <h1>Botica Natural</h1>
          <p>Selección herbal pública conectada con catálogo real en producción.</p>
        </header>
        {resultado.estado === "ok" ? (
          <ListadoProductosBoticaNatural productos={resultado.productos} />
        ) : (
          <p>{resultado.mensaje}</p>
        )}
      </section>
    </main>
  );
}
