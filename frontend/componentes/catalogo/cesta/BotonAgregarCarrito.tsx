"use client";

import { useEffect, useState } from "react";

import { emitirEventoEmbudoLocal } from "@/contenido/analitica/embudoLocal";

import { useCarrito } from "./useCarrito";
import estilos from "./cestaRitual.module.css";

type Props = {
  slugProducto: string;
  cantidad?: number;
  disabled?: boolean;
  motivoBloqueo?: string;
};

export function BotonAgregarCarrito({ slugProducto, cantidad, disabled = false, motivoBloqueo }: Props): JSX.Element {
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
    if (disabled) return;
    agregarAlCarrito(slugProducto, cantidad);
    emitirEventoEmbudoLocal("producto_anadido_cesta", {
      slug_producto: slugProducto,
      cantidad,
      ruta: window.location.pathname,
    });
    setAgregado(true);
  };

  return (
    <div>
      <button type="button" className="boton boton--principal" onClick={agregarProducto} disabled={disabled} aria-disabled={disabled}>
        {disabled ? "No disponible" : "Agregar al carrito"}
      </button>
      {disabled && motivoBloqueo ? <p className={estilos.estadoAnadido}>{motivoBloqueo}</p> : null}
      {agregado && <p className={estilos.estadoAnadido}>Producto agregado al carrito.</p>}
    </div>
  );
}
