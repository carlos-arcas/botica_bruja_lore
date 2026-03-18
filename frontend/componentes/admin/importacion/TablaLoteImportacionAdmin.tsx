import { DragEvent } from "react";

import { FilaImportacion } from "@/infraestructura/api/backoffice";

type Props = {
  filas: FilaImportacion[];
  bloqueado: boolean;
  onSeleccionar: (fila: FilaImportacion) => void;
  onAdjuntar: (fila: FilaImportacion, archivo?: File) => void;
  onEliminarImagen: (fila: FilaImportacion) => void;
  onDescartar: (fila: FilaImportacion) => void;
};

function DropImagen({ fila, bloqueado, onAdjuntar }: { fila: FilaImportacion; bloqueado: boolean; onAdjuntar: Props["onAdjuntar"] }): JSX.Element {
  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    onAdjuntar(fila, event.dataTransfer.files?.[0]);
  };

  return (
    <label className="admin-dropzone-imagen" onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
      <span>Adjuntar o reemplazar imagen</span>
      <input disabled={bloqueado} type="file" accept="image/*" onChange={(event) => onAdjuntar(fila, event.target.files?.[0])} />
    </label>
  );
}

export function TablaLoteImportacionAdmin({ filas, bloqueado, onSeleccionar, onAdjuntar, onEliminarImagen, onDescartar }: Props): JSX.Element {
  return (
    <table className="admin-tabla">
      <thead>
        <tr><th>Fila</th><th>Resumen</th><th>Imagen</th><th>Resultado</th><th>Acciones</th></tr>
      </thead>
      <tbody>
        {filas.map((fila) => (
          <tr key={fila.id}>
            <td>
              <label><input disabled={bloqueado || fila.estado === "confirmada"} type="checkbox" checked={fila.seleccionado} onChange={() => onSeleccionar(fila)} /> #{fila.numero}</label>
              <p>{fila.identificador} · {fila.titulo}</p>
              <p>{fila.tipo}</p>
            </td>
            <td>
              <p>{fila.resumen_datos}</p>
              {fila.errores.map((error) => <p key={error} className="admin-estado admin-estado--error">{error}</p>)}
              {fila.warnings.map((warning) => <p key={warning} className="admin-estado">{warning}</p>)}
            </td>
            <td>
              <p>{fila.imagen ? <a href={fila.imagen} target="_blank" rel="noreferrer">Ver imagen</a> : "Sin imagen"}</p>
              <p>Estado imagen: {fila.estado_imagen}</p>
            </td>
            <td>
              <p>Estado fila: {fila.estado}</p>
              <p>{fila.resultado_confirmacion || "Pendiente de confirmar"}</p>
            </td>
            <td>
              <DropImagen fila={fila} bloqueado={bloqueado || fila.estado === "confirmada"} onAdjuntar={onAdjuntar} />
              <button type="button" className="admin-boton admin-boton--secundario" disabled={bloqueado || !fila.imagen || fila.estado === "confirmada"} onClick={() => onEliminarImagen(fila)}>Quitar imagen</button>{" "}
              <button type="button" className="admin-boton admin-boton--peligro" disabled={bloqueado || fila.estado === "confirmada" || fila.estado === "descartada"} onClick={() => onDescartar(fila)}>Descartar fila</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
