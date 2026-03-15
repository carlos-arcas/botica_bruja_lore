"use client";

import { useMemo, useState } from "react";

type ProductoRelacionado = {
  id: string;
  nombre: string;
  sku: string;
};

type Props = {
  valor: unknown;
  onCambio: (valor: string[]) => void;
  opciones: { etiqueta: string; valor: string }[];
};

function normalizarIds(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter((item): item is string => typeof item === "string");
}

function normalizarOpciones(opciones: { etiqueta: string; valor: string }[]): ProductoRelacionado[] {
  return opciones
    .filter((item) => Boolean(item.valor))
    .map((item) => {
      const [nombre = item.etiqueta, sku = ""] = item.etiqueta.split(" · ");
      return { id: item.valor, nombre: nombre.trim(), sku: sku.trim() };
    });
}

export function SelectorProductosRelacionados({ valor, onCambio, opciones }: Props): JSX.Element {
  const [busqueda, setBusqueda] = useState("");
  const idsSeleccionados = useMemo(() => normalizarIds(valor), [valor]);
  const productos = useMemo(() => normalizarOpciones(opciones), [opciones]);
  const seleccionados = productos.filter((item) => idsSeleccionados.includes(item.id));
  const disponibles = productos.filter((item) => {
    if (idsSeleccionados.includes(item.id)) return false;
    const consulta = busqueda.trim().toLowerCase();
    if (!consulta) return true;
    return item.nombre.toLowerCase().includes(consulta) || item.sku.toLowerCase().includes(consulta);
  });

  const agregar = (id: string): void => {
    if (idsSeleccionados.includes(id)) return;
    onCambio([...idsSeleccionados, id]);
  };

  const quitar = (id: string): void => {
    onCambio(idsSeleccionados.filter((item) => item !== id));
  };

  return (
    <div className="admin-selector-productos">
      <input
        className="admin-input"
        placeholder="Buscar producto por nombre o SKU"
        value={busqueda}
        onChange={(event) => setBusqueda(event.target.value)}
      />

      {seleccionados.length > 0 ? (
        <div className="admin-chips-productos" aria-label="Productos seleccionados">
          {seleccionados.map((producto) => (
            <button
              key={producto.id}
              type="button"
              className="admin-chip-producto"
              onClick={() => quitar(producto.id)}
            >
              {producto.nombre}
              <span aria-hidden="true"> ×</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="admin-subtexto">No hay productos asociados todavía.</p>
      )}

      <ul className="admin-lista-productos-disponibles" aria-label="Productos disponibles">
        {disponibles.slice(0, 20).map((producto) => (
          <li key={producto.id}>
            <button type="button" className="admin-boton admin-boton--secundario" onClick={() => agregar(producto.id)}>
              {producto.nombre}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
