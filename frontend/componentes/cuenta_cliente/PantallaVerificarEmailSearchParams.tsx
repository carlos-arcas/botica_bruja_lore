"use client";

import { useSearchParams } from "next/navigation";

import { PantallaVerificarEmail } from "@/componentes/cuenta_cliente/PantallaVerificarEmail";

export function PantallaVerificarEmailSearchParams(): JSX.Element {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return <PantallaVerificarEmail token={token} />;
}
