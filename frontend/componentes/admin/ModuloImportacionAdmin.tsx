"use client";

import { FormEvent, useState } from "react";

import { confirmarLoteImportacion, crearLoteImportacion, obtenerLoteImportacion } from "@/infraestructura/api/backoffice";

export function ModuloImportacionAdmin({ token }: { token?: string }): JSX.Element {
  const [loteId, setLoteId] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<{ lote: Record<string, unknown>; filas: Record<string, unknown>[] } | null>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const subir = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      const id = await crearLoteImportacion(formData, token);
      const data = await obtenerLoteImportacion(id, token);
      setLoteId(id);
      setDetalle(data);
      setOk("Lote validado en staging.");
    } catch {
      setError("No se pudo crear el lote de importación.");
    }
  };

  const confirmar = async () => {
    if (!loteId || !detalle) return;
    const ids = detalle.filas.filter((f) => f.seleccionado).map((f) => Number(f.id));
    try {
      const confirmadas = await confirmarLoteImportacion(loteId, ids, token);
      setOk(`Confirmadas: ${confirmadas}`);
      setDetalle(await obtenerLoteImportacion(loteId, token));
    } catch {
      setError("No se pudo confirmar el lote.");
    }
  };

  return (
    <section className="admin-contenido">
      <p className="admin-breadcrumb">Admin / Importación</p>
      <div className="admin-resumen"><h2>Importación CSV/XLSX</h2></div>
      <form onSubmit={subir} className="admin-filtros">
        <select name="entidad" defaultValue="productos"><option value="productos">Productos</option><option value="rituales">Rituales</option><option value="articulos_editoriales">Editorial</option><option value="secciones_publicas">Secciones</option></select>
        <select name="modo" defaultValue="crear_actualizar"><option value="solo_crear">Solo crear</option><option value="crear_actualizar">Crear o actualizar</option></select>
        <input type="file" name="archivo" accept=".csv,.xlsx" required />
        <button type="submit">Validar archivo</button>
      </form>
      {ok ? <p className="admin-estado">{ok}</p> : null}
      {error ? <p className="admin-estado admin-estado--error">{error}</p> : null}
      {detalle ? <><p>Lote #{String(detalle.lote.id)}</p><button type="button" onClick={confirmar}>Confirmar filas válidas</button></> : null}
    </section>
  );
}
