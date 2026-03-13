import { ListadoProductosBoticaNatural } from "@/componentes/botica-natural/ListadoProductosBoticaNatural";
import { obtenerProductosPublicosPorSeccion } from "@/infraestructura/api/herbal";

function resolverMensajeError(tipoError: "fetch_error" | "http_error" | "respuesta_invalida"): string {
  if (tipoError === "http_error") {
    return "No se pudo consultar el catálogo público de Botica Natural (error HTTP).";
  }
  if (tipoError === "respuesta_invalida") {
    return "El catálogo público respondió con un formato inválido y no se puede renderizar.";
  }
  return "No hay conexión con el backend público de Botica Natural.";
}

export default async function PaginaBoticaNatural(): Promise<JSX.Element> {
  const resultado = await obtenerProductosPublicosPorSeccion("botica-natural");

  if (resultado.estado === "error") {
    return (
      <main className="contenedor-home">
        <section aria-label="Catálogo Botica Natural" className="botica-natural__bloque">
          <header className="botica-natural__cabecera">
            <h1>Botica Natural</h1>
            <p>Selección herbal pública conectada con catálogo real en producción.</p>
          </header>
          <section aria-live="polite" className="botica-natural__estado-vacio">
            <h2>No pudimos cargar Botica Natural</h2>
            <p>{resolverMensajeError(resultado.tipoError)}</p>
            <p>{resultado.mensaje}</p>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="contenedor-home">
      <section aria-label="Catálogo Botica Natural" className="botica-natural__bloque">
        <header className="botica-natural__cabecera">
          <h1>Botica Natural</h1>
          <p>Selección herbal pública conectada con catálogo real en producción.</p>
        </header>
        <ListadoProductosBoticaNatural productos={resultado.productos} />
      </section>
    </main>
  );
}
