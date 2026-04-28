import type { Metadata } from "next";
import { Suspense } from "react";

import { FormularioRecuperacionPasswordSearchParams } from "@/componentes/cuenta_cliente/FormularioRecuperacionPasswordSearchParams";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Recuperar contrasena | La Botica de la Bruja Lore",
  description: "Solicitar o confirmar la recuperacion de contrasena de la cuenta real.",
  indexable: false,
});

export default function PaginaRecuperarPassword(): JSX.Element {
  return (
    <main className="contenedor-home">
      <Suspense fallback={<section className="bloque-home"><p>Cargando recuperacion de contrasena...</p></section>}>
        <FormularioRecuperacionPasswordSearchParams />
      </Suspense>
    </main>
  );
}
