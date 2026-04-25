import Link from "next/link";

import {
  VELAS_E_INCIENSO_PUBLICA,
  construirHrefSeccionPublicaVisible,
} from "@/componentes/botica-natural/contratoSeccionPublica";

export default function NoEncontradoProductoVelasEIncienso(): JSX.Element {
  return (
    <main className="contenedor-home">
      <section className="bloque-home bloque-home--vacio">
        <h1>Producto no encontrado</h1>
        <p>
          El producto solicitado no existe o no esta publicado en{" "}
          {VELAS_E_INCIENSO_PUBLICA.nombre}.
        </p>
        <Link
          href={construirHrefSeccionPublicaVisible(VELAS_E_INCIENSO_PUBLICA.slug)}
          className="boton boton--secundario"
        >
          Volver a {VELAS_E_INCIENSO_PUBLICA.nombre}
        </Link>
      </section>
    </main>
  );
}
