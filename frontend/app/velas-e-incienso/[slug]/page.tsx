import { notFound } from "next/navigation";

import {
  VELAS_E_INCIENSO_PUBLICA,
  resolverMensajeErrorCatalogoSeccionPublica,
} from "@/componentes/botica-natural/contratoSeccionPublica";
import { FichaProductoBoticaNatural } from "@/componentes/botica-natural/detalle/FichaProductoBoticaNatural";
import { ContenedorPaginaComercial } from "@/componentes/shell/ContenedorPaginaComercial";
import { obtenerDetalleProductoPublico } from "@/infraestructura/api/herbal";

type Props = {
  params: { slug: string };
};

export default async function PaginaDetalleVelasEIncienso({
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
          <h1>{VELAS_E_INCIENSO_PUBLICA.tituloErrorCatalogo}</h1>
          <p>
            {resolverMensajeErrorCatalogoSeccionPublica(
              VELAS_E_INCIENSO_PUBLICA,
              "fetch_error",
            )}
          </p>
        </section>
      </ContenedorPaginaComercial>
    );
  }

  if (resultado.producto.seccion_publica !== VELAS_E_INCIENSO_PUBLICA.slug) {
    notFound();
  }

  return (
    <ContenedorPaginaComercial>
      <FichaProductoBoticaNatural producto={resultado.producto} />
    </ContenedorPaginaComercial>
  );
}
