import Link from "next/link";

import { PlantaPublica } from "@/infraestructura/api/herbal";

type Props = {
  plantas: PlantaPublica[];
};

export function PreviewLineaHerbal({ plantas }: Props): JSX.Element {
  return (
    <section id="linea-herbal" className="bloque-home">
      <div className="bloque-home__cabecera">
        <h2>Línea herbal</h2>
        <Link href="/hierbas">Ver listado completo</Link>
      </div>
      <p>
        Primer acceso real al núcleo herbal público. Esta vista muestra una selección navegable de
        plantas ya publicadas en backend.
      </p>
      <ul className="rejilla-plantas">
        {plantas.map((planta) => (
          <li key={planta.slug}>
            <h3>{planta.nombre}</h3>
            <p>{planta.descripcion_breve}</p>
            {planta.intenciones.length > 0 ? (
              <p className="meta-intencion">
                Intención principal: <strong>{planta.intenciones[0].nombre}</strong>
              </p>
            ) : (
              <p className="meta-intencion">Sin intención pública asociada todavía.</p>
            )}
            <Link href={planta.urlDetalle}>Ver ficha herbal</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
