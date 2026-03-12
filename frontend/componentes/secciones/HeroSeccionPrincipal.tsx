import Image from "next/image";

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
        fill
        priority
        sizes="100vw"
        className="hero-portada__imagen"
        style={{ objectPosition: seccion.heroPosition }}
      />
      <div className="hero-portada__overlay" />
      <div className="hero-portada__contenido">
        <p className="hero-portada__eyebrow">Sección principal</p>
        <h1 id="titulo-seccion-principal">{titulo}</h1>
      </div>
    </section>
  );
}
