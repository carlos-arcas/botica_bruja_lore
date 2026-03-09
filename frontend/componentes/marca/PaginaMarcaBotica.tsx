import Link from "next/link";

import {
  CTA_CIERRE_MARCA,
  EXPERIENCIA_ENCARGO,
  FAQ_MARCA,
  HERO_MARCA,
  MANIFIESTO_BOTICA,
  NOTAS_COMPOSICION,
  PASOS_CURADURIA,
  PRINCIPIOS_CASA,
} from "@/contenido/marca/contenidoMarcaBotica";

import estilos from "./paginaMarcaBotica.module.css";

export function PaginaMarcaBotica(): JSX.Element {
  return (
    <main className="contenedor-home">
      <section className="hero-portada bloque-home" aria-labelledby="titulo-marca-botica">
        <p className={estilos.etiqueta}>{HERO_MARCA.etiqueta}</p>
        <h1 id="titulo-marca-botica">{HERO_MARCA.titulo}</h1>
        <p>{HERO_MARCA.descripcion}</p>
        <div className="hero-portada__acciones">
          <Link href={HERO_MARCA.ctaPrincipal.href} className="boton boton--principal">
            {HERO_MARCA.ctaPrincipal.texto}
          </Link>
          <Link href={HERO_MARCA.ctaSecundaria.href} className="boton boton--secundario">
            {HERO_MARCA.ctaSecundaria.texto}
          </Link>
        </div>
        <p className={estilos.nota}>{HERO_MARCA.nota}</p>
      </section>

      <section className="bloque-home" aria-labelledby="titulo-manifiesto-botica">
        <h2 id="titulo-manifiesto-botica">Manifiesto de la botica</h2>
        <p>{MANIFIESTO_BOTICA}</p>
      </section>

      <section className="bloque-home" aria-labelledby="titulo-curaduria-botica">
        <h2 id="titulo-curaduria-botica">Cómo curamos colecciones y rituales</h2>
        <ol className={estilos.listaPasos}>
          {PASOS_CURADURIA.map((paso) => (
            <li key={paso.titulo}>
              <h3>{paso.titulo}</h3>
              <p>{paso.descripcion}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bloque-home" aria-labelledby="titulo-principios-casa">
        <h2 id="titulo-principios-casa">Principios de la casa</h2>
        <ul className={estilos.rejillaPrincipios}>
          {PRINCIPIOS_CASA.map((principio) => (
            <li key={principio.nombre}>
              <h3>{principio.nombre}</h3>
              <p>{principio.descripcion}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bloque-home" aria-labelledby="titulo-experiencia-encargo">
        <h2 id="titulo-experiencia-encargo">{EXPERIENCIA_ENCARGO.titulo}</h2>
        <p>{EXPERIENCIA_ENCARGO.descripcion}</p>
        <ul className={estilos.listaPuntos}>
          {EXPERIENCIA_ENCARGO.puntos.map((punto) => (
            <li key={punto}>{punto}</li>
          ))}
        </ul>
      </section>

      <section className="bloque-home" aria-labelledby="titulo-composicion">
        <h2 id="titulo-composicion">{NOTAS_COMPOSICION.titulo}</h2>
        <p>{NOTAS_COMPOSICION.descripcion}</p>
      </section>

      <section className="bloque-home" aria-labelledby="titulo-faq-marca">
        <h2 id="titulo-faq-marca">FAQ de marca y proceso</h2>
        <ul className={estilos.listaFaq}>
          {FAQ_MARCA.map((item) => (
            <li key={item.pregunta}>
              <details>
                <summary>{item.pregunta}</summary>
                <p>{item.respuesta}</p>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <section className="bloque-home" aria-labelledby="titulo-cta-marca">
        <h2 id="titulo-cta-marca">{CTA_CIERRE_MARCA.titulo}</h2>
        <p>{CTA_CIERRE_MARCA.descripcion}</p>
        <div className="hero-portada__acciones">
          {CTA_CIERRE_MARCA.ctas.map((cta) => (
            <Link key={cta.href} href={cta.href} className="boton boton--principal">
              {cta.texto}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
