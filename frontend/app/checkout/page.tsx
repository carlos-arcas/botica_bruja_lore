import { Metadata } from "next";

import { FlujoCheckoutReal } from "@/componentes/catalogo/checkout-real/FlujoCheckoutReal";

export const metadata: Metadata = {
  title: "Checkout real v1 | La Botica de la Bruja Lore",
  description: "Primer checkout real en coexistencia controlada con el flujo demo legado.",
};

export default function PaginaCheckoutReal({ searchParams }: { searchParams?: { producto?: string; cesta?: string } }): JSX.Element {
  return <FlujoCheckoutReal slugPreseleccionado={searchParams?.producto} cestaPreseleccionada={searchParams?.cesta} />;
}
