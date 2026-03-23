import type { Metadata } from "next";
import { Suspense } from "react";

import { PanelCuentaClienteSearchParams } from "@/componentes/cuenta_cliente/PanelCuentaClienteSearchParams";

export const metadata: Metadata = { title: "Mi cuenta | La Botica de la Bruja Lore", description: "Área privada de cuenta real y datos básicos." };

export default function PaginaCuentaCliente(): JSX.Element {
  return (
    <main className="contenedor-home">
      <Suspense fallback={<section className="bloque-home"><p>Cargando cuenta real...</p></section>}>
        <PanelCuentaClienteSearchParams vista="resumen" />
      </Suspense>
    </main>
  );
}
