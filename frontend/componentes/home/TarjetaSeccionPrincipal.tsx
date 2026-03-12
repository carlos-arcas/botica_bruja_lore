import Image from "next/image";
import Link from "next/link";

import type { SeccionPrincipal } from "@/contenido/home/seccionesPrincipales";
import { traducirSeccionPrincipal } from "@/contenido/home/seccionesPrincipales";

type Props = {
  seccion: SeccionPrincipal;
};

export function TarjetaSeccionPrincipal({ seccion }: Props): JSX.Element {
  const titulo = traducirSeccionPrincipal(seccion.claveI18nTitulo);

  return (
    <li className="tarjeta-seccion-principal__item">
      <Link href={seccion.ruta} className="tarjeta-seccion-principal" aria-label={titulo}>
        <span className="tarjeta-seccion-principal__media">
          <Image
            src={seccion.imagenCard}
            alt={titulo}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
            className="tarjeta-seccion-principal__imagen"
          />
          <span className="tarjeta-seccion-principal__overlay" />
        </span>
        <span className="tarjeta-seccion-principal__titulo">{titulo}</span>
      </Link>
    </li>
  );
}
