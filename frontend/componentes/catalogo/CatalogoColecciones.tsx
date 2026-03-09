"use client";

import { useMemo, useState } from "react";

import {
  OPCIONES_CATEGORIA,
  OPCIONES_INTENCION,
  PRODUCTOS_CATALOGO,
} from "@/contenido/catalogo/catalogo";
import { OrdenCatalogo, resolverCatalogo } from "@/contenido/catalogo/filtrosCatalogo";

import estilos from "./catalogo.module.css";
import { TarjetaCatalogo } from "./TarjetaCatalogo";

const OPCIONES_ORDEN: { valor: OrdenCatalogo; etiqueta: string }[] = [
  { valor: "destacados", etiqueta: "Destacados" },
  { valor: "precio-asc", etiqueta: "Precio ascendente" },
  { valor: "nombre-asc", etiqueta: "Nombre A-Z" },
];

export function CatalogoColecciones(): JSX.Element {
  const [intencionActiva, setIntencionActiva] = useState("todas");
  const [categoriaActiva, setCategoriaActiva] = useState("todas");
  const [ordenActivo, setOrdenActivo] = useState<OrdenCatalogo>("destacados");

  const productosVisibles = useMemo(
    () => resolverCatalogo(PRODUCTOS_CATALOGO, intencionActiva, categoriaActiva, ordenActivo),
    [intencionActiva, categoriaActiva, ordenActivo],
  );

  return (
    <section className="bloque-home" aria-labelledby="titulo-colecciones">
      <div className={estilos.cabecera}>
        <p className={estilos.eyebrow}>Catálogo ritual · primer bloque navegable</p>
        <h1 id="titulo-colecciones">Colecciones de la botica</h1>
        <p>
          Selección editorial-comercial de piezas rituales para comprar con criterio y descubrir formatos por intención.
        </p>
      </div>

      <div className={estilos.controles}>
        <label>
          Intención
          <select value={intencionActiva} onChange={(event) => setIntencionActiva(event.target.value)}>
            {OPCIONES_INTENCION.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
            ))}
          </select>
        </label>

        <label>
          Formato
          <select value={categoriaActiva} onChange={(event) => setCategoriaActiva(event.target.value)}>
            {OPCIONES_CATEGORIA.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
            ))}
          </select>
        </label>

        <label>
          Ordenar por
          <select value={ordenActivo} onChange={(event) => setOrdenActivo(event.target.value as OrdenCatalogo)}>
            {OPCIONES_ORDEN.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
            ))}
          </select>
        </label>
      </div>

      {productosVisibles.length === 0 ? (
        <div className={estilos.vacio} role="status">
          <h2>Sin resultados con estos filtros</h2>
          <p>Ajusta intención o formato para descubrir nuevas combinaciones de la colección ritual.</p>
        </div>
      ) : (
        <ul className={estilos.rejilla}>
          {productosVisibles.map((producto) => (
            <TarjetaCatalogo key={producto.id} producto={producto} />
          ))}
        </ul>
      )}
    </section>
  );
}
