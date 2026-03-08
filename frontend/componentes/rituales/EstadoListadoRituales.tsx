type Props = {
  mensaje: string;
};

export function EstadoErrorListadoRituales({ mensaje }: Props): JSX.Element {
  return (
    <section className="bloque-home bloque-home--error">
      <h2>No se pudo cargar el listado ritual</h2>
      <p>{mensaje}</p>
    </section>
  );
}

export function EstadoVacioListadoRituales(): JSX.Element {
  return (
    <section className="bloque-home bloque-home--vacio">
      <h2>Aún no hay rituales públicos</h2>
      <p>
        Estamos preparando la primera capa ritual conectada. Puedes entrar por la línea herbal
        mientras publicamos nuevos rituales.
      </p>
    </section>
  );
}
