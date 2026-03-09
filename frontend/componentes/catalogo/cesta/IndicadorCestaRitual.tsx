"use client";

import Link from "next/link";

import estilos from "./cestaRitual.module.css";
import { useCestaRitual } from "./useCestaRitual";

export function IndicadorCestaRitual(): JSX.Element {
  const { totalUnidades } = useCestaRitual();

  return (
    <Link href="/cesta" className={`boton boton--secundario ${estilos.indicador}`}>
      Cesta ritual
      <span className={estilos.contador} aria-label={`${totalUnidades} unidades en cesta`}>
        {totalUnidades}
      </span>
    </Link>
  );
}
