import type { Metadata } from "next";

import { ReciboPedidoDemo } from "@/componentes/catalogo/encargo/ReciboPedidoDemo";

type Props = {
  params: { id_pedido: string };
};

export const metadata: Metadata = {
  title: "Recibo demo de pedido | La Botica de la Bruja Lore",
  description: "Confirmación post-checkout de pedido demo en entorno sin cobro real.",
};

export default function PaginaReciboPedidoDemo({ params }: Props): JSX.Element {
  return (
    <main className="contenedor-home">
      <ReciboPedidoDemo idPedidoRuta={params.id_pedido} />
    </main>
  );
}
