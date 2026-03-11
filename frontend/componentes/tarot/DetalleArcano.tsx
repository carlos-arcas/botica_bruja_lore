import Image from "next/image";

import type { ArcanoTarot } from "@/contenido/tarot/arcanosTarot";

import estilos from "./tarot.module.css";

type Props = {
  arcano: ArcanoTarot | null;
};

export function DetalleArcano({ arcano }: Props): JSX.Element {
  if (!arcano) {
    return (
      <section className="bloque-home" aria-live="polite">
        <h2>Archivo de arcanos</h2>
        <p>No encontramos el arcano solicitado. Elige una carta del listado para continuar.</p>
      </section>
    );
  }

  return (
    <section className={`bloque-home ${estilos.detalle}`} aria-live="polite">
      <Image src={arcano.imagen} alt={`Ilustración ampliada de ${arcano.nombre}`} width={320} height={480} className={estilos.imagenDetalle} />
      <div>
        <p className={estilos.numero}>Arcano {arcano.numero}</p>
        <h2>{arcano.nombre}</h2>
        <p>{arcano.descripcionEditorial}</p>
        <h3>Palabras clave</h3>
        <ul className={estilos.palabrasClave}>
          {arcano.palabrasClave.map((palabra) => (
            <li key={palabra}>{palabra}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
