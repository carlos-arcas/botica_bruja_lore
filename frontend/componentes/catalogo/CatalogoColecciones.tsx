"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  OPCIONES_CATEGORIA,
  OPCIONES_INTENCION,
  PRODUCTOS_CATALOGO,
} from "@/contenido/catalogo/catalogo";
import {
  deserializarEstadoCatalogoDesdeObjeto,
  ESTADO_CATALOGO_DEFECTO,
  EstadoCatalogo,
  serializarEstadoCatalogo,
} from "@/contenido/catalogo/estadoCatalogoUrl";
import { OrdenCatalogo, resolverCatalogo } from "@/contenido/catalogo/filtrosCatalogo";

import estilos from "./catalogo.module.css";
import { TarjetaCatalogo } from "./TarjetaCatalogo";

const OPCIONES_ORDEN: { valor: OrdenCatalogo; etiqueta: string }[] = [
  { valor: "destacados", etiqueta: "Destacados" },
  { valor: "precio-asc", etiqueta: "Precio ascendente" },
  { valor: "nombre-asc", etiqueta: "Nombre A-Z" },
];

type Props = {
  searchParamsIniciales?: { q?: string; in?: string; cat?: string; ord?: string };
};

export function CatalogoColecciones({ searchParamsIniciales }: Props): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();

  const [estado, setEstado] = useState<EstadoCatalogo>(() =>
    deserializarEstadoCatalogoDesdeObjeto(searchParamsIniciales),
  );

  const productosVisibles = useMemo(
    () => resolverCatalogo(PRODUCTOS_CATALOGO, estado.intencion, estado.categoria, estado.orden, estado.busqueda),
    [estado],
  );

  const resumenActivos = construirResumenFiltros(estado.busqueda, estado.intencion, estado.categoria, estado.orden);

  function actualizarEstado(parcial: Partial<EstadoCatalogo>): void {
    const siguiente = { ...estado, ...parcial };
    setEstado(siguiente);
    const query = serializarEstadoCatalogo(siguiente);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

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
          Buscar en el catálogo
          <input
            type="search"
            value={estado.busqueda}
            placeholder="Ejemplo: lavanda, meditación, pack regalo"
            onChange={(event) => actualizarEstado({ busqueda: event.target.value })}
          />
        </label>

        <label>
          Intención
          <select value={estado.intencion} onChange={(event) => actualizarEstado({ intencion: event.target.value })}>
            {OPCIONES_INTENCION.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
            ))}
          </select>
        </label>

        <label>
          Formato
          <select value={estado.categoria} onChange={(event) => actualizarEstado({ categoria: event.target.value })}>
            {OPCIONES_CATEGORIA.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
            ))}
          </select>
        </label>

        <label>
          Ordenar por
          <select value={estado.orden} onChange={(event) => actualizarEstado({ orden: event.target.value as OrdenCatalogo })}>
            {OPCIONES_ORDEN.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</option>
            ))}
          </select>
        </label>
      </div>

      <div className={estilos.resumenControles}>
        <p>{resumenActivos}</p>
        <button type="button" className="boton boton--secundario" onClick={() => actualizarEstado(ESTADO_CATALOGO_DEFECTO)}>
          Limpiar búsqueda y filtros
        </button>
      </div>

      {productosVisibles.length === 0 ? (
        <div className={estilos.vacio} role="status">
          <h2>No encontramos coincidencias para esta combinación</h2>
          <p>Prueba con otro término o limpia filtros para volver al recorrido completo de la colección ritual.</p>
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

function construirResumenFiltros(busqueda: string, intencion: string, categoria: string, orden: OrdenCatalogo): string {
  const partes: string[] = [];

  if (busqueda.trim()) partes.push(`búsqueda: “${busqueda.trim()}”`);
  if (intencion !== "todas") partes.push(`intención: ${intencion}`);
  if (categoria !== "todas") partes.push(`formato: ${categoria}`);
  if (orden !== "destacados") partes.push(`orden: ${orden}`);

  if (partes.length === 0) {
    return "Vista completa activa: todas las colecciones rituales destacadas.";
  }

  return `Filtros activos · ${partes.join(" · ")}`;
}
