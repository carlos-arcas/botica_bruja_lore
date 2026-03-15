import Link from "next/link";

export default function NoEncontradoProductoBoticaNatural(): JSX.Element {
  return (
    <main className="contenedor-home">
      <section className="bloque-home bloque-home--vacio">
        <h1>Producto no encontrado</h1>
        <p>El producto solicitado no existe o no está publicado en Botica Natural.</p>
        <Link href="/botica-natural" className="boton boton--secundario">
          Volver a Botica Natural
        </Link>
      </section>
    </main>
  );
}
