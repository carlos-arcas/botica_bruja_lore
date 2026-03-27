import Link from "next/link";

import {
  BOTICA_NATURAL_PUBLICA,
  construirHrefSeccionPublicaVisible,
} from "@/componentes/botica-natural/contratoSeccionPublica";

export default function NoEncontradoProductoBoticaNatural(): JSX.Element {
  return (
    <main className="contenedor-home">
      <section className="bloque-home bloque-home--vacio">
        <h1>Producto no encontrado</h1>
        <p>El producto solicitado no existe o no esta publicado en {BOTICA_NATURAL_PUBLICA.nombre}.</p>
        <Link href={construirHrefSeccionPublicaVisible(BOTICA_NATURAL_PUBLICA.slug)} className="boton boton--secundario">
          Volver a {BOTICA_NATURAL_PUBLICA.nombre}
        </Link>
      </section>
    </main>
  );
}
