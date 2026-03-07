import { PlantaPublica } from "@/infraestructura/api/herbal";

type Props = {
  planta: PlantaPublica;
};

export function BloqueEditorialPlanta({ planta }: Props): JSX.Element {
  return (
    <section className="bloque-home">
      <h2>Contexto editorial de la planta</h2>
      <p>
        Esta ficha prioriza conocimiento herbal navegable: lenguaje sobrio, utilidad real y
        separación clara frente al plano comercial.
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
    </section>
  );
}
