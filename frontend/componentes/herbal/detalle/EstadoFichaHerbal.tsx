import Link from "next/link";

type Props = {
  mensaje: string;
};

export function EstadoErrorFichaHerbal({ mensaje }: Props): JSX.Element {
  return (
    <section className="bloque-home bloque-home--error">
      <h2>No se pudo cargar la ficha herbal</h2>
      <p>{mensaje}</p>
      <Link href="/hierbas" className="boton boton--secundario">
        Volver al listado
      </Link>
    </section>
  );
}
