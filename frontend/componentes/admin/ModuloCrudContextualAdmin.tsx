"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";

import {
  cambiarPublicacionAdmin,
  confirmarLoteImportacion,
  crearLoteImportacion,
  descargarExportacionAdmin,
  guardarRegistroAdmin,
  ModuloAdmin,
  obtenerLoteImportacion,
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
  const [detalle, setDetalle] = useState<{ lote: Record<string, unknown>; filas: Record<string, unknown>[] } | null>(null);

  const campos = useMemo(() => [...camposComunes, ...camposEspecificos], [camposComunes, camposEspecificos]);

  const editar = (item: Record<string, unknown>) => {
    setForm({ ...item });
    setError("");
    setOk("Edición cargada.");
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
      const act = await cambiarPublicacionAdmin(modulo, id, publicado, token);
      setItems(items.map((it) => (it.id === id ? act : it)));
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
    const ids = detalle.filas.filter((f) => f.seleccionado).map((f) => Number(f.id));
    try {
      const confirmadas = await confirmarLoteImportacion(loteId, ids, token);
      setOk(`Confirmadas: ${confirmadas}`);
      setDetalle(await obtenerLoteImportacion(loteId, token));
    } catch {
      setError("No se pudo confirmar el lote.");
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

  const filtrados = items.filter((item) => JSON.stringify(item).toLowerCase().includes(filtro.toLowerCase()));

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
                  <input type="checkbox" checked={Boolean(form[campo.clave])} onChange={(e) => setForm({ ...form, [campo.clave]: e.target.checked })} />
                ) : campo.tipo === "textarea" ? (
                  <textarea value={String(form[campo.clave] ?? "")} onChange={(e) => setForm({ ...form, [campo.clave]: e.target.value })} />
                ) : (
                  <input value={String(form[campo.clave] ?? "")} onChange={(e) => setForm({ ...form, [campo.clave]: e.target.value })} />
                )}
              </label>
            ))}
          </div>
          <button type="submit">Guardar</button>
        </form>

        <aside className="admin-import-export">
          <h3>Importación contextual</h3>
          <label className="admin-dropzone">
            <span>Arrastra CSV/XLSX o selecciona archivo</span>
            <input type="file" accept=".csv,.xlsx" onChange={onArchivo} />
          </label>
          {detalle ? <button type="button" onClick={confirmar}>Confirmar filas válidas</button> : null}
          <h3>Exportación</h3>
          <div className="admin-acciones-export">
            <button type="button" onClick={() => descargar("plantilla", "csv")}>Descargar plantilla CSV</button>
            <button type="button" onClick={() => descargar("plantilla", "xlsx")}>Descargar plantilla XLSX</button>
            <button type="button" onClick={() => descargar("inventario", "csv")}>Exportar inventario CSV</button>
            <button type="button" onClick={() => descargar("inventario", "xlsx")}>Exportar inventario XLSX</button>
          </div>
        </aside>
      </div>

      <div className="admin-bloque">
        <h3>Registros existentes</h3>
        <input placeholder="Buscar por nombre, slug o contenido" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
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
