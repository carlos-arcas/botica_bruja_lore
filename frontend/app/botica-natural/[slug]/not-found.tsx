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
        <p>No encontramos este producto publicado. Puedes volver a la seccion o pedir orientacion si buscabas una preparacion concreta.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/botica-natural" className="boton boton--principal">
            Volver a Botica Natural
          </Link>
          <Link href="/encargo?origen=consulta" className="boton boton--secundario">
            Consulta personalizada
          </Link>
        </div>
      </section>
    </main>
  );
}
