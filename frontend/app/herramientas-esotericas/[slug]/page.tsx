import { notFound } from "next/navigation";

import {
  HERRAMIENTAS_ESOTERICAS_PUBLICA,
  resolverMensajeErrorCatalogoSeccionPublica,
} from "@/componentes/botica-natural/contratoSeccionPublica";
import { FichaProductoBoticaNatural } from "@/componentes/botica-natural/detalle/FichaProductoBoticaNatural";
import { ContenedorPaginaComercial } from "@/componentes/shell/ContenedorPaginaComercial";
import { obtenerDetalleProductoPublico } from "@/infraestructura/api/herbal";

type Props = {
  params: { slug: string };
};

export default async function PaginaDetalleHerramientasEsotericas({
  params,
}: Props): Promise<JSX.Element> {
  const resultado = await obtenerDetalleProductoPublico(params.slug);

  if (resultado.estado === "no_encontrado") {
    notFound();
  }

  if (resultado.estado === "error") {
    return (
      <ContenedorPaginaComercial>
        <section className="bloque-home bloque-home--error">
          <h1>{HERRAMIENTAS_ESOTERICAS_PUBLICA.tituloErrorCatalogo}</h1>
          <p>
            {resolverMensajeErrorCatalogoSeccionPublica(
              HERRAMIENTAS_ESOTERICAS_PUBLICA,
              "fetch_error",
            )}
          </p>
        </section>
      </ContenedorPaginaComercial>
    );
  }

  if (resultado.producto.seccion_publica !== HERRAMIENTAS_ESOTERICAS_PUBLICA.slug) {
    notFound();
  }

  return (
    <ContenedorPaginaComercial>
      <FichaProductoBoticaNatural producto={resultado.producto} />
    </ContenedorPaginaComercial>
  );
}
