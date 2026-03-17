type Props = {
  nombreGrupo: string;
  valor: string;
  etiqueta: string;
  activo: boolean;
  onSeleccionar: (valor: string) => void;
};

export function ToggleFiltro({ nombreGrupo, valor, etiqueta, activo, onSeleccionar }: Props): JSX.Element {
  const id = `${nombreGrupo}-${valor}`;

  return (
    <li>
      <input
        id={id}
        className="botica-natural__toggle-input"
        type="radio"
        name={nombreGrupo}
        value={valor}
        checked={activo}
        onChange={() => onSeleccionar(valor)}
      />
      <label className="botica-natural__toggle-etiqueta" htmlFor={id}>
        {etiqueta}
      </label>
    </li>
  );
}
