import type { Metadata } from "next";
import { Suspense } from "react";

import { FormularioRecuperacionPasswordSearchParams } from "@/componentes/cuenta_cliente/FormularioRecuperacionPasswordSearchParams";

export const metadata: Metadata = {
  title: "Recuperar contraseña | La Botica de la Bruja Lore",
  description: "Solicitar o confirmar la recuperación de contraseña de la cuenta real.",
};

export default function PaginaRecuperarPassword(): JSX.Element {
  return (
    <main className="contenedor-home">
      <Suspense fallback={<section className="bloque-home"><p>Cargando recuperación de contraseña...</p></section>}>
        <FormularioRecuperacionPasswordSearchParams />
      </Suspense>
    </main>
  );
}
