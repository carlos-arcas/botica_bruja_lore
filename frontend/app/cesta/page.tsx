import type { Metadata } from "next";

import { VistaCestaRitual } from "@/componentes/catalogo/cesta/VistaCestaRitual";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Mi selección local | La Botica de la Bruja Lore",
  description: "Revisa tu selección local, edítala como líneas reales y continúa hacia el checkout principal.",
  indexable: false,
});

export default function PaginaCesta(): JSX.Element {
  return (
    <main className="contenedor-home">
      <VistaCestaRitual />
    </main>
  );
}
