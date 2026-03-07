const INTENCIONES_BASE = [
  {
    nombre: "Calma",
    descripcion: "Plantas aromáticas para momentos de pausa y respiración consciente.",
  },
  {
    nombre: "Enfoque",
    descripcion: "Selecciones herbales para rituales cotidianos de concentración y claridad.",
  },
  {
    nombre: "Descanso",
    descripcion: "Rutas suaves para preparar la noche con acompañamiento editorial sereno.",
  },
];

export function DescubrimientoIntencion(): JSX.Element {
  return (
    <section id="descubrimiento-intencion" className="bloque-home">
      <h2>Descubrimiento guiado por intención</h2>
      <p>
        La intención funciona como eje de exploración: traduce una necesidad cotidiana en plantas
        navegables, combinaciones sugeridas y contexto editorial útil.
      </p>
      <ul className="rejilla-intenciones">
        {INTENCIONES_BASE.map((intencion) => (
          <li key={intencion.nombre}>
            <h3>{intencion.nombre}</h3>
            <p>{intencion.descripcion}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
