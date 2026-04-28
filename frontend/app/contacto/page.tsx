import type { Metadata } from "next";

import { PaginaLegalComercialVista } from "@/componentes/legal/PaginaLegalComercial";
import { obtenerConfiguracionContactoPublico } from "@/contenido/catalogo/canalContactoPublico";
import { describirCanalPublico, obtenerPaginaLegalComercial } from "@/contenido/legal/paginasLegalesComerciales";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

const CONTENIDO = obtenerPaginaLegalComercial("/contacto");

export const metadata: Metadata = construirMetadataSeo({
  title: CONTENIDO.metadata.title,
  description: CONTENIDO.metadata.description,
  rutaCanonical: "/contacto",
  indexable: CONTENIDO.seo.indexable,
});

export default function PaginaContacto(): JSX.Element {
  const notaCanal = describirCanalPublico(obtenerConfiguracionContactoPublico());

  return <PaginaLegalComercialVista contenido={CONTENIDO} notaCanal={notaCanal} />;
}
