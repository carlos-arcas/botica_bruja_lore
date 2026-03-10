import type { Metadata } from "next";

import { PaginaLegalComercialVista } from "@/componentes/legal/PaginaLegalComercial";
import { obtenerPaginaLegalComercial } from "@/contenido/legal/paginasLegalesComerciales";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

const CONTENIDO = obtenerPaginaLegalComercial("/envios-y-preparacion");

export const metadata: Metadata = construirMetadataSeo({
  title: CONTENIDO.metadata.title,
  description: CONTENIDO.metadata.description,
  rutaCanonical: "/envios-y-preparacion",
});

export default function PaginaEnviosPreparacion(): JSX.Element {
  return <PaginaLegalComercialVista contenido={CONTENIDO} />;
}
