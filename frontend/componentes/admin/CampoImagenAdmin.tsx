"use client";

import { DragEvent, useMemo, useRef } from "react";

type EstadoCarga = "idle" | "subiendo" | "ok" | "error";

type Props = {
  etiqueta: string;
  imagenUrl: string;
  estado: EstadoCarga;
  mensaje: string;
  onSubirArchivo: (archivo: File) => void;
  onQuitarImagen: () => void;
};

const TIPOS_ACEPTADOS = ["image/webp", "image/png", "image/jpeg"];

function leerArchivoDrop(event: DragEvent<HTMLDivElement>): File | null {
  const archivo = event.dataTransfer.files?.[0];
  if (!archivo) return null;
  return archivo;
}

export function CampoImagenAdmin({ etiqueta, imagenUrl, estado, mensaje, onSubirArchivo, onQuitarImagen }: Props): JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const descripcionEstado = useMemo(() => {
    if (estado === "subiendo") return "Subiendo imagen...";
    if (estado === "ok") return "Imagen subida correctamente.";
    if (estado === "error") return mensaje;
    if (imagenUrl) return "Imagen lista para guardar.";
    return "Sin imagen cargada.";
  }, [estado, mensaje, imagenUrl]);

  const abrirSelector = () => inputRef.current?.click();

  const onArchivoSeleccionado = (archivo?: File) => {
    if (!archivo) return;
    onSubirArchivo(archivo);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="admin-campo-imagen" aria-live="polite">
      <span>{etiqueta}</span>
      <div
        className="admin-dropzone-imagen"
        role="button"
        tabIndex={0}
        onClick={abrirSelector}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            abrirSelector();
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onArchivoSeleccionado(leerArchivoDrop(event) ?? undefined);
        }}
      >
        <p>Arrastra una imagen aquí</p>
        <p>o selecciónala desde tu PC</p>
        <button type="button" className="admin-boton admin-boton--secundario" onClick={(event) => { event.stopPropagation(); abrirSelector(); }}>
          Seleccionar imagen
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={TIPOS_ACEPTADOS.join(",")}
          className="admin-input-oculto"
          onChange={(event) => onArchivoSeleccionado(event.target.files?.[0])}
        />
      </div>
      {imagenUrl ? <img src={imagenUrl} alt="Vista previa de imagen" className="admin-preview-imagen" /> : null}
      <div className="admin-acciones-imagen">
        <button type="button" className="admin-boton admin-boton--secundario" onClick={abrirSelector}>
          Reemplazar
        </button>
        <button type="button" className="admin-boton admin-boton--peligro" onClick={onQuitarImagen} disabled={!imagenUrl && estado !== "error"}>
          Quitar
        </button>
      </div>
      <small className={estado === "error" ? "admin-mensaje-error" : ""}>{descripcionEstado}</small>
    </div>
  );
}
