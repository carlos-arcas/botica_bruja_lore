import type { Metadata } from "next";

import { PaginaEditorialBotica } from "@/componentes/marca/PaginaEditorialBotica";
import { METADATA_LA_BOTICA } from "@/contenido/marca/contenidoMarca";

export const metadata: Metadata = METADATA_LA_BOTICA;

export default function PaginaLaBotica(): JSX.Element {
  return <PaginaEditorialBotica />;
}
