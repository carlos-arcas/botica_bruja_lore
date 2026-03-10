import Link from "next/link";

import type { BloqueEnlazadoContextual as BloqueEnlazadoContextualData } from "@/contenido/catalogo/enlazadoInterno";

type Props = {
  bloque: BloqueEnlazadoContextualData;
};

export function BloqueEnlazadoContextual({ bloque }: Props): JSX.Element {
  if (bloque.enlaces.length === 0) {
    return <></>;
  }

  return (
    <section className="bloque-home" aria-label={bloque.titulo}>
      <h2>{bloque.titulo}</h2>
      <p>{bloque.descripcion}</p>
      <ul>
        {bloque.enlaces.map((enlace) => (
          <li key={enlace.href}>
            <p>
              <Link href={enlace.href}>{enlace.anchor}</Link>
            </p>
            <p>{enlace.descripcion}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
