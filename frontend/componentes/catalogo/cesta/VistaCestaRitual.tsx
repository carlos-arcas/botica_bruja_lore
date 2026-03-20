"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { convertirCestaALineasSeleccion } from "@/contenido/catalogo/cestaRitual";
import {
  LineaSeleccionEncargo,
  resolverReferenciaEconomicaVisualLinea,
  resolverResumenEconomicoSeleccion,
} from "@/contenido/catalogo/seleccionEncargo";

import estilos from "./cestaRitual.module.css";
import { useCarrito } from "./useCarrito";

export function VistaCestaRitual(): JSX.Element {
  const { cesta, totalUnidades, cambiarCantidad, eliminar, limpiar } =
    useCarrito();
  const lineasSeleccion = useMemo(
    () => convertirCestaALineasSeleccion(cesta),
    [cesta],
  );
  const resumenEconomico = useMemo(
    () => resolverResumenEconomicoSeleccion(lineasSeleccion),
    [lineasSeleccion],
  );

  if (lineasSeleccion.length === 0) {
    return (
      <section className="bloque-home">
        <h1>Mi selección</h1>
        <p>
          No has guardado piezas todavía. Cuando añadas productos o referencias
          editoriales, podrás revisarlas aquí antes de solicitar el encargo.
        </p>
        <Link href="/colecciones" className="boton boton--principal">
          Explorar colecciones
        </Link>
      </section>
    );
  }

  return (
    <section className="bloque-home" aria-labelledby="titulo-mi-seleccion">
      <h1 id="titulo-mi-seleccion">Mi selección</h1>
      <p>
        Revisa cada línea, ajusta cantidades y pasa a la solicitud artesanal con
        una selección clara en lugar de un checkout ficticio.
      </p>

      <ul className={estilos.listado}>
        {lineasSeleccion.map((linea) => (
          <LineaSeleccionCard
            key={linea.id_linea}
            linea={linea}
            onCambiarCantidad={cambiarCantidad}
            onEliminar={eliminar}
          />
        ))}
      </ul>

      <article className={estilos.resumen}>
        <p>
          <strong>Total de unidades:</strong> {totalUnidades}
        </p>
        <p>
          <strong>{resumenEconomico.etiqueta}:</strong>{" "}
          {resumenEconomico.totalVisible ?? "A revisar"}
        </p>
        <p>{resumenEconomico.detalle}</p>
      </article>

      <div className={estilos.accionesCesta}>
        <Link
          href="/encargo?origen=seleccion"
          className="boton boton--principal"
        >
          Continuar con la solicitud de encargo
        </Link>
        <button
          type="button"
          className="boton boton--secundario"
          onClick={limpiar}
        >
          Vaciar selección
        </button>
        <Link href="/colecciones" className="boton boton--secundario">
          Seguir explorando
        </Link>
      </div>
    </section>
  );
}

type LineaSeleccionCardProps = {
  linea: LineaSeleccionEncargo;
  onCambiarCantidad: (idLinea: string, cantidad: number) => void;
  onEliminar: (idLinea: string) => void;
};

function LineaSeleccionCard({
  linea,
  onCambiarCantidad,
  onEliminar,
}: LineaSeleccionCardProps): JSX.Element {
  const referenciaVisual = resolverReferenciaEconomicaVisualLinea(linea);

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
      ) : null}

      <div className={estilos.contenidoLinea}>
        <div className={estilos.lineaCabecera}>
          <div>
            <p className={estilos.tipoLinea}>
              {etiquetaTipoLinea(linea.tipo_linea)}
            </p>
            <h2>{linea.nombre}</h2>
          </div>
          <span className={estilos.cantidadLinea}>
            {linea.cantidad} {linea.cantidad === 1 ? "pieza" : "piezas"}
          </span>
        </div>

        <dl className={estilos.metaLinea}>
          <div>
            <dt>Formato</dt>
            <dd>
              {linea.formato ?? "A definir durante la revisión artesanal"}
            </dd>
          </div>
          <div>
            <dt>Referencia unitaria</dt>
            <dd>
              {referenciaVisual.referenciaUnitaria ??
                "Sin referencia editorial"}
            </dd>
          </div>
          <div>
            <dt>Subtotal orientativo</dt>
            <dd>
              {referenciaVisual.subtotal ?? "Se confirma en la solicitud"}
            </dd>
          </div>
        </dl>

        <p className={estilos.estadoEconomico}>{referenciaVisual.mensaje}</p>
        <p className={estilos.notasLinea}>
          {linea.notas_origen ?? "Sin contexto editorial adicional."}
        </p>

        <div className={estilos.controlesLinea}>
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
          <button
            type="button"
            className="boton boton--secundario"
            onClick={() => onEliminar(linea.id_linea)}
          >
            Quitar línea
          </button>
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

function etiquetaTipoLinea(
  tipo: "catalogo" | "fuera_catalogo" | "sugerencia_editorial",
): string {
  if (tipo === "catalogo") {
    return "Línea de catálogo";
  }
  if (tipo === "fuera_catalogo") {
    return "Pieza fuera de catálogo";
  }
  return "Sugerencia editorial";
}
