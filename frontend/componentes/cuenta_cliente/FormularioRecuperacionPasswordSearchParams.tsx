"use client";

import { useSearchParams } from "next/navigation";

import { FormularioRecuperacionPassword } from "@/componentes/cuenta_cliente/FormularioRecuperacionPassword";

export function FormularioRecuperacionPasswordSearchParams(): JSX.Element {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  return <FormularioRecuperacionPassword token={token} />;
}
