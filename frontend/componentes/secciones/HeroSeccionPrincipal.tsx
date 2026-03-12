import Image from "next/image";

import { CONFIGURACION_HERO_SECCION } from "@/componentes/secciones/configuracionHeroSeccion";
import type { IdSeccionPrincipal } from "@/contenido/home/seccionesPrincipales";
import { obtenerSeccionPrincipalPorId, traducirSeccionPrincipal } from "@/contenido/home/seccionesPrincipales";

type Props = {
  idSeccion: IdSeccionPrincipal;
};

export function HeroSeccionPrincipal({ idSeccion }: Props): JSX.Element {
  const seccion = obtenerSeccionPrincipalPorId(idSeccion);
  const titulo = traducirSeccionPrincipal(seccion.claveI18nTitulo);

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
      <div className="hero-portada__overlay" />
      <div className="hero-portada__contenido">
        <p className="hero-portada__eyebrow">Sección principal</p>
        <h1 id="titulo-seccion-principal">{titulo}</h1>
      </div>
    </section>
  );
}
