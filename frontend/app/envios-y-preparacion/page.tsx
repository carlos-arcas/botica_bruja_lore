import type { Metadata } from "next";

import { PaginaLegalComercialVista } from "@/componentes/legal/PaginaLegalComercial";
import { obtenerPaginaLegalComercial } from "@/contenido/legal/paginasLegalesComerciales";
import { JsonLd } from "@/componentes/seo/JsonLd";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import { construirSchemasPaginaInformativa } from "@/infraestructura/seo/structuredData";

const CONTENIDO = obtenerPaginaLegalComercial("/envios-y-preparacion");

export const metadata: Metadata = construirMetadataSeo({
  title: CONTENIDO.metadata.title,
  description: CONTENIDO.metadata.description,
  rutaCanonical: "/envios-y-preparacion",
  indexable: CONTENIDO.seo.indexable,
});

export default function PaginaEnviosPreparacion(): JSX.Element {
  const schemas = construirSchemasPaginaInformativa({
    ruta: CONTENIDO.ruta,
    titulo: CONTENIDO.titulo,
    descripcion: CONTENIDO.introduccion,
    incluirBreadcrumb: true,
  });

  return (
    <>
      <JsonLd id="schema-envios-preparacion" data={schemas} />
      <PaginaLegalComercialVista contenido={CONTENIDO} />
    </>
  );
}
