"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type ItemLog = { raw: string; sanitized: string };

type RespuestaLogs = { source: string; total: number; items: ItemLog[] };

type EstadoVisor = "bloqueado" | "operativo";

const CLAVE_SESSION_STORAGE = "botica.debug.log.key";

function leerClaveGuardada(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(CLAVE_SESSION_STORAGE) ?? "";
}

function guardarClave(clave: string): void {
  sessionStorage.setItem(CLAVE_SESSION_STORAGE, clave);
}

function limpiarClave(): void {
  sessionStorage.removeItem(CLAVE_SESSION_STORAGE);
}

export function DebugLogViewer(): JSX.Element {
  const [estadoVisor, setEstadoVisor] = useState<EstadoVisor>("bloqueado");
  const [clave, setClave] = useState("");
  const [claveFormulario, setClaveFormulario] = useState("");
  const [source, setSource] = useState("app");
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [limit, setLimit] = useState(200);
  const [raw, setRaw] = useState(false);
  const [estado, setEstado] = useState("Bloqueado");
  const [items, setItems] = useState<ItemLog[]>([]);
  const [autoactualizar, setAutoactualizar] = useState(false);

  const bloque = useMemo(() => items.map((linea) => (raw ? linea.raw : linea.sanitized)).join("\n"), [items, raw]);

  useEffect(() => {
    const claveGuardada = leerClaveGuardada();
    if (!claveGuardada) return;
    setClave(claveGuardada);
    setClaveFormulario(claveGuardada);
    void cargar(claveGuardada);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!autoactualizar || estadoVisor !== "operativo" || !clave) return;
    const intervalo = window.setInterval(() => {
      void cargar(clave);
    }, 2500);
    return () => window.clearInterval(intervalo);
  }, [autoactualizar, estadoVisor, clave, source, query, level, limit]);

  async function cargar(claveActiva: string = clave): Promise<void> {
    setEstado("Cargando...");
    const params = new URLSearchParams({ source, q: query, level, limit: String(limit) });
    const respuesta = await fetch(`/api/debug/logs?${params.toString()}`, {
      headers: { "X-Debug-Log-Key": claveActiva },
      cache: "no-store",
    });

    if (respuesta.status === 403) {
      setItems([]);
      setEstadoVisor("bloqueado");
      setEstado("Clave inválida o faltante");
      return;
    }

    if (!respuesta.ok) {
      setItems([]);
      setEstado(`Error ${respuesta.status}`);
      return;
    }

    const data = (await respuesta.json()) as RespuestaLogs;
    setItems(data.items ?? []);
    setEstadoVisor("operativo");
    setEstado(`OK (${data.total} líneas)`);
  }

  async function limpiarLogs(): Promise<void> {
    setEstado("Limpiando...");
    const respuesta = await fetch("/api/debug/logs/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Log-Key": clave },
      body: JSON.stringify({ source }),
      cache: "no-store",
    });

    if (respuesta.status === 403) {
      setItems([]);
      setEstadoVisor("bloqueado");
      setEstado("Clave inválida o faltante");
      return;
    }

    if (!respuesta.ok) {
      setEstado(`No se pudo limpiar (${respuesta.status})`);
      return;
    }

    setItems([]);
    setEstado("Logs limpiados");
    await cargar();
  }

  async function copiar(): Promise<void> {
    await navigator.clipboard.writeText(bloque);
    setEstado("Bloque copiado");
  }

  async function desbloquear(evento: FormEvent<HTMLFormElement>): Promise<void> {
    evento.preventDefault();
    const claveNormalizada = claveFormulario.trim();
    if (!claveNormalizada) {
      setEstado("Debes introducir una clave");
      return;
    }

    guardarClave(claveNormalizada);
    setClave(claveNormalizada);
    await cargar(claveNormalizada);
  }

  function bloquearVisor(): void {
    limpiarClave();
    setClave("");
    setClaveFormulario("");
    setItems([]);
    setEstadoVisor("bloqueado");
    setEstado("Bloqueado");
  }

  const esBloqueado = estadoVisor === "bloqueado";

  return (
    <section className="admin-contenido">
      <p className="admin-breadcrumb">Debug / Logs remotos</p>
      <div className="admin-resumen" style={{ display: "grid", gap: 12 }}>
        <h2>Visor de logs efímero</h2>
        {esBloqueado ? (
          <form onSubmit={desbloquear} style={{ display: "grid", gap: 8, maxWidth: 380 }}>
            <label htmlFor="clave-debug-log">Clave temporal</label>
            <input
              id="clave-debug-log"
              value={claveFormulario}
              onChange={(e) => setClaveFormulario(e.target.value)}
              placeholder="Introduce clave"
              autoComplete="off"
            />
            <button type="submit">Desbloquear</button>
          </form>
        ) : (
          <>
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
              <label>
                <input type="checkbox" checked={autoactualizar} onChange={(e) => setAutoactualizar(e.target.checked)} /> Autoactualizar
              </label>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => void cargar()}>Refrescar ahora</button>
              <button onClick={() => void limpiarLogs()}>Limpiar logs</button>
              <button onClick={() => void copiar()}>Copiar bloque</button>
              <button onClick={bloquearVisor}>Bloquear</button>
            </div>
          </>
        )}
        <p>{estado}</p>
        <pre style={{ maxHeight: 480, overflow: "auto", background: "#111", color: "#ddd", padding: 12 }}>{bloque || "Sin datos"}</pre>
      </div>
    </section>
  );
}
