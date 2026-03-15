import { notFound } from "next/navigation";

import { FichaProductoBoticaNatural } from "@/componentes/botica-natural/detalle/FichaProductoBoticaNatural";
import { obtenerDetalleProductoPublico } from "@/infraestructura/api/herbal";

type Props = {
  params: { slug: string };
};

export default async function PaginaDetalleProductoBoticaNatural({ params }: Props): Promise<JSX.Element> {
  const resultado = await obtenerDetalleProductoPublico(params.slug);

  if (resultado.estado === "no_encontrado") {
    notFound();
  }

  if (resultado.estado === "error") {
    return (
      <main className="contenedor-home">
        <section className="bloque-home bloque-home--error">
          <h1>No se pudo cargar la ficha de producto</h1>
          <p>{resultado.mensaje}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="contenedor-home">
      <FichaProductoBoticaNatural producto={resultado.producto} />
    </main>
  );
}
