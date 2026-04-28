import type { Metadata } from "next";

import { AreaCuentaDemo } from "@/componentes/cuenta_demo/AreaCuentaDemo";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Mi cuenta | La Botica de la Bruja Lore",
  description: "Acceso reservado para revisar perfil e historial de pedidos.",
  indexable: false,
});

type Props = {
  searchParams?: { returnTo?: string };
};

export default function PaginaCuentaDemo({ searchParams }: Props): JSX.Element {
  return (
    <main className="contenedor-home">
      <AreaCuentaDemo returnTo={searchParams?.returnTo ?? null} />
    </main>
  );
}
