import type { Metadata } from "next";
import { Suspense } from "react";

import { PantallaVerificarEmailSearchParams } from "@/componentes/cuenta_cliente/PantallaVerificarEmailSearchParams";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Verificar email | La Botica de la Bruja Lore",
  description: "Confirmacion de email de la cuenta real de cliente.",
  indexable: false,
});

export default function PaginaVerificarEmail(): JSX.Element {
  return (
    <main className="contenedor-home">
      <Suspense fallback={<section className="bloque-home"><p>Comprobando enlace de verificacion...</p></section>}>
        <PantallaVerificarEmailSearchParams />
      </Suspense>
    </main>
  );
}
