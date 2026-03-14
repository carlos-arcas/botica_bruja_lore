"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

import { TablaStagingImportacion } from "@/componentes/admin/TablaStagingImportacion";
import {
  FilaImportacion,
  ModuloAdmin,
  adjuntarImagenFilaImportacion,
  cambiarPublicacionAdmin,
  cambiarSeleccionFilaImportacion,
  confirmarLoteImportacion,
  crearLoteImportacion,
  descartarFilaImportacion,
  descargarExportacionAdmin,
  eliminarImagenFilaImportacion,
  guardarRegistroAdmin,
  obtenerLoteImportacion,
  revalidarLoteImportacion,
} from "@/infraestructura/api/backoffice";
import { construirPayloadRitual } from "@/infraestructura/configuracion/adminRituales";

type ConfigCampo = { clave: string; etiqueta: string; tipo?: "text" | "textarea" | "checkbox" };
type OpcionContexto = { etiqueta: string; valor: string };
type TipoPayloadAdmin = "rituales" | "editorial" | "secciones" | "productos";

type Props = {
  modulo: ModuloAdmin;
  titulo: string;
  token?: string;
  itemsIniciales: Record<string, unknown>[];
  campoEstado: "publicado" | "publicada";
  entidadImportacion: "productos" | "rituales" | "articulos_editoriales" | "secciones_publicas";
  camposComunes: ConfigCampo[];
  camposEspecificos?: ConfigCampo[];
  tipoPayload: TipoPayloadAdmin;
  seccionSeleccionada?: string;
  columnasObligatoriasImportacion?: string[];
  columnasOpcionalesImportacion?: string[];
  contextoFormulario?: { clave: string; etiqueta: string; ayuda: string; opciones: OpcionContexto[] };
  onCambioContexto?: (valor: string) => void;
  validarFormulario?: (form: Record<string, unknown>) => string | null;
  errorInicial?: string;
};

type DetalleLote = { lote: Record<string, unknown>; filas: FilaImportacion[] };

const obtenerFaltantesCabecera = (cabecera: string, columnasObligatorias: string[]): string[] => {
  const columnas = new Set(cabecera.split(",").map((valor) => valor.trim().toLowerCase()).filter(Boolean));
  return columnasObligatorias.filter((columna) => !columnas.has(columna.toLowerCase()));
};

async function validarCabeceraCsv(archivo: File, columnasObligatorias: string[]): Promise<string[]> {
  if (!archivo.name.toLowerCase().endsWith(".csv") || columnasObligatorias.length === 0) return [];
  const texto = await archivo.text();
  return obtenerFaltantesCabecera(texto.split(/\r?\n/)[0] ?? "", columnasObligatorias);
}

function construirPayloadSegunTipo(tipoPayload: TipoPayloadAdmin, formulario: Record<string, unknown>, seccionSeleccionada: string): Record<string, unknown> {
  if (tipoPayload === "rituales") return construirPayloadRitual(formulario);
  if (tipoPayload === "productos") return { ...formulario, seccion_publica: seccionSeleccionada, orden_publicacion: 100 };
  return formulario;
}

function CampoFormulario({ valor, campo, onCambio }: { valor: unknown; campo: ConfigCampo; onCambio: (valor: unknown) => void }): JSX.Element {
  if (campo.tipo === "checkbox") return <input type="checkbox" checked={Boolean(valor)} onChange={(event) => onCambio(event.target.checked)} />;
  if (campo.tipo === "textarea") return <textarea value={String(valor ?? "")} onChange={(event) => onCambio(event.target.value)} />;
  return <input value={String(valor ?? "")} onChange={(event) => onCambio(event.target.value)} />;
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
  tipoPayload,
  seccionSeleccionada = "",
  columnasObligatoriasImportacion = [],
  columnasOpcionalesImportacion = [],
  contextoFormulario,
  onCambioContexto,
  validarFormulario,
  errorInicial = "",
}: Props): JSX.Element {
  const [items, setItems] = useState(itemsIniciales);
  const [formAlta, setFormAlta] = useState<Record<string, unknown>>({ [contextoFormulario?.clave ?? ""]: seccionSeleccionada });
  const [filtro, setFiltro] = useState("");
  const [error, setError] = useState(errorInicial);
  const [ok, setOk] = useState("");
  const [detalle, setDetalle] = useState<DetalleLote | null>(null);
  const [registroEdicion, setRegistroEdicion] = useState<Record<string, unknown> | null>(null);
  const [importacionAbierta, setImportacionAbierta] = useState(false);

  useEffect(() => setItems(itemsIniciales), [itemsIniciales]);
  useEffect(() => {
    if (!contextoFormulario?.clave) return;
    setFormAlta((actual) => ({ ...actual, [contextoFormulario.clave]: seccionSeleccionada }));
  }, [contextoFormulario?.clave, seccionSeleccionada]);

  const campos = useMemo(() => [...camposComunes, ...camposEspecificos], [camposComunes, camposEspecificos]);
  const filtrados = useMemo(() => items.filter((item) => JSON.stringify(item).toLowerCase().includes(filtro.toLowerCase())), [items, filtro]);

  const ejecutarAccion = async (accion: () => Promise<void>, mensajeError: string) => {
    try {
      await accion();
      setError("");
    } catch {
      setOk("");
      setError(mensajeError);
    }
  };

  const guardar = async (formulario: Record<string, unknown>) => {
    const payload = construirPayloadSegunTipo(tipoPayload, formulario, seccionSeleccionada);
    const guardado = await guardarRegistroAdmin(modulo, payload, token);
    const existe = items.some((it) => it.id === guardado.id);
    setItems(existe ? items.map((it) => (it.id === guardado.id ? guardado : it)) : [guardado, ...items]);
  };

  const onGuardarAlta = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errorValidacion = validarFormulario?.(formAlta);
    if (errorValidacion) return setError(errorValidacion);
    await ejecutarAccion(async () => {
      await guardar(formAlta);
      setFormAlta({ [contextoFormulario?.clave ?? ""]: seccionSeleccionada });
      setOk("Registro guardado.");
    }, "No se pudo guardar el registro.");
  };

  const onGuardarEdicion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!registroEdicion) return;
    const errorValidacion = validarFormulario?.(registroEdicion);
    if (errorValidacion) return setError(errorValidacion);
    await ejecutarAccion(async () => {
      await guardar(registroEdicion);
      setRegistroEdicion(null);
      setOk("Cambios guardados.");
    }, "No se pudo guardar la edición.");
  };

  const onArchivo = async (event: ChangeEvent<HTMLInputElement>) => {
    const archivo = event.target.files?.[0];
    if (!archivo) return;
    const faltantes = await validarCabeceraCsv(archivo, columnasObligatoriasImportacion);
    if (faltantes.length > 0) return setError(`Faltan columnas obligatorias: ${faltantes.join(", ")}.`);
    const formData = new FormData();
    formData.set("entidad", entidadImportacion);
    formData.set("modo", "crear_actualizar");
    if (seccionSeleccionada) formData.set("seccion", seccionSeleccionada);
    formData.set("archivo", archivo);
    await ejecutarAccion(async () => {
      const loteId = await crearLoteImportacion(formData, token);
      const lote = await obtenerLoteImportacion(loteId, token);
      setDetalle({ lote: lote.lote, filas: lote.filas });
      setOk("Lote cargado. Revisa filas antes de confirmar.");
    }, "No se pudo cargar el lote de importación.");
  };

  const actualizarFila = (actualizada: FilaImportacion) => {
    if (!detalle) return;
    setDetalle({ ...detalle, filas: detalle.filas.map((fila) => (fila.id === actualizada.id ? actualizada : fila)) });
  };

  const onSeleccionFila = (fila: FilaImportacion) => void ejecutarAccion(async () => {
    if (!detalle) return;
    const actualizada = await cambiarSeleccionFilaImportacion(Number(detalle.lote.id), fila.id, !fila.seleccionado, token);
    actualizarFila(actualizada);
  }, "No se pudo actualizar la selección de fila.");

  const onAdjuntarImagen = (fila: FilaImportacion, archivo?: File) => void ejecutarAccion(async () => {
    if (!detalle || !archivo) return;
    const actualizada = await adjuntarImagenFilaImportacion(Number(detalle.lote.id), fila.id, archivo, token);
    actualizarFila(actualizada);
  }, "No se pudo adjuntar la imagen.");

  const onEliminarImagen = (fila: FilaImportacion) => void ejecutarAccion(async () => {
    if (!detalle) return;
    const actualizada = await eliminarImagenFilaImportacion(Number(detalle.lote.id), fila.id, token);
    actualizarFila(actualizada);
  }, "No se pudo eliminar la imagen.");

  const onDescartarFila = (fila: FilaImportacion) => void ejecutarAccion(async () => {
    if (!detalle) return;
    const actualizada = await descartarFilaImportacion(Number(detalle.lote.id), fila.id, token);
    actualizarFila(actualizada);
  }, "No se pudo descartar la fila.");

  const onConfirmarLote = () => void ejecutarAccion(async () => {
    if (!detalle) return;
    const filas = detalle.filas.filter((fila) => fila.seleccionado).map((fila) => fila.id);
    const confirmadas = await confirmarLoteImportacion(Number(detalle.lote.id), filas, token);
    setOk(`Lote confirmado. Filas aplicadas: ${confirmadas}.`);
  }, "No se pudo confirmar el lote.");

  const onRevalidarLote = () => void ejecutarAccion(async () => {
    if (!detalle) return;
    await revalidarLoteImportacion(Number(detalle.lote.id), token);
    const lote = await obtenerLoteImportacion(Number(detalle.lote.id), token);
    setDetalle({ lote: lote.lote, filas: lote.filas });
    setOk("Lote revalidado.");
  }, "No se pudo revalidar el lote.");

  const descargar = async (tipo: "plantilla" | "inventario", formato: "csv" | "xlsx") => {
    const blob = await descargarExportacionAdmin(modulo, tipo, formato, token, seccionSeleccionada);
    const url = URL.createObjectURL(blob);
    const ancla = document.createElement("a");
    ancla.href = url;
    ancla.download = `${modulo}-${tipo}.${formato}`;
    ancla.click();
    URL.revokeObjectURL(url);
  };

  return <section className="admin-bloque"><h2>{titulo}</h2>{error ? <p className="admin-estado admin-estado--error">{error}</p> : null}{ok ? <p className="admin-estado admin-estado--ok">{ok}</p> : null}
    <div className="admin-disposicion-crud"><div className="admin-columna-principal"><section className="admin-bloque admin-alta-manual"><h3>Alta / edición manual</h3><form onSubmit={onGuardarAlta} className="admin-formulario-amplio">{contextoFormulario ? <label><span>{contextoFormulario.etiqueta}</span><select value={String(formAlta[contextoFormulario.clave] ?? seccionSeleccionada)} onChange={(event) => { const valor = event.target.value; setFormAlta({ ...formAlta, [contextoFormulario.clave]: valor }); onCambioContexto?.(valor); }}>{contextoFormulario.opciones.map((opcion) => <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>)}</select><small>{contextoFormulario.ayuda}</small></label> : null}<div className="admin-campos-grid">{campos.map((campo) => <label key={campo.clave}><span>{campo.etiqueta}</span><CampoFormulario campo={campo} valor={formAlta[campo.clave]} onCambio={(valor) => setFormAlta({ ...formAlta, [campo.clave]: valor })} /></label>)}</div><button type="submit">Guardar alta</button></form></section>
      <section className="admin-bloque"><h3>Registros existentes</h3><input placeholder="Buscar por nombre, slug o contenido" value={filtro} onChange={(event) => setFiltro(event.target.value)} /><table className="admin-tabla"><thead><tr><th>Registro</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{filtrados.map((item) => <tr key={String(item.id)}><td>{String(item.nombre ?? item.titulo ?? item.slug ?? item.id)}</td><td>{item[campoEstado] ? "Publicado" : "Borrador"}</td><td><button type="button" onClick={() => setRegistroEdicion({ ...item })}>Editar</button> <button type="button" onClick={() => void ejecutarAccion(async () => { const actualizado = await cambiarPublicacionAdmin(modulo, String(item.id), !Boolean(item[campoEstado]), token); setItems(items.map((it) => (it.id === item.id ? actualizado : it))); }, "No se pudo actualizar la publicación.")}>{item[campoEstado] ? "Despublicar" : "Publicar"}</button></td></tr>)}</tbody></table></section></div>
      <aside className="admin-columna-herramientas" aria-label="Herramientas secundarias"><section className="admin-bloque admin-panel-herramientas"><h3>Herramientas</h3><p>Acciones secundarias de importación y exportación.</p><button type="button" className="admin-boton-herramienta" onClick={() => setImportacionAbierta(true)}>Importar</button><div className="admin-acciones-export"><button type="button" className="admin-boton-herramienta" onClick={() => void ejecutarAccion(async () => descargar("plantilla", "csv"), "No se pudo descargar la plantilla CSV.")}>Plantilla CSV</button><button type="button" className="admin-boton-herramienta" onClick={() => void ejecutarAccion(async () => descargar("plantilla", "xlsx"), "No se pudo descargar la plantilla XLSX.")}>Plantilla XLSX</button><button type="button" className="admin-boton-herramienta" onClick={() => void ejecutarAccion(async () => descargar("inventario", "csv"), "No se pudo exportar inventario CSV.")}>Inventario CSV</button><button type="button" className="admin-boton-herramienta" onClick={() => void ejecutarAccion(async () => descargar("inventario", "xlsx"), "No se pudo exportar inventario XLSX.")}>Inventario XLSX</button></div></section></aside></div>
    {importacionAbierta ? <div className="admin-modal-fondo" role="presentation" onClick={() => setImportacionAbierta(false)}><div className="admin-modal admin-modal--grande" role="dialog" aria-modal="true" aria-label="Importar lote" onClick={(event) => event.stopPropagation()}><h3>Importación</h3><p>Columnas obligatorias: {columnasObligatoriasImportacion.length ? columnasObligatoriasImportacion.join(", ") : "(sin restricciones)"}</p><p>Columnas opcionales: {columnasOpcionalesImportacion.length ? columnasOpcionalesImportacion.join(", ") : "(sin opcionales)"}</p><input type="file" accept=".csv,.xlsx" onChange={(event) => void onArchivo(event)} /><div className="admin-filtros"><button type="button" onClick={onConfirmarLote}>Confirmar lote seleccionado</button><button type="button" onClick={onRevalidarLote}>Revalidar lote</button><button type="button" onClick={() => setImportacionAbierta(false)}>Cerrar</button></div>{detalle ? <TablaStagingImportacion detalleId={Number(detalle.lote.id)} filas={detalle.filas} onSeleccionar={onSeleccionFila} onAdjuntar={onAdjuntarImagen} onEliminarImagen={onEliminarImagen} onDescartar={onDescartarFila} /> : null}</div></div> : null}
    {registroEdicion ? <div className="admin-modal-fondo" role="presentation" onClick={() => setRegistroEdicion(null)}><div className="admin-modal" role="dialog" aria-modal="true" aria-label="Editar registro" onClick={(event) => event.stopPropagation()}><h3>Editar registro</h3><form onSubmit={onGuardarEdicion} className="admin-formulario-amplio"><div className="admin-campos-grid">{campos.map((campo) => <label key={`editar-${campo.clave}`}><span>{campo.etiqueta}</span><CampoFormulario campo={campo} valor={registroEdicion[campo.clave]} onCambio={(valor) => setRegistroEdicion({ ...registroEdicion, [campo.clave]: valor })} /></label>)}</div><div className="admin-filtros"><button type="submit">Guardar cambios</button><button type="button" onClick={() => setRegistroEdicion(null)}>Cerrar</button></div></form></div></div> : null}
  </section>;
}
