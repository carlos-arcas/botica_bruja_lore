import { ListadoProductosBoticaNatural } from "@/componentes/botica-natural/ListadoProductosBoticaNatural";
import { mapearRangoAPreciosBotica, type RangoPrecioBotica } from "@/contenido/catalogo/precioRangosBoticaNatural";
import { obtenerProductosPublicosPorSeccion } from "@/infraestructura/api/herbal";

function resolverMensajeError(tipoError: "fetch_error" | "http_error" | "respuesta_invalida"): string {
  if (tipoError === "http_error") return "No se pudo consultar el catálogo público de Botica Natural (error HTTP).";
  if (tipoError === "respuesta_invalida") return "El catálogo público respondió con un formato inválido y no se puede renderizar.";
  return "No hay conexión con el backend público de Botica Natural.";
}

export default async function PaginaBoticaNatural({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<JSX.Element> {
  const filtros = resolverFiltrosDesdeSearchParams((await searchParams) ?? {});
  const resultado = await obtenerProductosPublicosPorSeccion("botica-natural", filtros);

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
        <ListadoProductosBoticaNatural productos={resultado.productos} filtrosActivos={filtros} />
      </section>
    </main>
  );
}

function resolverFiltrosDesdeSearchParams(params: Record<string, string | string[] | undefined>): {
  beneficio: string;
  formato: string;
  modo_uso: string;
  precio_min: string;
  precio_max: string;
} {
  const precioDesdeRango = resolverPreciosDesdeRango(obtenerTexto(params.precio_rango));
  return {
    beneficio: obtenerTexto(params.beneficio),
    formato: obtenerTexto(params.formato),
    modo_uso: obtenerTexto(params.modo_uso),
    precio_min: precioDesdeRango?.precio_min ?? obtenerTexto(params.precio_min),
    precio_max: precioDesdeRango?.precio_max ?? obtenerTexto(params.precio_max),
  };
}

function obtenerTexto(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) return valor[0] ?? "";
  return String(valor ?? "");
}

function resolverPreciosDesdeRango(rango: string): { precio_min: string; precio_max: string } | null {
  if (!rango) return null;
  return mapearRangoAPreciosBotica(rango as RangoPrecioBotica);
}
