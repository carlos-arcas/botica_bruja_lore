import type { Metadata } from "next";

import { PanelCuentaCliente } from "@/componentes/cuenta_cliente/PanelCuentaCliente";

export const metadata: Metadata = { title: "Mi cuenta | La Botica de la Bruja Lore", description: "Área privada de cuenta real y datos básicos." };

export default function PaginaCuentaCliente(): JSX.Element {
  return <main className="contenedor-home"><PanelCuentaCliente vista="resumen" /></main>;
}
