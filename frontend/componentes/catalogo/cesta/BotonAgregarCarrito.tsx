"use client";

import { useEffect, useState } from "react";

import { useCarrito } from "./useCarrito";
import estilos from "./cestaRitual.module.css";

type Props = {
  slugProducto: string;
  cantidad?: number;
};

export function BotonAgregarCarrito({ slugProducto, cantidad }: Props): JSX.Element {
  const { agregarAlCarrito } = useCarrito();
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (!agregado) {
      return;
    }

    const temporizador = window.setTimeout(() => setAgregado(false), 1800);
    return () => window.clearTimeout(temporizador);
  }, [agregado]);

  const agregarProducto = (): void => {
    agregarAlCarrito(slugProducto, cantidad);
    setAgregado(true);
  };

  return (
    <div>
      <button type="button" className="boton boton--principal" onClick={agregarProducto}>
        Agregar al carrito
      </button>
      {agregado && <p className={estilos.estadoAnadido}>Producto agregado al carrito.</p>}
    </div>
  );
}
