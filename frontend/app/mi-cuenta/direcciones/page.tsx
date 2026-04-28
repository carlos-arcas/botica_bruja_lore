import type { Metadata } from "next";

import { PanelDireccionesCuentaCliente } from "@/componentes/cuenta_cliente/PanelDireccionesCuentaCliente";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Mis direcciones | La Botica de la Bruja Lore",
  description: "Libreta de direcciones real de la cuenta cliente.",
  indexable: false,
});

export default function PaginaDireccionesCuentaCliente(): JSX.Element {
  return <main className="contenedor-home"><PanelDireccionesCuentaCliente /></main>;
}
