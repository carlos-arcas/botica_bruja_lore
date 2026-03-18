import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function ContenedorPaginaComercial({ children }: Props): JSX.Element {
  return <main className="contenedor-home contenedor-comercial">{children}</main>;
}
