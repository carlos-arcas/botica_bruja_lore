import type { Metadata } from "next";
import { Suspense } from "react";

import { PanelCuentaClienteSearchParams } from "@/componentes/cuenta_cliente/PanelCuentaClienteSearchParams";

export const metadata: Metadata = { title: "Mis pedidos | La Botica de la Bruja Lore", description: "Listado de pedidos reales asociados a la cuenta cliente." };

export default function PaginaPedidosCuentaCliente(): JSX.Element {
  return (
    <main className="contenedor-home">
      <Suspense fallback={<section className="bloque-home"><p>Cargando cuenta real...</p></section>}>
        <PanelCuentaClienteSearchParams vista="pedidos" />
      </Suspense>
    </main>
  );
}
