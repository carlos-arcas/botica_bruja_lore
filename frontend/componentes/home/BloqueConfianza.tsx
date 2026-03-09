import { BLOQUE_CONFIANZA } from "@/contenido/home/contenidoHome";

export function BloqueConfianza(): JSX.Element {
  return (
    <section id="confianza" className="bloque-home" aria-labelledby="titulo-confianza">
      <h2 id="titulo-confianza">Confianza y cuidado comercial</h2>
      <ul className="lista-destacada">
        {BLOQUE_CONFIANZA.map((punto) => (
          <li key={punto}>{punto}</li>
        ))}
      </ul>
    </section>
  );
}
