import { PASOS_RITUAL } from "@/contenido/home/contenidoHome";

export function ComoFuncionaRitual(): JSX.Element {
  return (
    <section id="como-elegir" className="bloque-home" aria-labelledby="titulo-como-funciona">
      <h2 id="titulo-como-funciona">Cómo elegir tu ritual</h2>
      <ul className="pasos-ritual">
        {PASOS_RITUAL.map((paso) => (
          <li key={paso.titulo}>
            <h3>{paso.titulo}</h3>
            <p>{paso.descripcion}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
