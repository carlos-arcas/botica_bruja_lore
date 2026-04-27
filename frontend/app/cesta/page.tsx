import type { Metadata } from "next";

import { VistaCestaRitual } from "@/componentes/catalogo/cesta/VistaCestaRitual";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Carrito | La Botica de la Bruja Lore",
  description: "Revisa tu carrito, ajusta cantidades y continua al checkout real.",
  indexable: false,
});

export default function PaginaCesta(): JSX.Element {
  return (
    <main className="contenedor-home">
      <VistaCestaRitual />
    </main>
  );
}
