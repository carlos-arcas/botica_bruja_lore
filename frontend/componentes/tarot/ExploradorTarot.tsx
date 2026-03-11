"use client";

import { useMemo, useState } from "react";

import { ARCANOS_TAROT, INTRO_TAROT, obtenerArcanoPorSlug, resolverSlugInicialTarot } from "@/contenido/tarot/arcanosTarot";

import { DetalleArcano } from "./DetalleArcano";
import { TarjetaArcano } from "./TarjetaArcano";
import estilos from "./tarot.module.css";

export function ExploradorTarot(): JSX.Element {
  const [arcanoActivo, setArcanoActivo] = useState<string>(resolverSlugInicialTarot());
  const detalle = useMemo(() => obtenerArcanoPorSlug(arcanoActivo), [arcanoActivo]);

  return (
    <main className="contenedor-home">
      <section className={`hero-portada ${estilos.heroTarot}`}>
        <p className={estilos.etiqueta}>{INTRO_TAROT.etiqueta}</p>
        <h1>{INTRO_TAROT.titulo}</h1>
        <p>{INTRO_TAROT.descripcion}</p>
        <p className={estilos.nota}>{INTRO_TAROT.nota}</p>
      </section>

      <section className="bloque-home" aria-labelledby="titulo-listado-arcanos">
        <h2 id="titulo-listado-arcanos">Arcanos mayores ilustrados</h2>
        <p>Selecciona una carta para ampliar su lectura editorial.</p>
        <ul className={estilos.rejillaArcanos}>
          {ARCANOS_TAROT.map((arcano) => (
            <TarjetaArcano
              key={arcano.slug}
              arcano={arcano}
              activo={detalle?.slug === arcano.slug}
              onSeleccionar={setArcanoActivo}
            />
          ))}
        </ul>
      </section>

      <DetalleArcano arcano={detalle} />
    </main>
  );
}
