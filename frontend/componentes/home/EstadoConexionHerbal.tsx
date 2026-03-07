type Props = {
  mensaje: string;
};

export function EstadoConexionHerbal({ mensaje }: Props): JSX.Element {
  return (
    <section id="linea-herbal" className="bloque-home bloque-home--error">
      <h2>Línea herbal temporalmente no disponible</h2>
      <p>{mensaje}</p>
      <p>
        Comprueba que el backend Django esté activo y que <code>NEXT_PUBLIC_API_BASE_URL</code>
        apunte al host correcto.
      </p>
    </section>
  );
}
