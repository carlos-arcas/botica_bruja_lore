import type { Metadata } from "next";

import { PaginaLegalComercialVista } from "@/componentes/legal/PaginaLegalComercial";
import { obtenerPaginaLegalComercial } from "@/contenido/legal/paginasLegalesComerciales";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

const CONTENIDO = obtenerPaginaLegalComercial("/devoluciones");

export const metadata: Metadata = construirMetadataSeo({
  title: CONTENIDO.metadata.title,
  description: CONTENIDO.metadata.description,
  rutaCanonical: "/devoluciones",
  indexable: CONTENIDO.seo.indexable,
});

export default function PaginaDevoluciones(): JSX.Element {
  return <PaginaLegalComercialVista contenido={CONTENIDO} />;
}
