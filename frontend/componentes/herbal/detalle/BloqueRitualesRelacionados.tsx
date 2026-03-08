import Link from "next/link";

import { RitualRelacionadoHerbal } from "@/infraestructura/api/herbal";

type Props = {
  rituales: RitualRelacionadoHerbal[];
};

export function BloqueRitualesRelacionados({ rituales }: Props): JSX.Element {
  return (
    <section className="bloque-home bloque-home--rituales-relacionados">
      <h2>Rituales relacionados</h2>
      <p>
        Esta conexión completa el puente herbal ↔ ritual del Ciclo 2: desde la planta puedes abrir
        rituales asociados sin perder la jerarquía herbal como puerta principal.
      </p>

      {rituales.length > 0 ? (
        <ul className="ficha-herbal__rituales" aria-label="Rituales relacionados con la planta">
          {rituales.map((ritual) => (
            <li key={ritual.slug}>
              <h3>{ritual.nombre}</h3>
              <p>{ritual.contexto_breve}</p>
              <Link href={ritual.urlDetalle}>Abrir ficha ritual</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aún no hay rituales públicos asociados a esta planta.</p>
      )}
    </section>
  );
}
