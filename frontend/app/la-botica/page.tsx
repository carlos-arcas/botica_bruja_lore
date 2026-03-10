import type { Metadata } from "next";

import { PaginaEditorialBotica } from "@/componentes/marca/PaginaEditorialBotica";
import { METADATA_LA_BOTICA } from "@/contenido/marca/contenidoMarca";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: METADATA_LA_BOTICA.title,
  description: METADATA_LA_BOTICA.description,
  rutaCanonical: "/la-botica",
});

export default function PaginaLaBotica(): JSX.Element {
  return <PaginaEditorialBotica />;
}
