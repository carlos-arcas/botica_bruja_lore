"use client";

import Link from "next/link";
import { useMemo } from "react";

import { convertirCestaALineasSeleccion } from "@/contenido/catalogo/cestaRitual";
import { resolverResumenEconomicoSeleccion } from "@/contenido/catalogo/seleccionEncargo";
import { ListaLineasSeleccion } from "@/componentes/catalogo/seleccion/ListaLineasSeleccion";

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

      <ListaLineasSeleccion
        items={lineasSeleccion.map((linea) => ({ linea }))}
        editable
        onCambiarCantidad={cambiarCantidad}
        onEliminar={eliminar}
      />

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
