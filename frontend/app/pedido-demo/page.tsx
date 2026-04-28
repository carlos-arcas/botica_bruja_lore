import type { Metadata } from "next";

import { ReciboPedidoDemo } from "@/componentes/catalogo/encargo/ReciboPedidoDemo";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Recibo de pedido | La Botica de la Bruja Lore",
  description: "Consulta del recibo posterior al checkout reservado.",
  indexable: false,
});

export default function PaginaReciboPedidoDemoVacio(): JSX.Element {
  return (
    <main className="contenedor-home">
      <ReciboPedidoDemo />
    </main>
  );
}
