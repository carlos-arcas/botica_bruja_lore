import { SeccionComercialProductos } from "@/componentes/catalogo/secciones/SeccionComercialProductos";
import { ContenedorPaginaComercial } from "@/componentes/shell/ContenedorPaginaComercial";
import { obtenerProductosPublicosPorSeccion } from "@/infraestructura/api/herbal";

export default async function PaginaHerramientasEsotericas(): Promise<JSX.Element> {
  const resultado = await obtenerProductosPublicosPorSeccion("herramientas-esotericas");

  return (
    <ContenedorPaginaComercial>
      <SeccionComercialProductos slug="herramientas-esotericas" resultado={resultado} />
    </ContenedorPaginaComercial>
  );
}
