import Image from "next/image";
import Link from "next/link";

import { CONFIGURACION_IMAGEN_CARD_HOME } from "@/componentes/home/configuracionImagenCardHome";
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
            width={CONFIGURACION_IMAGEN_CARD_HOME.width}
            height={CONFIGURACION_IMAGEN_CARD_HOME.height}
            sizes={CONFIGURACION_IMAGEN_CARD_HOME.sizes}
            className="tarjeta-seccion-principal__imagen"
          />
        </span>
        <span className="tarjeta-seccion-principal__titulo">{titulo}</span>
      </Link>
    </li>
  );
}
