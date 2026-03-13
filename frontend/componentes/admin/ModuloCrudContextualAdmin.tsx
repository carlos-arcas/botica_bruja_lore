"use client";
import { ChangeEvent, DragEvent, FormEvent, useMemo, useState } from "react";
import {
  adjuntarImagenFilaImportacion,
  cambiarPublicacionAdmin,
  cambiarSeleccionFilaImportacion,
  confirmarLoteImportacion,
  crearLoteImportacion,
  descartarFilaImportacion,
  descargarExportacionAdmin,
  eliminarImagenFilaImportacion,
  FilaImportacion,
  guardarRegistroAdmin,
  ModuloAdmin,
  obtenerLoteImportacion,
  revalidarLoteImportacion,
} from "@/infraestructura/api/backoffice";
type ConfigCampo = { clave: string; etiqueta: string; tipo?: "text" | "textarea" | "checkbox" };
type Props = {
  modulo: ModuloAdmin;
  titulo: string;
  token?: string;
  itemsIniciales: Record<string, unknown>[];
  campoEstado: "publicado" | "publicada";
  entidadImportacion: "productos" | "rituales" | "articulos_editoriales" | "secciones_publicas";
  camposComunes: ConfigCampo[];
  construirPayload: (form: Record<string, unknown>) => Record<string, unknown>;
  camposEspecificos?: ConfigCampo[];
  seccionSeleccionada?: string;
};
type DetalleLote = { lote: Record<string, unknown>; filas: FilaImportacion[] };
export function ModuloCrudContextualAdmin({
  modulo,
  titulo,
  token,
  itemsIniciales,
  campoEstado,
  entidadImportacion,
  camposComunes,
  camposEspecificos = [],
  construirPayload,
  seccionSeleccionada = "",
}: Props): JSX.Element {
  const [items, setItems] = useState(itemsIniciales);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [filtro, setFiltro] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [detalle, setDetalle] = useState<DetalleLote | null>(null);
  const campos = useMemo(() => [...camposComunes, ...camposEspecificos], [camposComunes, camposEspecificos]);
  const filasSeleccionadas = useMemo(() => detalle?.filas.filter((fila) => fila.seleccionado).length ?? 0, [detalle]);
  const filtrados = items.filter((item) => JSON.stringify(item).toLowerCase().includes(filtro.toLowerCase()));
  const editar = (item: Record<string, unknown>) => {
    setForm({ ...item });
    setError("");
    setOk("Edición cargada.");
  };
  const actualizarFila = (actualizada: FilaImportacion) => {
    if (!detalle) return;
    setDetalle({ ...detalle, filas: detalle.filas.map((fila) => (fila.id === actualizada.id ? actualizada : fila)) });
  };
  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const guardado = await guardarRegistroAdmin(modulo, construirPayload(form), token);
      const id = guardado.id;
      const existe = items.some((it) => it.id === id);
      setItems(existe ? items.map((it) => (it.id === id ? guardado : it)) : [guardado, ...items]);
      setForm({});
      setOk("Registro guardado.");
      setError("");
    } catch {
      setError("No se pudo guardar el registro.");
    }
  };
  const publicar = async (id: string | number, publicado: boolean) => {
    try {
      const actualizado = await cambiarPublicacionAdmin(modulo, id, publicado, token);
      setItems(items.map((it) => (it.id === id ? actualizado : it)));
      setOk(publicado ? "Registro publicado." : "Registro despublicado.");
    } catch {
      setError("No se pudo actualizar publicación.");
    }
  };
  const onArchivo = async (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    const formData = new FormData();
    formData.set("entidad", entidadImportacion);
    formData.set("modo", "crear_actualizar");
    if (seccionSeleccionada) formData.set("seccion", seccionSeleccionada);
    formData.set("archivo", archivo);
    try {
      const id = await crearLoteImportacion(formData, token);
      setDetalle(await obtenerLoteImportacion(id, token));
      setOk("Lote validado en staging.");
    } catch {
      setError("No se pudo crear el lote de importación.");
    }
  };
  const confirmar = async () => {
    if (!detalle) return;
    const loteId = Number(detalle.lote.id);
    const ids = detalle.filas.filter((fila) => fila.seleccionado).map((fila) => Number(fila.id));
    try {
      const confirmadas = await confirmarLoteImportacion(loteId, ids, token);
      setOk(`Confirmadas: ${confirmadas}`);
      setDetalle(await obtenerLoteImportacion(loteId, token));
    } catch {
      setError("No se pudo confirmar el lote.");
    }
  };
  const revalidar = async () => {
    if (!detalle) return;
    const loteId = Number(detalle.lote.id);
    try {
      await revalidarLoteImportacion(loteId, token);
      setDetalle(await obtenerLoteImportacion(loteId, token));
      setOk("Lote revalidado.");
    } catch {
      setError("No se pudo revalidar el lote.");
    }
  };
  const cambiarSeleccion = async (fila: FilaImportacion) => {
    if (!detalle) return;
    const loteId = Number(detalle.lote.id);
    try {
      actualizarFila(await cambiarSeleccionFilaImportacion(loteId, fila.id, !fila.seleccionado, token));
    } catch {
      setError("No se pudo cambiar la selección.");
    }
  };
  const descartar = async (fila: FilaImportacion) => {
    if (!detalle) return;
    const loteId = Number(detalle.lote.id);
    try {
      actualizarFila(await descartarFilaImportacion(loteId, fila.id, token));
      setOk(`Fila ${fila.numero} descartada.`);
    } catch {
      setError("No se pudo descartar la fila.");
    }
  };
  const subirImagen = async (fila: FilaImportacion, archivo?: File) => {
    if (!detalle || !archivo) return;
    const loteId = Number(detalle.lote.id);
    try {
      actualizarFila(await adjuntarImagenFilaImportacion(loteId, fila.id, archivo, token));
      setOk(`Imagen WebP guardada para fila ${fila.numero}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo adjuntar imagen.");
    }
  };
  const onDropImagen = (fila: FilaImportacion, event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    void subirImagen(fila, event.dataTransfer.files?.[0]);
  };
  const eliminarImagen = async (fila: FilaImportacion) => {
    if (!detalle) return;
    const loteId = Number(detalle.lote.id);
    try {
      actualizarFila(await eliminarImagenFilaImportacion(loteId, fila.id, token));
      setOk(`Imagen eliminada de fila ${fila.numero}.`);
    } catch {
      setError("No se pudo eliminar imagen.");
    }
  };
  const descargar = async (tipo: "plantilla" | "inventario", formato: "csv" | "xlsx") => {
    try {
      const blob = await descargarExportacionAdmin(modulo, tipo, formato, token, seccionSeleccionada);
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `${modulo}-${tipo}.${formato}`;
      enlace.click();
      URL.revokeObjectURL(url);
      setOk(`Exportación ${tipo} ${formato.toUpperCase()} lista.`);
    } catch {
      setError("No se pudo exportar.");
    }
  };
  return (
    <section className="admin-contenido">
      <p className="admin-breadcrumb">Admin / {titulo}</p>
      <div className="admin-resumen"><h2>{titulo}</h2></div>
      {ok ? <p className="admin-estado">{ok}</p> : null}
      {error ? <p className="admin-estado admin-estado--error">{error}</p> : null}
      <div className="admin-bloque admin-panel-superior">
        <form onSubmit={guardar} className="admin-formulario-amplio">
          <h3>{String(form.id ?? "") ? "Editar registro" : "Alta manual"}</h3>
          <div className="admin-campos-grid">
            {campos.map((campo) => (
              <label key={campo.clave}>
                <span>{campo.etiqueta}</span>
                {campo.tipo === "checkbox" ? (
                  <input type="checkbox" checked={Boolean(form[campo.clave])} onChange={(event) => setForm({ ...form, [campo.clave]: event.target.checked })} />
                ) : campo.tipo === "textarea" ? (
                  <textarea value={String(form[campo.clave] ?? "")} onChange={(event) => setForm({ ...form, [campo.clave]: event.target.value })} />
                ) : (
                  <input value={String(form[campo.clave] ?? "")} onChange={(event) => setForm({ ...form, [campo.clave]: event.target.value })} />
                )}
              </label>
            ))}
          </div>
          <button type="submit">Guardar</button>
        </form>
        <aside className="admin-import-export">
          <h3>Importación contextual</h3>
          <p>Importar CSV · Importar XLSX</p>
          <label className="admin-dropzone">
            <span>Arrastra CSV/XLSX o selecciona archivo</span>
            <input type="file" accept=".csv,.xlsx" onChange={onArchivo} />
          </label>
          {detalle ? (
            <div className="admin-filtros">
              <button type="button" onClick={confirmar}>Confirmar</button>
              <button type="button" onClick={revalidar}>Revalidar</button>
            </div>
          ) : null}
          <h3>Exportación contextual</h3>
          <div className="admin-acciones-export">
            <button type="button" onClick={() => descargar("plantilla", "csv")}>Exportar plantilla CSV</button>
            <button type="button" onClick={() => descargar("plantilla", "xlsx")}>Exportar plantilla XLSX</button>
            <button type="button" onClick={() => descargar("inventario", "csv")}>Exportar inventario CSV</button>
            <button type="button" onClick={() => descargar("inventario", "xlsx")}>Exportar inventario XLSX</button>
          </div>
        </aside>
      </div>
      {detalle ? (
        <div className="admin-bloque">
          <h3>Staging por filas</h3>
          <p>Lote #{String(detalle.lote.id)} · Seleccionadas: {filasSeleccionadas}</p>
          <table className="admin-tabla">
            <thead><tr><th>Fila</th><th>Imagen</th><th>Estado imagen</th><th>Acciones</th></tr></thead>
            <tbody>
              {detalle.filas.map((fila) => (
                <tr key={fila.id}>
                  <td>
                    <label><input type="checkbox" checked={fila.seleccionado} onChange={() => cambiarSeleccion(fila)} /> #{fila.numero}</label>
                    <p>{fila.estado}</p>
                  </td>
                  <td>{fila.imagen ? <a href={fila.imagen} target="_blank">Preview imagen</a> : "Sin imagen"}</td>
                  <td>{fila.estado_imagen}</td>
                  <td>
                    <label className="admin-dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDropImagen(fila, event)}>
                      <span>Adjuntar/Reemplazar imagen</span>
                      <input type="file" accept="image/*" onChange={(event) => void subirImagen(fila, event.target.files?.[0])} />
                    </label>
                    <button type="button" onClick={() => eliminarImagen(fila)}>Eliminar imagen</button>{" "}
                    <button type="button" onClick={() => descartar(fila)}>Descartar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="admin-bloque">
        <h3>Registros existentes</h3>
        <input placeholder="Buscar por nombre, slug o contenido" value={filtro} onChange={(event) => setFiltro(event.target.value)} />
        <table className="admin-tabla">
          <thead><tr><th>Registro</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {filtrados.map((item) => (
              <tr key={String(item.id)}>
                <td>{String(item.nombre ?? item.titulo ?? item.slug ?? item.id)}</td>
                <td>{item[campoEstado] ? "Publicado" : "Borrador"}</td>
                <td>
                  <button type="button" onClick={() => editar(item)}>Editar</button>{" "}
                  <button type="button" onClick={() => publicar(String(item.id), !Boolean(item[campoEstado]))}>{item[campoEstado] ? "Despublicar" : "Publicar"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
