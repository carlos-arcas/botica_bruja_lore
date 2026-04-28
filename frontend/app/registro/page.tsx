import type { Metadata } from "next";

import { FormularioCuentaCliente } from "@/componentes/cuenta_cliente/FormularioCuentaCliente";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Registro | La Botica de la Bruja Lore",
  description: "Crear cuenta real de cliente.",
  indexable: false,
});

export default function PaginaRegistro(): JSX.Element {
  return <main className="contenedor-home"><FormularioCuentaCliente modo="registro" /></main>;
}
