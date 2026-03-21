"use client";

import Image from "next/image";
import Link from "next/link";

import {
  LineaSeleccionEncargo,
  resolverReferenciaEconomicaVisualLinea,
} from "@/contenido/catalogo/seleccionEncargo";

import estilos from "./listaLineasSeleccion.module.css";

export type EstadoVisualLineaSeleccion = {
  etiqueta: string;
  descripcion?: string;
  tono?: "neutro" | "convertible" | "bloqueada";
};

export type ItemListaLineasSeleccion = {
  linea: LineaSeleccionEncargo;
  estado?: EstadoVisualLineaSeleccion;
};

type Props = {
  items: ItemListaLineasSeleccion[];
  editable?: boolean;
  onCambiarCantidad?: (idLinea: string, cantidad: number) => void;
  onEliminar?: (idLinea: string) => void;
  claseLista?: string;
};

export function ListaLineasSeleccion({
  items,
  editable = false,
  onCambiarCantidad,
  onEliminar,
  claseLista,
}: Props): JSX.Element {
  return (
    <ul className={claseLista ?? estilos.listado}>
      {items.map(({ linea, estado }) => (
        <LineaSeleccionCard
          key={linea.id_linea}
          linea={linea}
          estado={estado}
          editable={editable}
          onCambiarCantidad={onCambiarCantidad}
          onEliminar={onEliminar}
        />
      ))}
    </ul>
  );
}

type LineaSeleccionCardProps = {
  linea: LineaSeleccionEncargo;
  estado?: EstadoVisualLineaSeleccion;
  editable: boolean;
  onCambiarCantidad?: (idLinea: string, cantidad: number) => void;
  onEliminar?: (idLinea: string) => void;
};

function LineaSeleccionCard({
  linea,
  estado,
  editable,
  onCambiarCantidad,
  onEliminar,
}: LineaSeleccionCardProps): JSX.Element {
  const referenciaVisual = resolverReferenciaEconomicaVisualLinea(linea);
  const tonoEstado = estado?.tono ?? "neutro";

  return (
    <li className={estilos.linea}>
      {linea.imagen_url ? (
        <div className={estilos.mediaLinea}>
          <Image
            src={linea.imagen_url}
            alt={`Imagen editorial de ${linea.nombre}`}
            className={estilos.imagenLinea}
            width={640}
            height={400}
            unoptimized
          />
        </div>
      ) : (
        <div className={estilos.mediaFallback}>
          <span>Sin imagen editorial</span>
        </div>
      )}

      <div className={estilos.contenidoLinea}>
        <div className={estilos.lineaCabecera}>
          <div>
            <p className={estilos.tipoLinea}>{etiquetaTipoLinea(linea.tipo_linea)}</p>
            <h2>{linea.nombre}</h2>
          </div>
          <span className={estilos.cantidadLinea}>
            {linea.cantidad} {linea.cantidad === 1 ? "pieza" : "piezas"}
          </span>
        </div>

        {estado ? (
          <div className={`${estilos.estadoLinea} ${estilos[`tono${capitalizar(tonoEstado)}`]}`}>
            <p>{estado.etiqueta}</p>
            {estado.descripcion ? <span>{estado.descripcion}</span> : null}
          </div>
        ) : null}

        <dl className={estilos.metaLinea}>
          <div>
            <dt>Formato</dt>
            <dd>{linea.formato ?? "A definir durante la revisión artesanal"}</dd>
          </div>
          <div>
            <dt>Referencia unitaria</dt>
            <dd>{referenciaVisual.referenciaUnitaria ?? "Sin referencia editorial"}</dd>
          </div>
          <div>
            <dt>Subtotal orientativo</dt>
            <dd>{referenciaVisual.subtotal ?? "Se confirma en la solicitud"}</dd>
          </div>
        </dl>

        <p className={estilos.estadoEconomico}>{referenciaVisual.mensaje}</p>
        <p className={estilos.notasLinea}>
          {linea.notas_origen ?? "Sin contexto editorial adicional."}
        </p>

        <div className={estilos.controlesLinea}>
          {editable && onCambiarCantidad ? (
            <label>
              Cantidad
              <input
                type="number"
                min={1}
                max={12}
                value={linea.cantidad}
                onChange={(event) =>
                  onCambiarCantidad(linea.id_linea, Number(event.target.value))
                }
              />
            </label>
          ) : null}
          {editable && onEliminar ? (
            <button
              type="button"
              className="boton boton--secundario"
              onClick={() => onEliminar(linea.id_linea)}
            >
              Quitar línea
            </button>
          ) : null}
          {linea.slug ? (
            <Link
              href={`/colecciones/${linea.slug}`}
              className="boton boton--secundario"
            >
              Ver ficha
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function etiquetaTipoLinea(tipo: LineaSeleccionEncargo["tipo_linea"]): string {
  if (tipo === "catalogo") {
    return "Línea de catálogo";
  }
  if (tipo === "fuera_catalogo") {
    return "Pieza fuera de catálogo";
  }
  return "Sugerencia editorial";
}

function capitalizar(texto: string): string {
  return `${texto.slice(0, 1).toUpperCase()}${texto.slice(1)}`;
}
