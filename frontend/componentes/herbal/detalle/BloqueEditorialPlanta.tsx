import Link from "next/link";

import { PlantaPublica } from "@/infraestructura/api/herbal";

type Props = {
  planta: PlantaPublica;
};

export function BloqueEditorialPlanta({ planta }: Props): JSX.Element {
  return (
    <section className="bloque-home">
      <h2>Contexto editorial de la planta</h2>
      <p>{planta.descripcion_breve}</p>
      <p>
        La ficha de {planta.nombre} mantiene una lectura editorial clara y conecta con navegación
        útil hacia rituales relacionados y catálogo público.
      </p>
      <ul className="ficha-herbal__intenciones" aria-label="Intenciones asociadas">
        {planta.intenciones.length > 0 ? (
          planta.intenciones.map((intencion) => (
            <li key={intencion.slug}>{intencion.nombre}</li>
          ))
        ) : (
          <li>Sin intención pública asociada todavía.</li>
        )}
      </ul>
      <p>
        <Link href="/hierbas">Explorar más hierbas</Link> · <Link href="/rituales">Ver rituales conectados</Link>
      </p>
    </section>
  );
}
