import { SeccionComercialProductos } from "@/componentes/catalogo/secciones/SeccionComercialProductos";
import { ContenedorPaginaComercial } from "@/componentes/shell/ContenedorPaginaComercial";
import { obtenerProductosPublicosPorSeccion } from "@/infraestructura/api/herbal";

export default async function PaginaMineralesYEnergia(): Promise<JSX.Element> {
  const resultado = await obtenerProductosPublicosPorSeccion("minerales-y-energia");

  return (
    <ContenedorPaginaComercial>
      <SeccionComercialProductos slug="minerales-y-energia" resultado={resultado} />
    </ContenedorPaginaComercial>
  );
}
