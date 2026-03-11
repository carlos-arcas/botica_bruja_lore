import Image from "next/image";

import type { ArcanoTarot } from "@/contenido/tarot/arcanosTarot";

import estilos from "./tarot.module.css";

type Props = {
  arcano: ArcanoTarot;
  activo: boolean;
  onSeleccionar: (slug: string) => void;
};

export function TarjetaArcano({ arcano, activo, onSeleccionar }: Props): JSX.Element {
  return (
    <li>
      <button
        type="button"
        className={estilos.tarjeta}
        data-activo={activo}
        onClick={() => onSeleccionar(arcano.slug)}
        aria-pressed={activo}
        aria-label={`Ver detalle de ${arcano.nombre}`}
      >
        <Image src={arcano.imagen} alt={`Dibujo de ${arcano.nombre}`} width={280} height={420} className={estilos.imagenArcano} />
        <div>
          <p className={estilos.numero}>Arcano {arcano.numero}</p>
          <h3>{arcano.nombre}</h3>
          <p>{arcano.significadoBreve}</p>
        </div>
      </button>
    </li>
  );
}
