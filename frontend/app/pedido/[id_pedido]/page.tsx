import type { Metadata } from "next";

import { ReciboPedidoReal } from "@/componentes/catalogo/checkout-real/ReciboPedidoReal";
import { RetornoPago } from "@/infraestructura/api/pedidos";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Detalle de pedido | La Botica de la Bruja Lore",
  description: "Consulta el estado, pago, entrega y documento fiscal de tu pedido.",
  indexable: false,
});

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
