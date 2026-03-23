import type { Metadata } from "next";
import { Suspense } from "react";

import { PantallaVerificarEmailSearchParams } from "@/componentes/cuenta_cliente/PantallaVerificarEmailSearchParams";

export const metadata: Metadata = {
  title: "Verificar email | La Botica de la Bruja Lore",
  description: "Confirmación de email de la cuenta real de cliente.",
};

export default function PaginaVerificarEmail(): JSX.Element {
  return (
    <main className="contenedor-home">
      <Suspense fallback={<section className="bloque-home"><p>Comprobando enlace de verificación...</p></section>}>
        <PantallaVerificarEmailSearchParams />
      </Suspense>
    </main>
  );
}
