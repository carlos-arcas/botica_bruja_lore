"use client";

import { useMemo, useState } from "react";

import { cambiarPublicacionAdmin, guardarRegistroAdmin } from "@/infraestructura/api/backoffice";

type Props = {
  modulo: "productos" | "rituales" | "editorial" | "secciones";
  titulo: string;
  token?: string;
  itemsIniciales: Record<string, unknown>[];
  plantilla: Record<string, unknown>;
  campoEstado: "publicado" | "publicada";
};

export function ModuloCrudAdmin({ modulo, titulo, token, itemsIniciales, plantilla, campoEstado }: Props): JSX.Element {
  const [items, setItems] = useState(itemsIniciales);
  const [form, setForm] = useState<Record<string, unknown>>(plantilla);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const campos = useMemo(() => Object.keys(plantilla), [plantilla]);

  const editar = (item: Record<string, unknown>) => {
    setForm({ ...item });
    setError("");
    setOk("");
  };

  const guardar = async () => {
    try {
      const guardado = await guardarRegistroAdmin(modulo, form, token);
      const id = guardado.id;
      const existe = items.some((it) => it.id === id);
      setItems(existe ? items.map((it) => (it.id === id ? guardado : it)) : [guardado, ...items]);
      setForm(plantilla);
      setOk("Registro guardado.");
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

  return (
    <section className="admin-contenido">
      <p className="admin-breadcrumb">Admin / {titulo}</p>
      <div className="admin-resumen"><h2>{titulo}</h2></div>
      {ok ? <p className="admin-estado">{ok}</p> : null}
      {error ? <p className="admin-estado admin-estado--error">{error}</p> : null}
      <div className="admin-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <h3>{String(form.id ?? "") ? "Editar" : "Nuevo"}</h3>
          {campos.map((campo) => (
            <label key={campo} style={{ display: "block", marginBottom: 8 }}>
              <span>{campo}</span>
              {typeof plantilla[campo] === "boolean" ? (
                <input type="checkbox" checked={Boolean(form[campo])} onChange={(e) => setForm({ ...form, [campo]: e.target.checked })} />
              ) : (
                <input value={String(form[campo] ?? "")} onChange={(e) => setForm({ ...form, [campo]: e.target.value })} />
              )}
            </label>
          ))}
          <button type="button" onClick={guardar}>Guardar</button>
        </div>
        <div>
          <h3>Listado</h3>
          <table className="admin-tabla">
            <thead><tr><th>Registro</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {items.map((item) => (
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
      </div>
    </section>
  );
}
