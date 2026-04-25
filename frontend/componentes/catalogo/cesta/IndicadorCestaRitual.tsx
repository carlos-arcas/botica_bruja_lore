"use client";

import Link from "next/link";

import estilos from "./cestaRitual.module.css";
import { useCarrito } from "./useCarrito";

export function IndicadorCestaRitual(): JSX.Element {
  const { totalUnidades } = useCarrito();

  return (
    <Link href="/cesta" className={`boton boton--secundario ${estilos.indicador}`}>
      Carrito
      <span className={estilos.contador} aria-label={`${totalUnidades} unidades en el carrito`}>
        {totalUnidades}
      </span>
    </Link>
  );
}
