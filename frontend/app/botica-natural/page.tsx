import { ContenedorPaginaComercial } from "@/componentes/shell/ContenedorPaginaComercial";
import { PanelFiltrosBoticaNatural } from "@/componentes/botica-natural/filtros/PanelFiltrosBoticaNatural";
import { SeccionComercialProductos } from "@/componentes/catalogo/secciones/SeccionComercialProductos";
import { resolverFiltrosBoticaDesdeSearchParams } from "@/contenido/catalogo/filtrosBoticaNatural";
import { obtenerProductosPublicosPorSeccion } from "@/infraestructura/api/herbal";

export default async function PaginaBoticaNatural({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}): Promise<JSX.Element> {
  const filtros = resolverFiltrosBoticaDesdeSearchParams((await searchParams) ?? {});
  const resultado = await obtenerProductosPublicosPorSeccion("botica-natural", filtros);

  return (
    <ContenedorPaginaComercial>
      <SeccionComercialProductos
        slug="botica-natural"
        resultado={resultado}
        filtros={(
          <>
            <h2>Filtrar catalogo</h2>
            <PanelFiltrosBoticaNatural filtrosActivos={filtros} />
          </>
        )}
      />
    </ContenedorPaginaComercial>
  );
}
