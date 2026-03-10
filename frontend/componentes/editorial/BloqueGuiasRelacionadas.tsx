import Link from "next/link";

import type { GuiaRelacionada } from "@/contenido/editorial/guiasEditoriales";

type Props = {
  titulo: string;
  descripcion?: string;
  guias: GuiaRelacionada[];
};

export function BloqueGuiasRelacionadas({ titulo, descripcion, guias }: Props): JSX.Element {
  if (guias.length === 0) {
    return <></>;
  }

  return (
    <section className="bloque-home" aria-label={titulo}>
      <h2>{titulo}</h2>
      {descripcion ? <p>{descripcion}</p> : null}
      <ul className="lista-destacada">
        {guias.map((guia) => (
          <li key={guia.slug}>
            <article>
              <h3>
                <Link href={guia.href}>{guia.anchor}</Link>
              </h3>
              <p>{guia.resumen}</p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
