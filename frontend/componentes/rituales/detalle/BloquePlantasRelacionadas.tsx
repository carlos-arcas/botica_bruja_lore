import Link from "next/link";

import { PlantaRelacionadaRitual } from "@/infraestructura/api/rituales";

type Props = {
  plantas: PlantaRelacionadaRitual[];
};

export function BloquePlantasRelacionadas({ plantas }: Props): JSX.Element {
  return (
    <section className="bloque-home">
      <h2>Plantas relacionadas</h2>
      <p>
        Este bloque conecta el ritual con el núcleo herbal navegable. Las fichas de plantas siguen
        siendo la puerta principal del conocimiento base.
      </p>
      <p>
        <Link href="/rituales">Volver al listado de rituales</Link> · <Link href="/hierbas">Entrar por línea herbal</Link>
      </p>

      {plantas.length > 0 ? (
        <ul className="ficha-ritual__plantas" aria-label="Plantas relacionadas al ritual">
          {plantas.map((planta) => (
            <li key={planta.slug}>
              <h3>{planta.nombre}</h3>
              <p>{planta.descripcion_breve}</p>
              <Link href={planta.urlDetalle}>Abrir ficha herbal</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aún no hay plantas públicas asociadas a este ritual.</p>
      )}
    </section>
  );
}
