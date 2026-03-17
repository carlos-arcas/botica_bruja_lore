type Props = {
  expandido: boolean;
  onToggle: () => void;
};

export function SeccionMostrarMas({ expandido, onToggle }: Props): JSX.Element {
  return (
    <button type="button" className="botica-natural__mostrar-mas" onClick={onToggle}>
      {expandido ? "Mostrar menos" : "Mostrar más"}
    </button>
  );
}
