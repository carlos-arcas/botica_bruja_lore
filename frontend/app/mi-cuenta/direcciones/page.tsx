import type { Metadata } from "next";

import { PanelDireccionesCuentaCliente } from "@/componentes/cuenta_cliente/PanelDireccionesCuentaCliente";

export const metadata: Metadata = {
  title: "Mis direcciones | La Botica de la Bruja Lore",
  description: "Libreta de direcciones real de la cuenta cliente.",
};

export default function PaginaDireccionesCuentaCliente(): JSX.Element {
  return <main className="contenedor-home"><PanelDireccionesCuentaCliente /></main>;
}
