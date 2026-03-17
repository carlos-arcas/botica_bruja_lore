import type { ReactNode } from "react";

type Props = {
  id: string;
  titulo: string;
  expandido: boolean;
  contadorSeleccionados?: number;
  onToggle: () => void;
  children: ReactNode;
};

export function AcordeonFiltro({ id, titulo, expandido, contadorSeleccionados = 0, onToggle, children }: Props): JSX.Element {
  const panelId = `${id}-panel`;
  const botonId = `${id}-boton`;

  return (
    <section className="botica-natural__acordeon-filtro">
      <h3>
        <button
          id={botonId}
          type="button"
          className="botica-natural__acordeon-boton"
          aria-expanded={expandido}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>{titulo}</span>
          <span className="botica-natural__acordeon-resumen">
            {contadorSeleccionados > 0 && <strong>{contadorSeleccionados} seleccionada(s)</strong>}
            <span aria-hidden="true">{expandido ? "−" : "+"}</span>
          </span>
        </button>
      </h3>
      <div id={panelId} role="region" aria-labelledby={botonId} hidden={!expandido}>
        {children}
      </div>
    </section>
  );
}
