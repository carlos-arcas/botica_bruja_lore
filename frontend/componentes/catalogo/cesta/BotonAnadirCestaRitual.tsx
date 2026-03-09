"use client";

import { useEffect, useState } from "react";

import { useCestaRitual } from "./useCestaRitual";
import estilos from "./cestaRitual.module.css";

type Props = {
  slugProducto: string;
};

export function BotonAnadirCestaRitual({ slugProducto }: Props): JSX.Element {
  const { anadir } = useCestaRitual();
  const [anadido, setAnadido] = useState(false);

  useEffect(() => {
    if (!anadido) {
      return;
    }

    const temporizador = window.setTimeout(() => setAnadido(false), 1800);
    return () => window.clearTimeout(temporizador);
  }, [anadido]);

  const anadirProducto = (): void => {
    anadir(slugProducto);
    setAnadido(true);
  };

  return (
    <div>
      <button type="button" className="boton boton--principal" onClick={anadirProducto}>
        Añadir a la cesta ritual
      </button>
      {anadido && <p className={estilos.estadoAnadido}>Pieza añadida a tu selección ritual.</p>}
    </div>
  );
}
