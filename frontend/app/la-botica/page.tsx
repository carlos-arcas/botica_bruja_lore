import type { Metadata } from "next";

import { PaginaEditorialBotica } from "@/componentes/marca/PaginaEditorialBotica";
import { JsonLd } from "@/componentes/seo/JsonLd";
import { METADATA_LA_BOTICA } from "@/contenido/marca/contenidoMarca";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import { construirSchemasPaginaInformativa } from "@/infraestructura/seo/structuredData";

export const metadata: Metadata = construirMetadataSeo({
  title: METADATA_LA_BOTICA.title,
  description: METADATA_LA_BOTICA.description,
  rutaCanonical: "/la-botica",
});

export default function PaginaLaBotica(): JSX.Element {
  const schemas = construirSchemasPaginaInformativa({
    ruta: "/la-botica",
    titulo: "La Botica de la Bruja Lore",
    descripcion: METADATA_LA_BOTICA.description,
    incluirBreadcrumb: false,
  });

  return (
    <>
      <JsonLd data={schemas} />
      <PaginaEditorialBotica />
    </>
  );
}
