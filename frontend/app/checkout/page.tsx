import type { Metadata } from "next";

import { FlujoCheckoutReal } from "@/componentes/catalogo/checkout-real/FlujoCheckoutReal";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Checkout | La Botica de la Bruja Lore",
  description: "Finaliza tu compra local con pedido real, direcciones de cuenta e inventario validado.",
  indexable: false,
});

export default function PaginaCheckoutReal({ searchParams }: { searchParams?: { producto?: string; cesta?: string } }): JSX.Element {
  return <FlujoCheckoutReal slugPreseleccionado={searchParams?.producto} cestaPreseleccionada={searchParams?.cesta} />;
}
