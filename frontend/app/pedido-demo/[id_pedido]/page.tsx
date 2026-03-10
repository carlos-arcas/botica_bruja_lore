import type { Metadata } from "next";

import { ReciboPedidoDemo } from "@/componentes/catalogo/encargo/ReciboPedidoDemo";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

type Props = {
  params: { id_pedido: string };
};

export const metadata: Metadata = construirMetadataSeo({
  title: "Recibo demo de pedido | La Botica de la Bruja Lore",
  description: "Confirmación post-checkout de pedido demo en entorno sin cobro real.",
  indexable: false,
});

export default function PaginaReciboPedidoDemo({ params }: Props): JSX.Element {
  return (
    <main className="contenedor-home">
      <ReciboPedidoDemo idPedidoRuta={params.id_pedido} />
    </main>
  );
}
