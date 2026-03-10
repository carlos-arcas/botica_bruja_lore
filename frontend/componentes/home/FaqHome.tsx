import { FAQ_HOME } from "@/contenido/home/contenidoHome";

export function FaqHome(): JSX.Element {
  return (
    <section id="faq" className="bloque-home" aria-labelledby="titulo-faq">
      <h2 id="titulo-faq">Preguntas frecuentes</h2>
      <ul className="faq-home">
        {FAQ_HOME.map((item, indice) => (
          <li key={item.pregunta}>
            <details open={indice === 0}>
              <summary className="faq-home__pregunta">{item.pregunta}</summary>
              <div className="faq-home__respuesta">
                <p>{item.respuesta}</p>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
