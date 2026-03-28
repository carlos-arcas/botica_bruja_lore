import type { Metadata } from "next";

import { PanelDireccionesCuentaCliente } from "@/componentes/cuenta_cliente/PanelDireccionesCuentaCliente";

export const metadata: Metadata = {
  title: "Mis direcciones | La Botica de la Bruja Lore",
  description: "Libreta de direcciones real de la cuenta cliente.",
};

type Props = {
  searchParams?: {
    onboarding?: string;
    mensaje?: string;
  };
};

export default function PaginaDireccionesCuentaCliente({ searchParams }: Props): JSX.Element {
  const onboarding = searchParams?.onboarding === "1";
  const mensajeInicial = typeof searchParams?.mensaje === "string" ? searchParams.mensaje : null;
  return <main className="contenedor-home"><PanelDireccionesCuentaCliente onboarding={onboarding} mensajeInicial={mensajeInicial} /></main>;
}
