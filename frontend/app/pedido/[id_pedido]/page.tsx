import { Metadata } from "next";

import { ReciboPedidoReal } from "@/componentes/catalogo/checkout-real/ReciboPedidoReal";
import { RetornoPago } from "@/infraestructura/api/pedidos";

export const metadata: Metadata = {
  title: "Pedido real | La Botica de la Bruja Lore",
  description: "Recibo del checkout real v1 persistido en backend.",
};

type Props = {
  params: { id_pedido: string };
  searchParams?: { retorno_pago?: string };
};

export default function PaginaPedidoReal({ params, searchParams }: Props): JSX.Element {
  const retornoPago = normalizarRetorno(searchParams?.retorno_pago);
  return <ReciboPedidoReal idPedidoRuta={params.id_pedido} retornoPago={retornoPago} />;
}

function normalizarRetorno(valor?: string): RetornoPago {
  return valor === "success" || valor === "cancel" ? valor : null;
}
