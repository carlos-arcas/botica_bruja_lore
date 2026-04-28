import { SeccionComercialProductos } from "@/componentes/catalogo/secciones/SeccionComercialProductos";
import { ContenedorPaginaComercial } from "@/componentes/shell/ContenedorPaginaComercial";
import { obtenerProductosPublicosPorSeccion } from "@/infraestructura/api/herbal";

export default async function PaginaVelasEIncienso(): Promise<JSX.Element> {
  const resultado = await obtenerProductosPublicosPorSeccion("velas-e-incienso");

  return (
    <ContenedorPaginaComercial>
      <SeccionComercialProductos slug="velas-e-incienso" resultado={resultado} />
    </ContenedorPaginaComercial>
  );
}
