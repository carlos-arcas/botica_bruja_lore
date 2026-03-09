import type { Metadata } from "next";

import { VistaCestaRitual } from "@/componentes/catalogo/cesta/VistaCestaRitual";

export const metadata: Metadata = {
  title: "Cesta ritual local | La Botica de la Bruja Lore",
  description: "Revisa tu selección ritual local y deriva varias piezas al flujo artesanal de encargo sin checkout.",
};

export default function PaginaCesta(): JSX.Element {
  return (
    <main className="contenedor-home">
      <VistaCestaRitual />
    </main>
  );
}
