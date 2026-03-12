import Image from "next/image";

import { CONFIGURACION_HERO_SECCION } from "@/componentes/secciones/configuracionHeroSeccion";
import type { IdSeccionPrincipal } from "@/contenido/home/seccionesPrincipales";
import { obtenerSeccionPrincipalPorId, traducirSeccionPrincipal } from "@/contenido/home/seccionesPrincipales";

type Props = {
  idSeccion: IdSeccionPrincipal;
  nivelTitulo?: "h1" | "h2";
};

export function HeroSeccionPrincipal({ idSeccion, nivelTitulo = "h1" }: Props): JSX.Element {
  const seccion = obtenerSeccionPrincipalPorId(idSeccion);
  const titulo = traducirSeccionPrincipal(seccion.claveI18nTitulo);
  const TituloHero = nivelTitulo;

  return (
    <section className="hero-portada hero-portada--con-fondo" aria-labelledby="titulo-seccion-principal">
      <Image
        src={seccion.imagenHero}
        alt={titulo}
        width={CONFIGURACION_HERO_SECCION.width}
        height={CONFIGURACION_HERO_SECCION.height}
        priority
        sizes={CONFIGURACION_HERO_SECCION.sizes}
        className="hero-portada__imagen"
      />
      <div className="hero-portada__contenido">
        <p className="hero-portada__eyebrow">Sección principal</p>
        <TituloHero id="titulo-seccion-principal">{titulo}</TituloHero>
      </div>
    </section>
  );
}
