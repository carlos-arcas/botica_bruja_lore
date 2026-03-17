"use client";

import { useMemo, useState } from "react";

type ItemLog = { raw: string; sanitized: string };

type RespuestaLogs = { source: string; total: number; items: ItemLog[] };

export function DebugLogViewer(): JSX.Element {
  const [key, setKey] = useState("");
  const [source, setSource] = useState("app");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [limit, setLimit] = useState(200);
  const [raw, setRaw] = useState(false);
  const [estado, setEstado] = useState("Listo");
  const [items, setItems] = useState<ItemLog[]>([]);

  const bloque = useMemo(() => items.map((linea) => (raw ? linea.raw : linea.sanitized)).join("\n"), [items, raw]);

  async function cargar(): Promise<void> {
    setEstado("Cargando...");
    const params = new URLSearchParams({ source, q: query, level, limit: String(limit) });
    const respuesta = await fetch(`/api/debug/logs?${params.toString()}`, {
      headers: { "X-Debug-Log-Key": key },
      cache: "no-store",
    });
    if (!respuesta.ok) {
      setItems([]);
      setEstado(`Error ${respuesta.status}`);
      return;
    }
    const data = (await respuesta.json()) as RespuestaLogs;
    setItems(data.items ?? []);
    setEstado(`OK (${data.total} líneas)`);
  }

  async function limpiar(): Promise<void> {
    setEstado("Limpiando...");
    const respuesta = await fetch("/api/debug/logs/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Log-Key": key },
      body: JSON.stringify({ source }),
      cache: "no-store",
    });
    if (!respuesta.ok) {
      setEstado(`No se pudo limpiar (${respuesta.status})`);
      return;
    }
    setItems([]);
    setEstado("Logs limpiados");
  }

  async function copiar(): Promise<void> {
    await navigator.clipboard.writeText(bloque);
    setEstado("Bloque copiado");
  }

  return (
    <section className="admin-contenido">
      <p className="admin-breadcrumb">Debug / Logs remotos</p>
      <div className="admin-resumen" style={{ display: "grid", gap: 12 }}>
        <h2>Visor de logs efímero</h2>
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Clave temporal" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select value={source} onChange={(e) => setSource(e.target.value)}>
            <option value="app">app.log</option>
            <option value="error">error.log</option>
          </select>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filtro texto" />
          <input value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Nivel (INFO/ERROR)" />
          <input type="number" value={limit} min={1} max={500} onChange={(e) => setLimit(Number(e.target.value || 200))} />
          <label>
            <input type="checkbox" checked={raw} onChange={(e) => setRaw(e.target.checked)} /> Raw
          </label>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={cargar}>Refrescar</button>
          <button onClick={limpiar}>Limpiar logs</button>
          <button onClick={copiar}>Copiar bloque</button>
        </div>
        <p>{estado}</p>
        <pre style={{ maxHeight: 480, overflow: "auto", background: "#111", color: "#ddd", padding: 12 }}>{bloque || "Sin datos"}</pre>
      </div>
    </section>
  );
}
