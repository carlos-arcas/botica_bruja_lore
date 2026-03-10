import Link from "next/link";

import { ENLACES_INTERNOS_HOME, INTRO_HOME } from "@/contenido/home/contenidoHome";

export function ContextoEditorialHome(): JSX.Element {
  return (
    <section className="bloque-home" aria-labelledby="titulo-contexto-home">
      <h2 id="titulo-contexto-home">{INTRO_HOME.titulo}</h2>
      {INTRO_HOME.parrafos.map((parrafo) => (
        <p key={parrafo}>{parrafo}</p>
      ))}
      <nav aria-label="Enlaces internos destacados de la home">
        <ul>
          {ENLACES_INTERNOS_HOME.map((enlace) => (
            <li key={enlace.href}>
              <Link href={enlace.href}>{enlace.etiqueta}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
