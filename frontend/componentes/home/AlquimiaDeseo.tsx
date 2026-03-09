import { BLOQUE_ALQUIMIA } from "@/contenido/home/contenidoHome";

export function AlquimiaDeseo(): JSX.Element {
  return (
    <section id="alquimia-deseo" className="bloque-home" aria-labelledby="titulo-alquimia">
      <h2 id="titulo-alquimia">{BLOQUE_ALQUIMIA.titulo}</h2>
      <p>{BLOQUE_ALQUIMIA.descripcion}</p>
      <ul className="lista-destacada">
        {BLOQUE_ALQUIMIA.puntos.map((punto) => (
          <li key={punto}>{punto}</li>
        ))}
      </ul>
    </section>
  );
}
