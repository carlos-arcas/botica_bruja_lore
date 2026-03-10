import type { Metadata } from "next";

import { ReciboPedidoDemo } from "@/componentes/catalogo/encargo/ReciboPedidoDemo";

export const metadata: Metadata = {
  title: "Recibo demo de pedido | La Botica de la Bruja Lore",
  description: "Consulta del recibo demo posterior al checkout en entorno sin cobro real.",
};

export default function PaginaReciboPedidoDemoVacio(): JSX.Element {
  return (
    <main className="contenedor-home">
      <ReciboPedidoDemo />
    </main>
  );
}
