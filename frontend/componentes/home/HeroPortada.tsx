import Link from "next/link";
import Image from "next/image";

import { HERO_HOME } from "@/contenido/home/contenidoHome";
import { SEO_HOME } from "@/contenido/home/seoHome";
import { CONFIGURACION_IMAGEN_HERO } from "@/componentes/home/configuracionImagenHero";

export function HeroPortada(): JSX.Element {
  return (
    <section className="hero-portada hero-portada--con-fondo" aria-labelledby="titulo-home">
      <Image
        src={CONFIGURACION_IMAGEN_HERO.src}
        alt={CONFIGURACION_IMAGEN_HERO.alt}
        fill
        priority
        fetchPriority="high"
        sizes={CONFIGURACION_IMAGEN_HERO.sizes}
        className="hero-portada__imagen"
      />
      <div className="hero-portada__contenido">
        <p className="hero-portada__eyebrow">{HERO_HOME.etiqueta}</p>
        <h1 id="titulo-home">{SEO_HOME.h1}</h1>
        <p>{HERO_HOME.descripcion}</p>
        <div className="hero-portada__acciones">
          <Link href={HERO_HOME.ctaPrimaria.href} className="boton boton--principal">
            {HERO_HOME.ctaPrimaria.texto}
          </Link>
          <Link href={HERO_HOME.ctaSecundaria.href} className="boton boton--secundario boton--secundario-claro">
            {HERO_HOME.ctaSecundaria.texto}
          </Link>
        </div>
        <p className="hero-portada__nota">{HERO_HOME.nota}</p>
      </div>
    </section>
  );
}
