import type { Metadata } from "next";

import { FormularioRecuperacionPassword } from "@/componentes/cuenta_cliente/FormularioRecuperacionPassword";

export const metadata: Metadata = {
  title: "Recuperar contraseña | La Botica de la Bruja Lore",
  description: "Solicitar o confirmar la recuperación de contraseña de la cuenta real.",
};

export default function PaginaRecuperarPassword(): JSX.Element {
  return <main className="contenedor-home"><FormularioRecuperacionPassword /></main>;
}
