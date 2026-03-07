import Link from "next/link";

export default function NoEncontradoPlanta(): JSX.Element {
  return (
    <main className="contenedor-home">
      <section className="bloque-home bloque-home--vacio">
        <h1>Ficha herbal no encontrada</h1>
        <p>
          La planta solicitada no está publicada o no existe en la API pública del núcleo herbal.
        </p>
        <Link href="/hierbas" className="boton boton--secundario">
          Volver al listado herbal
        </Link>
      </section>
    </main>
  );
}
