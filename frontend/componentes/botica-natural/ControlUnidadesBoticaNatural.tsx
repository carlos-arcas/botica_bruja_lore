"use client";

import { useId } from "react";

type Props = {
  cantidad: number;
  alDisminuir: () => void;
  alAumentar: () => void;
};

export function ControlUnidadesBoticaNatural({ cantidad, alDisminuir, alAumentar }: Props): JSX.Element {
  const idCantidad = useId();

  return (
    <div className="botica-natural__control-unidades" aria-label="Control de unidades">
      <label htmlFor={idCantidad}>Unidades</label>
      <div className="botica-natural__stepper">
        <button type="button" onClick={alDisminuir} aria-label="Disminuir unidades">
          -
        </button>
        <input id={idCantidad} type="number" min={1} value={cantidad} readOnly aria-live="polite" />
        <button type="button" onClick={alAumentar} aria-label="Aumentar unidades">
          +
        </button>
      </div>
    </div>
  );
}
