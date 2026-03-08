import Link from "next/link";

type Props = {
  mensaje: string;
};

export function EstadoErrorFichaRitual({ mensaje }: Props): JSX.Element {
  return (
    <section className="bloque-home bloque-home--error">
      <h2>No se pudo cargar la ficha ritual</h2>
      <p>{mensaje}</p>
      <Link href="/rituales" className="boton boton--secundario">
        Volver al listado ritual
      </Link>
    </section>
  );
}
