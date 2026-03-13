"use client";

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useState } from "react";

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
type OpcionContexto = { etiqueta: string; valor: string };
type Props = {
  modulo: ModuloAdmin;
  titulo: string;
  token?: string;
  itemsIniciales: Record<string, unknown>[];
  campoEstado: "publicado" | "publicada";
  entidadImportacion: "productos" | "rituales" | "articulos_editoriales" | "secciones_publicas";
  camposComunes: ConfigCampo[];
  camposEspecificos?: ConfigCampo[];
  construirPayload: (form: Record<string, unknown>) => Record<string, unknown>;
  seccionSeleccionada?: string;
  columnasObligatoriasImportacion?: string[];
  columnasOpcionalesImportacion?: string[];
  contextoFormulario?: { clave: string; etiqueta: string; ayuda: string; opciones: OpcionContexto[] };
  onCambioContexto?: (valor: string) => void;
  validarFormulario?: (form: Record<string, unknown>) => string | null;
};

type DetalleLote = { lote: Record<string, unknown>; filas: FilaImportacion[] };

function obtenerFaltantesCabecera(cabecera: string, columnasObligatorias: string[]): string[] {
  const columnas = new Set(cabecera.split(",").map((valor) => valor.trim().toLowerCase()).filter(Boolean));
  return columnasObligatorias.filter((columna) => !columnas.has(columna.toLowerCase()));
}

async function validarCabeceraCsv(archivo: File, columnasObligatorias: string[]): Promise<string[]> {
  if (!archivo.name.toLowerCase().endsWith(".csv") || columnasObligatorias.length === 0) return [];
  const texto = await archivo.text();
  const primeraLinea = texto.split(/\r?\n/)[0] ?? "";
  return obtenerFaltantesCabecera(primeraLinea, columnasObligatorias);
}

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
  columnasObligatoriasImportacion = [],
  columnasOpcionalesImportacion = [],
  contextoFormulario,
  onCambioContexto,
  validarFormulario,
}: Props): JSX.Element {
  const [items, setItems] = useState(itemsIniciales);
  const [formAlta, setFormAlta] = useState<Record<string, unknown>>({ [contextoFormulario?.clave ?? ""]: seccionSeleccionada });
  const [filtro, setFiltro] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [detalle, setDetalle] = useState<DetalleLote | null>(null);
  const [registroEdicion, setRegistroEdicion] = useState<Record<string, unknown> | null>(null);

  useEffect(() => setItems(itemsIniciales), [itemsIniciales]);
  useEffect(() => {
    if (!contextoFormulario?.clave) return;
    setFormAlta((actual) => ({ ...actual, [contextoFormulario.clave]: seccionSeleccionada }));
  }, [contextoFormulario?.clave, seccionSeleccionada]);

  const campos = useMemo(() => [...camposComunes, ...camposEspecificos], [camposComunes, camposEspecificos]);

  useEffect(() => {
    if (!registroEdicion) return;
    const alTeclado = (event: KeyboardEvent) => { if (event.key === "Escape") setRegistroEdicion(null); };
    window.addEventListener("keydown", alTeclado);
    return () => window.removeEventListener("keydown", alTeclado);
  }, [registroEdicion]);
  const filasSeleccionadas = useMemo(() => detalle?.filas.filter((fila) => fila.seleccionado).length ?? 0, [detalle]);
  const filtrados = useMemo(() => items.filter((item) => JSON.stringify(item).toLowerCase().includes(filtro.toLowerCase())), [items, filtro]);

  const actualizarFila = (actualizada: FilaImportacion) => {
    if (!detalle) return;
    setDetalle({ ...detalle, filas: detalle.filas.map((fila) => (fila.id === actualizada.id ? actualizada : fila)) });
  };

  const guardar = async (formulario: Record<string, unknown>) => {
    const guardado = await guardarRegistroAdmin(modulo, construirPayload(formulario), token);
    const existe = items.some((it) => it.id === guardado.id);
    setItems(existe ? items.map((it) => (it.id === guardado.id ? guardado : it)) : [guardado, ...items]);
  };

  const onGuardarAlta = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const errorValidacion = validarFormulario?.(formAlta);
      if (errorValidacion) { setError(errorValidacion); return; }
      await guardar(formAlta);
      setFormAlta({ [contextoFormulario?.clave ?? ""]: seccionSeleccionada });
      setOk("Registro guardado.");
      setError("");
    } catch {
      setError("No se pudo guardar el registro.");
    }
  };

  const onGuardarEdicion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!registroEdicion) return;
    try {
      const errorValidacion = validarFormulario?.(registroEdicion);
      if (errorValidacion) { setError(errorValidacion); return; }
      await guardar(registroEdicion);
      setRegistroEdicion(null);
      setOk("Cambios guardados.");
      setError("");
    } catch {
      setError("No se pudo guardar la edición.");
    }
  };

  const onArchivo = async (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    const faltantes = await validarCabeceraCsv(archivo, columnasObligatoriasImportacion);
    if (faltantes.length > 0) {
      setError(`Faltan columnas obligatorias: ${faltantes.join(", ")}.`);
      setOk("");
      return;
    }
    const formData = new FormData();
    formData.set("entidad", entidadImportacion);
    formData.set("modo", "crear_actualizar");
    if (seccionSeleccionada) formData.set("seccion", seccionSeleccionada);
    formData.set("archivo", archivo);
    try {
      const id = await crearLoteImportacion(formData, token);
      setDetalle(await obtenerLoteImportacion(id, token));
      setOk("Lote validado en staging.");
      setError("");
    } catch {
      setError("No se pudo crear el lote de importación. Revisa cabeceras obligatorias para CSV/XLSX.");
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

      <section className="admin-bloque admin-importacion-contextual">
        <h3>Importación contextual</h3>
        <p>Sube CSV o XLSX. Modo actual: crear o actualizar en staging con confirmación.</p>
        <p><strong>Columnas obligatorias:</strong> {columnasObligatoriasImportacion.join(", ") || "definidas por backend"}</p>
        <p><strong>Columnas opcionales:</strong> {columnasOpcionalesImportacion.join(", ") || "según módulo"}</p>
        <label className="admin-dropzone"><span>Arrastra CSV/XLSX o selecciona archivo</span><input type="file" accept=".csv,.xlsx" onChange={onArchivo} /></label>
        {detalle ? <div className="admin-filtros"><button type="button" onClick={async () => detalle && setOk(`Confirmadas: ${await confirmarLoteImportacion(Number(detalle.lote.id), detalle.filas.filter((f) => f.seleccionado).map((f) => Number(f.id)), token)}`)}>Confirmar</button><button type="button" onClick={async () => { if (!detalle) return; await revalidarLoteImportacion(Number(detalle.lote.id), token); setDetalle(await obtenerLoteImportacion(Number(detalle.lote.id), token)); setOk("Lote revalidado."); }}>Revalidar</button></div> : null}
      </section>

      <section className="admin-bloque admin-alta-manual">
        <h3>Alta manual</h3>
        <form onSubmit={onGuardarAlta} className="admin-formulario-amplio">
          {contextoFormulario ? (
            <label>
              <span>{contextoFormulario.etiqueta}</span>
              <select value={String(formAlta[contextoFormulario.clave] ?? seccionSeleccionada)} onChange={(event) => { const valor = event.target.value; setFormAlta({ ...formAlta, [contextoFormulario.clave]: valor }); onCambioContexto?.(valor); }}>
                {contextoFormulario.opciones.map((opcion) => <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>)}
              </select>
              <small>{contextoFormulario.ayuda}</small>
            </label>
          ) : null}
          <div className="admin-campos-grid">{campos.map((campo) => <label key={campo.clave}><span>{campo.etiqueta}</span>{campo.tipo === "checkbox" ? <input type="checkbox" checked={Boolean(formAlta[campo.clave])} onChange={(event) => setFormAlta({ ...formAlta, [campo.clave]: event.target.checked })} /> : campo.tipo === "textarea" ? <textarea value={String(formAlta[campo.clave] ?? "")} onChange={(event) => setFormAlta({ ...formAlta, [campo.clave]: event.target.value })} /> : <input value={String(formAlta[campo.clave] ?? "")} onChange={(event) => setFormAlta({ ...formAlta, [campo.clave]: event.target.value })} />}</label>)}</div>
          <button type="submit">Guardar alta</button>
        </form>
      </section>

      <section className="admin-bloque">
        <h3>Exportación contextual</h3>
        <div className="admin-acciones-export"><button type="button" onClick={() => descargar("plantilla", "csv")}>Descargar plantilla CSV</button><button type="button" onClick={() => descargar("plantilla", "xlsx")}>Descargar plantilla XLSX</button><button type="button" onClick={() => descargar("inventario", "csv")}>Exportar inventario CSV</button><button type="button" onClick={() => descargar("inventario", "xlsx")}>Exportar inventario XLSX</button></div>
      </section>

      {detalle ? <div className="admin-bloque"><h3>Staging por filas</h3><p>Lote #{String(detalle.lote.id)} · Seleccionadas: {filasSeleccionadas}</p><table className="admin-tabla"><thead><tr><th>Fila</th><th>Imagen</th><th>Estado imagen</th><th>Acciones</th></tr></thead><tbody>{detalle.filas.map((fila) => <tr key={fila.id}><td><label><input type="checkbox" checked={fila.seleccionado} onChange={async () => { if (!detalle) return; actualizarFila(await cambiarSeleccionFilaImportacion(Number(detalle.lote.id), fila.id, !fila.seleccionado, token)); }} /> #{fila.numero}</label><p>{fila.estado}</p>{fila.errores.map((e) => <p key={e} className="admin-estado admin-estado--error">{e}</p>)}</td><td>{fila.imagen ? <a href={fila.imagen} target="_blank">Preview imagen</a> : "Sin imagen"}</td><td>{fila.estado_imagen}</td><td><label className="admin-dropzone" onDragOver={(event: DragEvent<HTMLElement>) => event.preventDefault()} onDrop={(event: DragEvent<HTMLElement>) => { event.preventDefault(); void (async () => { if (!detalle || !event.dataTransfer.files?.[0]) return; actualizarFila(await adjuntarImagenFilaImportacion(Number(detalle.lote.id), fila.id, event.dataTransfer.files[0], token)); })(); }}><span>Adjuntar/Reemplazar imagen</span><input type="file" accept="image/*" onChange={(event) => void (async () => { if (!detalle || !event.target.files?.[0]) return; actualizarFila(await adjuntarImagenFilaImportacion(Number(detalle.lote.id), fila.id, event.target.files[0], token)); })()} /></label><button type="button" onClick={async () => { if (!detalle) return; actualizarFila(await eliminarImagenFilaImportacion(Number(detalle.lote.id), fila.id, token)); }}>Eliminar imagen</button> <button type="button" onClick={async () => { if (!detalle) return; actualizarFila(await descartarFilaImportacion(Number(detalle.lote.id), fila.id, token)); }}>Descartar</button></td></tr>)}</tbody></table></div> : null}

      <section className="admin-bloque">
        <h3>Registros existentes</h3>
        <input placeholder="Buscar por nombre, slug o contenido" value={filtro} onChange={(event) => setFiltro(event.target.value)} />
        <table className="admin-tabla"><thead><tr><th>Registro</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{filtrados.map((item) => <tr key={String(item.id)}><td>{String(item.nombre ?? item.titulo ?? item.slug ?? item.id)}</td><td>{item[campoEstado] ? "Publicado" : "Borrador"}</td><td><button type="button" onClick={() => setRegistroEdicion({ ...item })}>Editar</button> <button type="button" onClick={async () => { const actualizado = await cambiarPublicacionAdmin(modulo, String(item.id), !Boolean(item[campoEstado]), token); setItems(items.map((it) => (it.id === item.id ? actualizado : it))); }}>{item[campoEstado] ? "Despublicar" : "Publicar"}</button></td></tr>)}</tbody></table>
      </section>

      {registroEdicion ? (
        <div className="admin-modal-fondo" role="presentation" onClick={() => setRegistroEdicion(null)}>
          <div className="admin-modal" role="dialog" aria-modal="true" aria-label="Editar registro" onClick={(event) => event.stopPropagation()}>
            <h3>Editar registro</h3>
            <form onSubmit={onGuardarEdicion} className="admin-formulario-amplio"><div className="admin-campos-grid">{campos.map((campo) => <label key={`editar-${campo.clave}`}><span>{campo.etiqueta}</span>{campo.tipo === "checkbox" ? <input type="checkbox" checked={Boolean(registroEdicion[campo.clave])} onChange={(event) => setRegistroEdicion({ ...registroEdicion, [campo.clave]: event.target.checked })} /> : campo.tipo === "textarea" ? <textarea value={String(registroEdicion[campo.clave] ?? "")} onChange={(event) => setRegistroEdicion({ ...registroEdicion, [campo.clave]: event.target.value })} /> : <input value={String(registroEdicion[campo.clave] ?? "")} onChange={(event) => setRegistroEdicion({ ...registroEdicion, [campo.clave]: event.target.value })} />}</label>)}</div><div className="admin-filtros"><button type="submit">Guardar cambios</button><button type="button" onClick={() => setRegistroEdicion(null)}>Cerrar</button></div></form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
