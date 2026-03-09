"use client";

import { useState } from "react";

import { INTENCIONES_DESTACADAS } from "@/contenido/home/contenidoHome";
import { resolverIntencionActiva } from "@/componentes/home/interaccionesHome";

export function IntencionesDestacadas(): JSX.Element {
  const [activa, setActiva] = useState(INTENCIONES_DESTACADAS[0].id);
  const intencionActiva = resolverIntencionActiva(activa, INTENCIONES_DESTACADAS);

  return (
    <section id="intenciones" className="bloque-home" aria-labelledby="titulo-intenciones">
      <h2 id="titulo-intenciones">Colecciones por intención ritual</h2>
      <div className="tabs-intenciones" role="tablist" aria-label="Intenciones destacadas">
        {INTENCIONES_DESTACADAS.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={item.id === intencionActiva.id}
            aria-controls={`panel-${item.id}`}
            id={`tab-${item.id}`}
            className={item.id === intencionActiva.id ? "tab-intencion tab-intencion--activa" : "tab-intencion"}
            onClick={() => setActiva(item.id)}
          >
            {item.nombre}
          </button>
        ))}
      </div>

      <article
        id={`panel-${intencionActiva.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${intencionActiva.id}`}
        className="panel-intencion"
      >
        <h3>{intencionActiva.gancho}</h3>
        <p>{intencionActiva.descripcion}</p>
        <ol>
          {intencionActiva.pasos.map((paso) => (
            <li key={paso}>{paso}</li>
          ))}
        </ol>
      </article>
    </section>
  );
}
