import Link from "next/link";

import {
  CTA_MARCA,
  EXPERIENCIA_ENCARGO,
  FAQ_MARCA,
  HERO_MARCA,
  MANIFIESTO_BOTICA,
  NOTAS_COMPOSICION,
  PASOS_CURADURIA,
  PRINCIPIOS_BOTICA,
} from "@/contenido/marca/contenidoMarca";

import estilos from "./paginaMarca.module.css";

export function PaginaEditorialBotica(): JSX.Element {
  return (
    <main className="contenedor-home">
      <section className={`hero-portada bloque-home ${estilos.heroMarca}`} aria-labelledby="titulo-marca">
        <p className={estilos.etiqueta}>{HERO_MARCA.etiqueta}</p>
        <h1 id="titulo-marca">{HERO_MARCA.titulo}</h1>
        <p>{HERO_MARCA.descripcion}</p>
        <div className="hero-portada__acciones">
          <Link href={HERO_MARCA.acciones[0].href} className="boton boton--principal">
            {HERO_MARCA.acciones[0].texto}
          </Link>
          <Link href={HERO_MARCA.acciones[1].href} className="boton boton--secundario">
            {HERO_MARCA.acciones[1].texto}
          </Link>
        </div>
        <p className={estilos.nota}>{HERO_MARCA.nota}</p>
      </section>

      <section className="bloque-home" aria-labelledby="titulo-manifiesto">
        <h2 id="titulo-manifiesto">Manifiesto breve</h2>
        <ul className={estilos.manifiesto}>
          {MANIFIESTO_BOTICA.map((item) => (
            <li key={item} className={estilos.tarjeta}>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="bloque-home" aria-labelledby="titulo-curaduria">
        <h2 id="titulo-curaduria">Cómo preparamos colecciones y rituales</h2>
        <div className={estilos.rejilla}>
          {PASOS_CURADURIA.map((paso) => (
            <article key={paso.titulo} className={estilos.tarjeta}>
              <h3>{paso.titulo}</h3>
              <p>{paso.descripcion}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bloque-home" aria-labelledby="titulo-principios">
        <h2 id="titulo-principios">Principios de la casa</h2>
        <div className={estilos.rejilla}>
          {PRINCIPIOS_BOTICA.map((principio) => (
            <article key={principio.nombre} className={estilos.tarjeta}>
              <h3>{principio.nombre}</h3>
              <p>{principio.descripcion}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bloque-home" aria-labelledby="titulo-encargo-artesanal">
        <h2 id="titulo-encargo-artesanal">{EXPERIENCIA_ENCARGO.titulo}</h2>
        <p>{EXPERIENCIA_ENCARGO.descripcion}</p>
        <ul className="lista-destacada">
          {EXPERIENCIA_ENCARGO.puntos.map((punto) => (
            <li key={punto}>{punto}</li>
          ))}
        </ul>
      </section>

      <section className="bloque-home" aria-labelledby="titulo-notas">
        <h2 id="titulo-notas">Materiales y notas de composición</h2>
        <div className={estilos.rejilla}>
          {NOTAS_COMPOSICION.map((nota) => (
            <article key={nota.etiqueta} className={estilos.tarjeta}>
              <h3>{nota.etiqueta}</h3>
              <p>{nota.detalle}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bloque-home" aria-labelledby="titulo-faq-marca">
        <h2 id="titulo-faq-marca">FAQ de marca y proceso</h2>
        <div className={estilos.faq}>
          {FAQ_MARCA.map((item) => (
            <details key={item.pregunta}>
              <summary>{item.pregunta}</summary>
              <p>{item.respuesta}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="bloque-home cta-final-home" aria-labelledby="titulo-cta-marca">
        <h2 id="titulo-cta-marca">{CTA_MARCA.titulo}</h2>
        <p>{CTA_MARCA.descripcion}</p>
        <div className="hero-portada__acciones">
          <Link href={CTA_MARCA.primaria.href} className="boton boton--principal">
            {CTA_MARCA.primaria.texto}
          </Link>
          <Link href={CTA_MARCA.secundaria.href} className="boton boton--secundario">
            {CTA_MARCA.secundaria.texto}
          </Link>
        </div>
      </section>
    </main>
  );
}
