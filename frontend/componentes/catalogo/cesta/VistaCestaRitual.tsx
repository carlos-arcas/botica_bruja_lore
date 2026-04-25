"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  convertirCestaAItemsEncargo,
  convertirCestaALineasSeleccion,
  serializarItemsEncargo,
} from "@/contenido/catalogo/cestaRitual";
import { resolverResumenEconomicoSeleccion } from "@/contenido/catalogo/seleccionEncargo";
import { ListaLineasSeleccion } from "@/componentes/catalogo/seleccion/ListaLineasSeleccion";

import estilos from "./cestaRitual.module.css";
import { useCarrito } from "./useCarrito";

export function VistaCestaRitual(): JSX.Element {
  const { cesta, totalUnidades, cambiarCantidad, eliminar, limpiar } = useCarrito();
  const lineasSeleccion = useMemo(() => convertirCestaALineasSeleccion(cesta), [cesta]);
  const resumenEconomico = useMemo(
    () => resolverResumenEconomicoSeleccion(lineasSeleccion),
    [lineasSeleccion],
  );
  const rutaCheckout = useMemo(() => {
    const cestaSerializada = serializarItemsEncargo(convertirCestaAItemsEncargo(cesta));
    return cestaSerializada ? `/checkout?cesta=${cestaSerializada}` : "/checkout";
  }, [cesta]);

  if (lineasSeleccion.length === 0) {
    return (
      <section className="bloque-home">
        <h1>Carrito</h1>
        <p>
          No has guardado piezas todavia. Cuando anadas productos o referencias
          editoriales, podras revisarlas aqui antes de pasar al checkout.
        </p>
        <Link href="/botica-natural" className="boton boton--principal">
          Ir a la tienda
        </Link>
      </section>
    );
  }

  return (
    <section className="bloque-home" aria-labelledby="titulo-carrito">
      <h1 id="titulo-carrito">Carrito</h1>
      <p>
        Revisa cada linea, ajusta cantidades y continua al checkout con una
        seleccion clara de productos y articulos relacionados.
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
        <Link href={rutaCheckout} className="boton boton--principal">
          Continuar al checkout
        </Link>
        <button
          type="button"
          className="boton boton--secundario"
          onClick={limpiar}
        >
          Vaciar carrito
        </button>
        <Link href="/botica-natural" className="boton boton--secundario">
          Seguir explorando
        </Link>
      </div>
    </section>
  );
}
