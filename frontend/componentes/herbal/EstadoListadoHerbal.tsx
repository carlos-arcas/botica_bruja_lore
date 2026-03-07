type Props = {
  mensaje: string;
};

export function EstadoErrorListadoHerbal({ mensaje }: Props): JSX.Element {
  return (
    <section className="bloque-home bloque-home--error">
      <h2>No se pudo cargar la línea herbal</h2>
      <p>{mensaje}</p>
    </section>
  );
}

export function EstadoVacioListadoHerbal(): JSX.Element {
  return (
    <section className="bloque-home bloque-home--vacio">
      <h2>Aún no hay plantas públicas</h2>
      <p>
        Estamos preparando la primera selección herbal navegable. Vuelve pronto para explorar
        nuevas fichas.
      </p>
    </section>
  );
}
