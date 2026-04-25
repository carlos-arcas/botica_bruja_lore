import Link from "next/link";

import {
  MINERALES_Y_ENERGIA_PUBLICA,
  construirHrefSeccionPublicaVisible,
} from "@/componentes/botica-natural/contratoSeccionPublica";

export default function NoEncontradoProductoMineralesYEnergia(): JSX.Element {
  return (
    <main className="contenedor-home">
      <section className="bloque-home bloque-home--vacio">
        <h1>Producto no encontrado</h1>
        <p>
          El producto solicitado no existe o no esta publicado en{" "}
          {MINERALES_Y_ENERGIA_PUBLICA.nombre}.
        </p>
        <Link
          href={construirHrefSeccionPublicaVisible(MINERALES_Y_ENERGIA_PUBLICA.slug)}
          className="boton boton--secundario"
        >
          Volver a {MINERALES_Y_ENERGIA_PUBLICA.nombre}
        </Link>
      </section>
    </main>
  );
}
