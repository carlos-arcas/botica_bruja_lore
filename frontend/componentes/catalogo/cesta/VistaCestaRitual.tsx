"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  convertirCestaAItemsEncargo,
  resolverSubtotalVisible,
  serializarItemsEncargo,
} from "@/contenido/catalogo/cestaRitual";
import { PRODUCTOS_CATALOGO } from "@/contenido/catalogo/catalogo";

import estilos from "./cestaRitual.module.css";
import { useCarrito } from "./useCarrito";

export function VistaCestaRitual(): JSX.Element {
  const { cesta, totalUnidades, cambiarCantidad, eliminar, limpiar } = useCarrito();

  const enlaceEncargo = useMemo(() => {
    const seleccion = serializarItemsEncargo(convertirCestaAItemsEncargo(cesta));
    return `/encargo?cesta=${seleccion}`;
  }, [cesta]);

  const subtotal = useMemo(() => resolverSubtotalVisible(cesta), [cesta]);

  if (cesta.lineas.length === 0) {
    return (
      <section className="bloque-home">
        <h1>Cesta ritual</h1>
        <p>Tu cesta está vacía. Explora las colecciones y reúne las piezas que deseas consultar juntas.</p>
        <Link href="/colecciones" className="boton boton--principal">Ir a colecciones</Link>
      </section>
    );
  }

  return (
    <section className="bloque-home" aria-labelledby="titulo-cesta-ritual">
      <h1 id="titulo-cesta-ritual">Cesta ritual</h1>
      <p>Revisa tu selección artesanal, ajusta cantidades y deriva la consulta al flujo de encargo.</p>

      <ul className={estilos.listado}>
        {cesta.lineas.map((linea) => {
          const producto = PRODUCTOS_CATALOGO.find((item) => item.slug === linea.slug);
          if (!producto) {
            return null;
          }

          return (
            <li key={linea.slug} className={estilos.linea}>
              <div className={estilos.lineaCabecera}>
                <h2>{producto.nombre}</h2>
                <strong>{producto.precioVisible}</strong>
              </div>
              <p>{producto.subtitulo}</p>
              <div className={estilos.controlesLinea}>
                <label>
                  Cantidad
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={linea.cantidad}
                    onChange={(event) => cambiarCantidad(linea.slug, Number(event.target.value))}
                  />
                </label>
                <button type="button" className="boton boton--secundario" onClick={() => eliminar(linea.slug)}>
                  Quitar
                </button>
                <Link href={`/colecciones/${linea.slug}`} className="boton boton--secundario">Ver ficha</Link>
              </div>
            </li>
          );
        })}
      </ul>

      <article className={estilos.resumen}>
        <p><strong>Total de unidades:</strong> {totalUnidades}</p>
        <p><strong>Referencia editorial:</strong> {subtotal}</p>
        <p>
          Este valor es orientativo para tu selección ritual; la gestión final se concreta en el intercambio artesanal.
        </p>
      </article>

      <div className={estilos.accionesCesta}>
        <a href={enlaceEncargo} className="boton boton--principal">Pasar esta selección a encargo</a>
        <button type="button" className="boton boton--secundario" onClick={limpiar}>Vaciar cesta</button>
        <Link href="/colecciones" className="boton boton--secundario">Seguir explorando</Link>
      </div>
    </section>
  );
}
