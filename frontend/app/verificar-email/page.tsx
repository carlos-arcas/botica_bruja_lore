import type { Metadata } from "next";

import { PantallaVerificarEmail } from "@/componentes/cuenta_cliente/PantallaVerificarEmail";

export const metadata: Metadata = {
  title: "Verificar email | La Botica de la Bruja Lore",
  description: "Confirmación de email de la cuenta real de cliente.",
};

export default function PaginaVerificarEmail(): JSX.Element {
  return <main className="contenedor-home"><PantallaVerificarEmail /></main>;
}
