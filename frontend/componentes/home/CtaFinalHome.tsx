import Link from "next/link";

import { CTA_FINAL } from "@/contenido/home/contenidoHome";

export function CtaFinalHome(): JSX.Element {
  return (
    <section className="bloque-home cta-final-home" aria-labelledby="titulo-cta-final">
      <h2 id="titulo-cta-final">{CTA_FINAL.titulo}</h2>
      <p>{CTA_FINAL.descripcion}</p>
      <Link href={CTA_FINAL.cta.href} className="boton boton--principal">
        {CTA_FINAL.cta.texto}
      </Link>
    </section>
  );
}
