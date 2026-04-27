import type { Metadata } from "next";

import { FormularioCuentaCliente } from "@/componentes/cuenta_cliente/FormularioCuentaCliente";

export const metadata: Metadata = { title: "Login | La Botica de la Bruja Lore", description: "Entrar en la cuenta real de cliente." };

export default function PaginaAcceso(): JSX.Element {
  return <main className="contenedor-home"><FormularioCuentaCliente modo="acceso" /></main>;
}
