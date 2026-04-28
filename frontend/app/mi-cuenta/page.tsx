import type { Metadata } from "next";
import { Suspense } from "react";

import { PanelCuentaClienteSearchParams } from "@/componentes/cuenta_cliente/PanelCuentaClienteSearchParams";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Mi cuenta | La Botica de la Bruja Lore",
  description: "Area privada de cuenta real y datos basicos.",
  indexable: false,
});

export default function PaginaCuentaCliente(): JSX.Element {
  return (
    <main className="contenedor-home">
      <Suspense fallback={<section className="bloque-home"><p>Cargando cuenta real...</p></section>}>
        <PanelCuentaClienteSearchParams vista="resumen" />
      </Suspense>
    </main>
  );
}
