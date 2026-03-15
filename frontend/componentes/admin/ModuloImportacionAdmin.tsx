"use client";

import { ChangeEvent, DragEvent, FormEvent, useMemo, useState } from "react";

import {
  adjuntarImagenFilaImportacion,
  cambiarSeleccionFilaImportacion,
  confirmarLoteImportacion,
  crearLoteImportacion,
  descartarFilaImportacion,
  descargarExportacionAdmin,
  DetalleImportacion,
  eliminarImagenFilaImportacion,
  FilaImportacion,
  obtenerLoteImportacion,
  revalidarLoteImportacion,
} from "@/infraestructura/api/backoffice";

type EntidadImportacion = "productos" | "rituales" | "articulos_editoriales" | "secciones_publicas";

export function ModuloImportacionAdmin({ token }: { token?: string }): JSX.Element {
  const [entidad, setEntidad] = useState<EntidadImportacion>("productos");
  const [loteId, setLoteId] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<DetalleImportacion | null>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const filasSeleccionadas = useMemo(() => detalle?.filas.filter((f) => f.seleccionado).length ?? 0, [detalle]);

  const subir = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      const id = await crearLoteImportacion(formData, token);
      await refrescarDetalle(id);
      setLoteId(id);
      setOk("Lote validado en staging.");
    } catch {
      setError("No se pudo crear el lote de importación.");
    }
  };

  const refrescarDetalle = async (id: number) => {
    const data = await obtenerLoteImportacion(id, token);
    setDetalle(data);
  };

  const confirmar = async () => {
    if (!loteId || !detalle) return;
    const ids = detalle.filas.filter((f) => f.seleccionado).map((f) => Number(f.id));
    try {
      const confirmadas = await confirmarLoteImportacion(loteId, ids, token);
      setOk(`Confirmadas: ${confirmadas}`);
      await refrescarDetalle(loteId);
    } catch {
      setError("No se pudo confirmar el lote.");
    }
  };

  const revalidar = async () => {
    if (!loteId) return;
    try {
      await revalidarLoteImportacion(loteId, token);
      await refrescarDetalle(loteId);
      setOk("Lote revalidado.");
    } catch {
      setError("No se pudo revalidar el lote.");
    }
  };

  const actualizarFila = (actualizada: FilaImportacion) => {
    if (!detalle) return;
    setDetalle({ ...detalle, filas: detalle.filas.map((fila) => (fila.id === actualizada.id ? actualizada : fila)) });
  };

  const cambiarSeleccion = async (fila: FilaImportacion) => {
    if (!loteId) return;
    try {
      actualizarFila(await cambiarSeleccionFilaImportacion(loteId, fila.id, !fila.seleccionado, token));
    } catch {
      setError("No se pudo cambiar la selección.");
    }
  };

  const descartar = async (fila: FilaImportacion) => {
    if (!loteId) return;
    try {
      actualizarFila(await descartarFilaImportacion(loteId, fila.id, token));
      setOk(`Fila ${fila.numero} descartada.`);
    } catch {
      setError("No se pudo descartar la fila.");
    }
  };

  const subirImagen = async (fila: FilaImportacion, archivo?: File) => {
    if (!loteId || !archivo) return;
    try {
      actualizarFila(await adjuntarImagenFilaImportacion(loteId, fila.id, archivo, token));
      setOk(`Imagen WebP guardada para fila ${fila.numero}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo adjuntar imagen.");
    }
  };

  const onInputImagen = (fila: FilaImportacion, event: ChangeEvent<HTMLInputElement>) => {
    void subirImagen(fila, event.target.files?.[0]);
  };

  const onDropImagen = (fila: FilaImportacion, event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    void subirImagen(fila, event.dataTransfer.files?.[0]);
  };

  const eliminarImagen = async (fila: FilaImportacion) => {
    if (!loteId) return;
    try {
      actualizarFila(await eliminarImagenFilaImportacion(loteId, fila.id, token));
      setOk(`Imagen eliminada de fila ${fila.numero}.`);
    } catch {
      setError("No se pudo eliminar imagen.");
    }
  };

  const descargarPlantilla = async (formato: "csv" | "xlsx") => {
    await descargar("plantilla", formato);
  };

  const descargar = async (tipo: "plantilla" | "inventario", formato: "csv" | "xlsx") => {
    const mod = entidad === "articulos_editoriales" ? "editorial" : entidad === "secciones_publicas" ? "secciones" : entidad;
    try {
      const blob = await descargarExportacionAdmin(mod, tipo, formato, token);
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `${mod}-${tipo}.${formato}`;
      enlace.click();
      URL.revokeObjectURL(url);
      setOk(`Exportación ${tipo} ${formato.toUpperCase()} lista.`);
    } catch {
      setError("No se pudo exportar.");
    }
  };

  return (
    <section className="admin-contenido">
      <p className="admin-breadcrumb">Admin / Importación</p>
      <div className="admin-resumen"><h2>Importación CSV/XLSX</h2></div>
      <form onSubmit={subir} className="admin-filtros">
        <select name="entidad" value={entidad} onChange={(e) => setEntidad(e.target.value as EntidadImportacion)}>
          <option value="productos">Productos</option>
          <option value="rituales">Rituales</option>
          <option value="articulos_editoriales">Artículos</option>
          <option value="secciones_publicas">Categorías de catálogo</option>
        </select>
        <select name="modo" defaultValue="crear_actualizar"><option value="solo_crear">Solo crear</option><option value="crear_actualizar">Crear o actualizar</option></select>
        <input type="file" name="archivo" accept=".csv,.xlsx" required />
        <button type="submit">Validar archivo</button>
      </form>

      <div className="admin-acciones-export" style={{ marginTop: 10 }}>
        <button type="button" onClick={() => descargarPlantilla("csv")}>Descargar plantilla CSV</button>
        <button type="button" onClick={() => descargarPlantilla("xlsx")}>Descargar plantilla XLSX</button>
        <button type="button" onClick={() => descargar("inventario", "csv")}>Exportar inventario CSV</button>
        <button type="button" onClick={() => descargar("inventario", "xlsx")}>Exportar inventario XLSX</button>
      </div>

      {ok ? <p className="admin-estado">{ok}</p> : null}
      {error ? <p className="admin-estado admin-estado--error">{error}</p> : null}

      {detalle ? (
        <div className="admin-bloque" style={{ marginTop: 16 }}>
          <p>Lote #{String(detalle.lote.id)} · Seleccionadas: {filasSeleccionadas}</p>
          <div className="admin-filtros">
            <button type="button" onClick={confirmar}>Confirmar filas seleccionadas</button>
            <button type="button" onClick={revalidar}>Revalidar lote</button>
          </div>
          <table className="admin-tabla">
            <thead><tr><th>Fila</th><th>Preview</th><th>Estado imagen</th><th>Acciones</th></tr></thead>
            <tbody>
              {detalle.filas.map((fila) => (
                <tr key={fila.id}>
                  <td>
                    <label><input type="checkbox" checked={fila.seleccionado} onChange={() => cambiarSeleccion(fila)} /> #{fila.numero}</label>
                    <p>{fila.estado}</p>
                    {fila.errores.map((e) => <p key={e} className="admin-estado admin-estado--error">{e}</p>)}
                    {fila.warnings.map((w) => <p key={w} className="admin-estado">{w}</p>)}
                  </td>
                  <td>{fila.imagen ? <a href={fila.imagen} target="_blank">Preview imagen</a> : "Sin imagen"}</td>
                  <td>{fila.estado_imagen}</td>
                  <td>
                    <label className="admin-dropzone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDropImagen(fila, e)}>
                      <span>Arrastra imagen o selecciona</span>
                      <input type="file" accept="image/*" onChange={(e) => onInputImagen(fila, e)} />
                    </label>
                    <button type="button" onClick={() => eliminarImagen(fila)}>Eliminar imagen</button>{" "}
                    <button type="button" onClick={() => descartar(fila)}>Descartar fila</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
