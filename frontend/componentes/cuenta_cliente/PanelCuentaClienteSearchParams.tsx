"use client";

import { useSearchParams } from "next/navigation";

import { PanelCuentaCliente } from "@/componentes/cuenta_cliente/PanelCuentaCliente";

type Props = { vista: "resumen" | "pedidos" };

export function PanelCuentaClienteSearchParams({ vista }: Props): JSX.Element {
  const searchParams = useSearchParams();
  const mensajeAlta = searchParams.get("mensaje");

  return <PanelCuentaCliente vista={vista} mensajeAlta={mensajeAlta} />;
}
