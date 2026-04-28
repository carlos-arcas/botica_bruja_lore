type Props = {
  mensaje: string;
};

export function EstadoConexionHerbal({ mensaje }: Props): JSX.Element {
  return (
    <section id="linea-herbal" className="bloque-home bloque-home--error">
      <h2>Línea herbal temporalmente no disponible</h2>
      <p>{mensaje}</p>
      <p>Estamos revisando la conexión del catálogo. Vuelve a intentarlo en unos minutos.</p>
    </section>
  );
}
