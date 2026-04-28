"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCarrito } from "@/componentes/catalogo/cesta/useCarrito";
import { emitirEventoEmbudoLocal } from "@/contenido/analitica/embudoLocal";
import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

import { ControlUnidadesBoticaNatural } from "./ControlUnidadesBoticaNatural";

type Props = {
  hrefFicha: string;
  producto: ProductoSeccionPublica;
};

const CANTIDAD_MINIMA = 1;
const CANTIDAD_MAXIMA = 12;

export function AccionesTarjetaProductoBoticaNatural({
  hrefFicha,
  producto,
}: Props): JSX.Element {
  const { agregarAlCarrito } = useCarrito();
  const [cantidad, setCantidad] = useState(CANTIDAD_MINIMA);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (!agregado) return;
    const temporizador = window.setTimeout(() => setAgregado(false), 1800);
    return () => window.clearTimeout(temporizador);
  }, [agregado]);

  const manejarAgregarCarrito = (): void => {
    agregarAlCarrito(producto.slug, cantidad);
    emitirEventoEmbudoLocal("producto_anadido_cesta", {
      id_producto: producto.sku,
      slug_producto: producto.slug,
      cantidad,
      ruta: window.location.pathname,
    });
    setAgregado(true);
  };

  return (
    <div className="botica-natural__acciones" data-testid="botica-natural-acciones-card">
      <ControlUnidadesBoticaNatural
        cantidad={cantidad}
        alDisminuir={() => setCantidad((anterior) => Math.max(CANTIDAD_MINIMA, anterior - 1))}
        alAumentar={() => setCantidad((anterior) => Math.min(CANTIDAD_MAXIMA, anterior + 1))}
      />
      <div className="botica-natural__acciones-cta">
        <Link href={hrefFicha} className="boton boton--secundario">
          Ver detalle
        </Link>
        <button
          type="button"
          className="boton boton--principal"
          onClick={manejarAgregarCarrito}
          disabled={!producto.disponible}
          aria-disabled={!producto.disponible}
        >
          {producto.disponible ? "Agregar al carrito" : "No disponible"}
        </button>
      </div>
      {agregado ? <p className="botica-natural__estado-carrito">Producto agregado al carrito.</p> : null}
    </div>
  );
}
