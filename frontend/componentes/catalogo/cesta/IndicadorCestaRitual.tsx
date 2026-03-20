"use client";

import Link from "next/link";

import estilos from "./cestaRitual.module.css";
import { useCarrito } from "./useCarrito";

export function IndicadorCestaRitual(): JSX.Element {
  const { totalUnidades } = useCarrito();

  return (
    <Link href="/cesta" className={`boton boton--secundario ${estilos.indicador}`}>
      Mi selección
      <span className={estilos.contador} aria-label={`${totalUnidades} unidades en mi selección`}>
        {totalUnidades}
      </span>
    </Link>
  );
}
