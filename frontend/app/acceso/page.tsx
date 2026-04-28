import type { Metadata } from "next";

import { FormularioCuentaCliente } from "@/componentes/cuenta_cliente/FormularioCuentaCliente";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Acceso | La Botica de la Bruja Lore",
  description: "Entrar en la cuenta real de cliente.",
  indexable: false,
});

export default function PaginaAcceso(): JSX.Element {
  return <main className="contenedor-home"><FormularioCuentaCliente modo="acceso" /></main>;
}
