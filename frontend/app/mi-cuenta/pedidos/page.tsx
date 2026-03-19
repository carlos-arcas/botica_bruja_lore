import type { Metadata } from "next";

import { PanelCuentaCliente } from "@/componentes/cuenta_cliente/PanelCuentaCliente";

export const metadata: Metadata = { title: "Mis pedidos | La Botica de la Bruja Lore", description: "Listado de pedidos reales asociados a la cuenta cliente." };

export default function PaginaPedidosCuentaCliente(): JSX.Element {
  return <main className="contenedor-home"><PanelCuentaCliente vista="pedidos" /></main>;
}
