import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FichaProductoCatalogo } from "@/componentes/catalogo/detalle/FichaProductoCatalogo";
import { obtenerProductoPorSlug } from "@/contenido/catalogo/detalleCatalogo";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const producto = obtenerProductoPorSlug(params.slug);

  if (!producto) {
    return construirMetadataSeo({
      title: "Producto no encontrado | Colecciones | La Botica de la Bruja Lore",
      description: "El producto solicitado no está disponible en las colecciones actuales.",
      indexable: false,
    });
  }

  return construirMetadataSeo({
    title: `${producto.nombre} | Colecciones | La Botica de la Bruja Lore`,
    description: producto.descripcion,
    rutaCanonical: `/colecciones/${producto.slug}`,
  });
}

export default function PaginaDetalleColeccion({ params }: Props): JSX.Element {
  const producto = obtenerProductoPorSlug(params.slug);

  if (!producto) {
    notFound();
  }

  return (
    <main className="contenedor-home">
      <FichaProductoCatalogo producto={producto} />
    </main>
  );
}
