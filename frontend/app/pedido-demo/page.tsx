import type { Metadata } from "next";

import { ReciboPedidoDemo } from "@/componentes/catalogo/encargo/ReciboPedidoDemo";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Recibo demo de pedido | La Botica de la Bruja Lore",
  description: "Consulta del recibo demo posterior al checkout en entorno sin cobro real.",
  indexable: false,
});

export default function PaginaReciboPedidoDemoVacio(): JSX.Element {
  return (
    <main className="contenedor-home">
      <ReciboPedidoDemo />
    </main>
  );
}
