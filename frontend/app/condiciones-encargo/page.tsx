import type { Metadata } from "next";

import { PaginaLegalComercialVista } from "@/componentes/legal/PaginaLegalComercial";
import { obtenerPaginaLegalComercial } from "@/contenido/legal/paginasLegalesComerciales";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

const CONTENIDO = obtenerPaginaLegalComercial("/condiciones-encargo");

export const metadata: Metadata = construirMetadataSeo({
  title: CONTENIDO.metadata.title,
  description: CONTENIDO.metadata.description,
  rutaCanonical: "/condiciones-encargo",
});

export default function PaginaCondicionesEncargo(): JSX.Element {
  return <PaginaLegalComercialVista contenido={CONTENIDO} />;
}
