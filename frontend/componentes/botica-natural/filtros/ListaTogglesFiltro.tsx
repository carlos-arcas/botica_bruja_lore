import { SeccionMostrarMas } from "./SeccionMostrarMas";
import { ToggleFiltro } from "./ToggleFiltro";
import { debeMostrarControlMostrarMas, obtenerOpcionesVisibles } from "./estadoVisualFiltros";

type Opcion = { valor: string; etiqueta: string };

type Props = {
  nombreGrupo: string;
  opciones: Opcion[];
  valorActivo: string;
  mostrarTodas: boolean;
  onCambiarMostrarTodas: () => void;
  onSeleccionar: (valor: string) => void;
};

export function ListaTogglesFiltro({
  nombreGrupo,
  opciones,
  valorActivo,
  mostrarTodas,
  onCambiarMostrarTodas,
  onSeleccionar,
}: Props): JSX.Element {
  const debeMostrarControl = debeMostrarControlMostrarMas(opciones);
  const opcionesVisibles = obtenerOpcionesVisibles(opciones, mostrarTodas);

  return (
    <>
      <ul className="botica-natural__lista-toggles">
        {opcionesVisibles.map((opcion) => (
          <ToggleFiltro
            key={opcion.valor}
            nombreGrupo={nombreGrupo}
            valor={opcion.valor}
            etiqueta={opcion.etiqueta}
            activo={valorActivo === opcion.valor}
            onSeleccionar={onSeleccionar}
          />
        ))}
      </ul>
      {debeMostrarControl && <SeccionMostrarMas expandido={mostrarTodas} onToggle={onCambiarMostrarTodas} />}
    </>
  );
}
