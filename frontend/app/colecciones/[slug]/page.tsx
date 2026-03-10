import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FichaProductoCatalogo } from "@/componentes/catalogo/detalle/FichaProductoCatalogo";
import { obtenerProductoPorSlug } from "@/contenido/catalogo/detalleCatalogo";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import {
  construirDescriptionFichaPublica,
  construirTitleFichaPublica,
} from "@/infraestructura/seo/seoFichasPublicas";
import { JsonLd } from "@/componentes/seo/JsonLd";
import { construirSchemasFichaColeccion } from "@/infraestructura/seo/structuredData";

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
    title: construirTitleFichaPublica({
      nombre: producto.nombre,
      tipoFicha: "coleccion",
    }),
    description: construirDescriptionFichaPublica({
      nombre: producto.nombre,
      tipoFicha: "coleccion",
      resumen: producto.descripcion,
      intenciones: [producto.intencion],
    }),
    rutaCanonical: `/colecciones/${producto.slug}`,
  });
}

export default function PaginaDetalleColeccion({ params }: Props): JSX.Element {
  const producto = obtenerProductoPorSlug(params.slug);

  if (!producto) {
    notFound();
  }

  const schemasFicha = construirSchemasFichaColeccion(producto);

  return (
    <main className="contenedor-home">
      {schemasFicha.length > 0 ? <JsonLd id="schema-ficha" data={schemasFicha} /> : null}
      <FichaProductoCatalogo producto={producto} />
    </main>
  );
}
