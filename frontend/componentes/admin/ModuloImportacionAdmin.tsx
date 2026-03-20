"use client";

import { FormEvent, useMemo, useState } from "react";

import { construirFeedbackConfirmacionImportacion } from "@/componentes/admin/importacion/feedbackConfirmacionImportacion";
import { actualizarDetalleImportacion } from "@/componentes/admin/importacion/resumenImportacion";
import { ResumenImportacionAdmin } from "@/componentes/admin/importacion/ResumenImportacionAdmin";
import { TablaLoteImportacionAdmin } from "@/componentes/admin/importacion/TablaLoteImportacionAdmin";
import {
  adjuntarImagenFilaImportacion,
  cambiarSeleccionFilaImportacion,
  cancelarLoteImportacion,
  confirmarLoteImportacion,
  confirmarValidasLoteImportacion,
  crearLoteImportacion,
  descartarFilaImportacion,
  descargarPlantillaImportacion,
  DetalleImportacion,
  descargarExportacionAdmin,
  eliminarImagenFilaImportacion,
  FilaImportacion,
  obtenerLoteImportacion,
  revalidarLoteImportacion,
} from "@/infraestructura/api/backoffice";

type EntidadImportacion = "productos" | "rituales" | "articulos_editoriales" | "secciones_publicas";

const OPCIONES_ENTIDAD: Array<{ value: EntidadImportacion; label: string }> = [
  { value: "productos", label: "Productos" },
  { value: "rituales", label: "Rituales" },
  { value: "articulos_editoriales", label: "Artículos editoriales" },
  { value: "secciones_publicas", label: "Secciones públicas" },
];

export function ModuloImportacionAdmin({ token }: { token?: string }): JSX.Element {
  const [entidad, setEntidad] = useState<EntidadImportacion>("productos");
  const [detalle, setDetalle] = useState<DetalleImportacion | null>(null);
  const [estado, setEstado] = useState<{ cargando: boolean; ok: string; error: string }>({ cargando: false, ok: "", error: "" });

  const resumen = detalle?.resumen;
  const seleccionadas = useMemo(() => detalle?.filas.filter((fila) => fila.seleccionado).length ?? 0, [detalle]);
  const loteId = Number(detalle?.lote.id ?? 0);
  const bloqueado = estado.cargando || !detalle;

  const ejecutarAccion = async (accion: () => Promise<void>, error: string) => {
    setEstado({ cargando: true, ok: "", error: "" });
    try {
      await accion();
      setEstado((prev) => ({ ...prev, cargando: false }));
    } catch (cause) {
      const detalleError = cause instanceof Error ? cause.message : error;
      setEstado({ cargando: false, ok: "", error: detalleError || error });
    }
  };

  const refrescarDetalle = async (id: number) => setDetalle(await obtenerLoteImportacion(id, token));
  const actualizarFila = (actualizada: FilaImportacion): void => {
    if (!detalle) return;
    setDetalle(actualizarDetalleImportacion(detalle, actualizada));
  };

  const subir = (event: FormEvent<HTMLFormElement>) => void ejecutarAccion(async () => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const id = await crearLoteImportacion(formData, token);
    await refrescarDetalle(id);
    setEstado({ cargando: false, ok: "Lote validado en staging. Revisa resumen y filas antes de confirmar.", error: "" });
  }, "No se pudo validar el archivo de importación.");

  const confirmarSeleccionadas = () => !detalle ? Promise.resolve() : ejecutarAccion(async () => {
    const respuesta = await confirmarLoteImportacion(loteId, detalle.filas.filter((fila) => fila.seleccionado).map((fila) => fila.id), token);
    const feedback = construirFeedbackConfirmacionImportacion("Filas confirmadas", respuesta);
    setDetalle(feedback.detalle);
    setEstado({ cargando: false, ok: feedback.mensaje, error: "" });
  }, "No se pudo confirmar la selección actual.");

  const confirmarValidas = () => !detalle ? Promise.resolve() : ejecutarAccion(async () => {
    const respuesta = await confirmarValidasLoteImportacion(loteId, token);
    const feedback = construirFeedbackConfirmacionImportacion("Filas válidas confirmadas", respuesta);
    setDetalle(feedback.detalle);
    setEstado({ cargando: false, ok: feedback.mensaje, error: "" });
  }, "No se pudo confirmar las filas válidas.");

  const revalidar = () => !detalle ? Promise.resolve() : ejecutarAccion(async () => {
    const respuesta = await revalidarLoteImportacion(loteId, token);
    setDetalle(respuesta.detalle);
    setEstado({ cargando: false, ok: "Lote revalidado correctamente.", error: "" });
  }, "No se pudo revalidar el lote.");

  const cancelar = () => !detalle ? Promise.resolve() : ejecutarAccion(async () => {
    await cancelarLoteImportacion(loteId, token);
    setDetalle(null);
    setEstado({ cargando: false, ok: "Importación cancelada. El lote staging fue eliminado.", error: "" });
  }, "No se pudo cancelar la importación.");

  const cambiarSeleccion = (fila: FilaImportacion) => loteId ? ejecutarAccion(async () => {
    const actualizada = await cambiarSeleccionFilaImportacion(loteId, fila.id, !fila.seleccionado, token);
    actualizarFila(actualizada);
  }, "No se pudo actualizar la selección.") : Promise.resolve();
  const descartarFila = (fila: FilaImportacion) => loteId ? ejecutarAccion(async () => {
    const actualizada = await descartarFilaImportacion(loteId, fila.id, token);
    actualizarFila(actualizada);
  }, "No se pudo descartar la fila.") : Promise.resolve();
  const eliminarImagen = (fila: FilaImportacion) => loteId ? ejecutarAccion(async () => {
    const actualizada = await eliminarImagenFilaImportacion(loteId, fila.id, token);
    actualizarFila(actualizada);
  }, "No se pudo quitar la imagen.") : Promise.resolve();
  const adjuntarImagen = (fila: FilaImportacion, archivo?: File) => loteId && archivo ? ejecutarAccion(async () => {
    const actualizada = await adjuntarImagenFilaImportacion(loteId, fila.id, archivo, token);
    actualizarFila(actualizada);
  }, "No se pudo adjuntar la imagen.") : Promise.resolve();

  const descargar = async (tipo: "inventario", formato: "csv" | "xlsx") => {
    const modulo = entidad === "articulos_editoriales" ? "editorial" : entidad === "secciones_publicas" ? "secciones" : entidad;
    const blob = await descargarExportacionAdmin(modulo, tipo, formato, token);
    descargarBlob(blob, `${modulo}-${tipo}.${formato}`);
  };

  const descargarPlantilla = async (formato: "csv" | "xlsx") => descargarBlob(await descargarPlantillaImportacion(entidad, formato, token), `${entidad}.${formato}`);

  return (
    <section className="admin-contenido">
      <p className="admin-breadcrumb">Admin / Importación masiva</p>
      <div className="admin-resumen">
        <h2>Importación masiva</h2>
        <p>La carga bulk del backoffice ya se opera desde Next.js y usa Django solo como API de staging, validación y confirmación.</p>
      </div>
      <form onSubmit={subir} className="admin-filtros">
        <select name="entidad" value={entidad} onChange={(event) => setEntidad(event.target.value as EntidadImportacion)}>{OPCIONES_ENTIDAD.map((opcion) => <option key={opcion.value} value={opcion.value}>{opcion.label}</option>)}</select>
        <select name="modo" defaultValue="crear_actualizar"><option value="solo_crear">Solo crear</option><option value="crear_actualizar">Crear o actualizar</option></select>
        <input type="file" name="archivo" accept=".csv,.xlsx" required />
        <button type="submit" className="admin-boton admin-boton--primario" disabled={estado.cargando}>{estado.cargando ? "Procesando..." : "Validar lote en staging"}</button>
      </form>
      <div className="admin-acciones-export" style={{ marginTop: 12 }}>
        <button type="button" className="admin-boton admin-boton--secundario" onClick={() => void ejecutarAccion(async () => descargarPlantilla("csv"), "No se pudo descargar la plantilla CSV.")}>Descargar plantilla CSV</button>
        <button type="button" className="admin-boton admin-boton--secundario" onClick={() => void ejecutarAccion(async () => descargarPlantilla("xlsx"), "No se pudo descargar la plantilla XLSX.")}>Descargar plantilla XLSX</button>
        <button type="button" className="admin-boton admin-boton--secundario" onClick={() => void ejecutarAccion(async () => descargar("inventario", "csv"), "No se pudo exportar el inventario CSV.")}>Exportar inventario CSV</button>
        <button type="button" className="admin-boton admin-boton--secundario" onClick={() => void ejecutarAccion(async () => descargar("inventario", "xlsx"), "No se pudo exportar el inventario XLSX.")}>Exportar inventario XLSX</button>
      </div>
      {estado.ok ? <p className="admin-estado">{estado.ok}</p> : null}
      {estado.error ? <p className="admin-estado admin-estado--error">{estado.error}</p> : null}
      {!detalle ? <section className="admin-bloque" style={{ marginTop: 16 }}><h3>Sin importación activa</h3><p>Sube un CSV o XLSX, elige entidad y modo, valida en staging y revisa el lote antes de confirmar.</p></section> : null}
      {detalle && resumen ? (
        <div className="admin-bloque" style={{ marginTop: 16 }}>
          <p>Lote activo #{String(detalle.lote.id)} · Archivo: {String(detalle.lote.archivo)} · Modo: {String(detalle.lote.modo)}</p>
          <ResumenImportacionAdmin resumen={resumen} />
          <div className="admin-filtros" style={{ marginTop: 16 }}>
            <button type="button" className="admin-boton admin-boton--primario" disabled={bloqueado || seleccionadas === 0} onClick={() => void confirmarSeleccionadas()}>Confirmar seleccionadas</button>
            <button type="button" className="admin-boton admin-boton--primario" disabled={bloqueado || (resumen.validas + resumen.warnings) === 0} onClick={() => void confirmarValidas()}>Confirmar válidas</button>
            <button type="button" className="admin-boton admin-boton--secundario" disabled={bloqueado} onClick={() => void revalidar()}>Revalidar lote</button>
            <button type="button" className="admin-boton admin-boton--peligro" disabled={bloqueado} onClick={() => void cancelar()}>Cancelar importación</button>
          </div>
          <TablaLoteImportacionAdmin filas={detalle.filas} bloqueado={estado.cargando} onSeleccionar={(fila) => void cambiarSeleccion(fila)} onAdjuntar={(fila, archivo) => void adjuntarImagen(fila, archivo)} onEliminarImagen={(fila) => void eliminarImagen(fila)} onDescartar={(fila) => void descartarFila(fila)} />
        </div>
      ) : null}
    </section>
  );
}

function descargarBlob(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}
