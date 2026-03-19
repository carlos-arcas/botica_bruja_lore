import { Metadata } from "next";

import { ReciboPedidoReal } from "@/componentes/catalogo/checkout-real/ReciboPedidoReal";

export const metadata: Metadata = {
  title: "Pedido real | La Botica de la Bruja Lore",
  description: "Recibo del checkout real v1 persistido en backend.",
};

export default function PaginaPedidoReal({ params }: { params: { id_pedido: string } }): JSX.Element {
  return <ReciboPedidoReal idPedidoRuta={params.id_pedido} />;
}
