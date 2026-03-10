import type { Metadata } from "next";

import { VistaCestaRitual } from "@/componentes/catalogo/cesta/VistaCestaRitual";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Cesta ritual local | La Botica de la Bruja Lore",
  description: "Revisa tu selección ritual local y deriva varias piezas al flujo artesanal de encargo sin checkout.",
  indexable: false,
});

export default function PaginaCesta(): JSX.Element {
  return (
    <main className="contenedor-home">
      <VistaCestaRitual />
    </main>
  );
}
