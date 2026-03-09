import Link from "next/link";

export default function NoEncontradoColeccion(): JSX.Element {
  return (
    <main className="contenedor-home">
      <section className="bloque-home bloque-home--vacio">
        <h1>Ficha de colección no encontrada</h1>
        <p>
          La pieza que buscas no está publicada en el catálogo actual. Puedes volver a colecciones para seguir explorando.
        </p>
        <Link href="/colecciones" className="boton boton--secundario">
          Volver a colecciones
        </Link>
      </section>
    </main>
  );
}
