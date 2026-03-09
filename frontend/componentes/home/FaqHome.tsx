"use client";

import { useState } from "react";

import { FAQ_HOME } from "@/contenido/home/contenidoHome";
import { alternarPreguntaFaq } from "@/componentes/home/interaccionesHome";

export function FaqHome(): JSX.Element {
  const [abierta, setAbierta] = useState(FAQ_HOME[0].pregunta);


  return (
    <section id="faq" className="bloque-home" aria-labelledby="titulo-faq">
      <h2 id="titulo-faq">Preguntas frecuentes</h2>
      <ul className="faq-home">
        {FAQ_HOME.map((item) => {
          const expandida = abierta === item.pregunta;
          const slug = item.pregunta
            .toLowerCase()
            .replaceAll("¿", "")
            .replaceAll("?", "")
            .replaceAll(" ", "-");

          return (
            <li key={item.pregunta}>
              <button
                type="button"
                className="faq-home__pregunta"
                aria-expanded={expandida}
                aria-controls={`faq-${slug}`}
                id={`control-${slug}`}
                onClick={() => setAbierta((actual) => alternarPreguntaFaq(actual, item.pregunta))}
              >
                {item.pregunta}
              </button>
              <div
                id={`faq-${slug}`}
                role="region"
                aria-labelledby={`control-${slug}`}
                hidden={!expandida}
                className="faq-home__respuesta"
              >
                <p>{item.respuesta}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
