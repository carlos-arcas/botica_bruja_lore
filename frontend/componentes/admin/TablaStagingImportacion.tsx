import { DragEvent } from "react";

import { FilaImportacion } from "@/infraestructura/api/backoffice";

type Props = {
  detalleId: number;
  filas: FilaImportacion[];
  onSeleccionar: (fila: FilaImportacion) => void;
  onAdjuntar: (fila: FilaImportacion, archivo?: File) => void;
  onEliminarImagen: (fila: FilaImportacion) => void;
  onDescartar: (fila: FilaImportacion) => void;
};

function DropImagen({ fila, onAdjuntar }: { fila: FilaImportacion; onAdjuntar: (fila: FilaImportacion, archivo?: File) => void }): JSX.Element {
  const onDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    onAdjuntar(fila, event.dataTransfer.files?.[0]);
  };

  return (
    <label className="admin-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
      <span>Adjuntar/Reemplazar imagen</span>
      <input type="file" accept="image/*" onChange={(event) => onAdjuntar(fila, event.target.files?.[0])} />
    </label>
  );
}

export function TablaStagingImportacion({ detalleId, filas, onSeleccionar, onAdjuntar, onEliminarImagen, onDescartar }: Props): JSX.Element {
  return (
    <div className="admin-bloque admin-importacion-contextual">
      <h4>Staging por filas</h4>
      <p>Lote #{detalleId} · Seleccionadas: {filas.filter((fila) => fila.seleccionado).length}</p>
      <table className="admin-tabla">
        <thead><tr><th>Fila</th><th>Imagen</th><th>Estado imagen</th><th>Acciones</th></tr></thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={fila.id}>
              <td>
                <label><input type="checkbox" checked={fila.seleccionado} onChange={() => onSeleccionar(fila)} /> #{fila.numero}</label>
                <p>{fila.estado}</p>
                {fila.errores.map((e) => <p key={e} className="admin-estado admin-estado--error">{e}</p>)}
              </td>
              <td>{fila.imagen ? <a href={fila.imagen} target="_blank" rel="noreferrer">Preview imagen</a> : "Sin imagen"}</td>
              <td>{fila.estado_imagen}</td>
              <td>
                <DropImagen fila={fila} onAdjuntar={onAdjuntar} />
                <button type="button" className="admin-boton admin-boton--secundario" onClick={() => onEliminarImagen(fila)}>Eliminar imagen</button>{" "}
                <button type="button" className="admin-boton admin-boton--peligro" onClick={() => onDescartar(fila)}>Descartar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
