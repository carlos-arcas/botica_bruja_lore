import Link from "next/link";

export default function NoEncontradoRitual(): JSX.Element {
  return (
    <main className="contenedor-home">
      <section className="bloque-home bloque-home--vacio">
        <h1>Ficha ritual no encontrada</h1>
        <p>El ritual solicitado no está publicado o no existe en la API pública ritual.</p>
        <Link href="/rituales" className="boton boton--secundario">
          Volver al listado ritual
        </Link>
      </section>
    </main>
  );
}
