import type { Metadata } from "next";

import { FormularioCuentaCliente } from "@/componentes/cuenta_cliente/FormularioCuentaCliente";

export const metadata: Metadata = { title: "Registro | La Botica de la Bruja Lore", description: "Crear cuenta real de cliente." };

export default function PaginaRegistro(): JSX.Element {
  return <main className="contenedor-home"><FormularioCuentaCliente modo="registro" /></main>;
}
