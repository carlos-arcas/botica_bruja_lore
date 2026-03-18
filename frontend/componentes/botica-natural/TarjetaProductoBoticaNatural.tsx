"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ImagenProductoBoticaNatural } from "@/componentes/botica-natural/ImagenProductoBoticaNatural";

import { useCarrito } from "@/componentes/catalogo/cesta/useCarrito";
import { construirHrefFichaProductoPublico } from "@/componentes/catalogo/rutasProductoPublico";
import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

import { ControlUnidadesBoticaNatural } from "./ControlUnidadesBoticaNatural";

type Props = {
  producto: ProductoSeccionPublica;
};

const CANTIDAD_MINIMA = 1;
const CANTIDAD_MAXIMA = 12;

export function TarjetaProductoBoticaNatural({ producto }: Props): JSX.Element {
  const { agregarAlCarrito } = useCarrito();
  const [cantidad, setCantidad] = useState(CANTIDAD_MINIMA);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (!agregado) {
      return;
    }

    const temporizador = window.setTimeout(() => setAgregado(false), 1800);
    return () => window.clearTimeout(temporizador);
  }, [agregado]);

  const disminuir = (): void => setCantidad((anterior) => Math.max(CANTIDAD_MINIMA, anterior - 1));
  const aumentar = (): void => setCantidad((anterior) => Math.min(CANTIDAD_MAXIMA, anterior + 1));

  const manejarAgregarCarrito = (): void => {
    agregarAlCarrito(producto.slug, cantidad);
    setAgregado(true);
  };

  const hrefFicha = construirHrefFichaProductoPublico(producto);

  return (
    <article className="botica-natural__card">
      <Link href={hrefFicha} className="botica-natural__media-enlace" aria-label={`Abrir ficha de ${producto.nombre}`}>
        <ImagenProductoBoticaNatural
          src={producto.imagen_url}
          alt={producto.nombre}
          className="botica-natural__imagen"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
        />
      </Link>
      <div className="botica-natural__contenido">
        <h2>{producto.nombre}</h2>
        <p className="botica-natural__descripcion">{producto.descripcion_corta}</p>
        <p className="botica-natural__precio">{producto.precio_visible}</p>
        <div className="botica-natural__acciones" data-testid="botica-natural-acciones-card">
          <ControlUnidadesBoticaNatural cantidad={cantidad} alDisminuir={disminuir} alAumentar={aumentar} />
          <div className="botica-natural__acciones-cta">
            <Link href={hrefFicha} className="boton boton--secundario">
              Ver detalle
            </Link>
            <button type="button" className="boton boton--principal" onClick={manejarAgregarCarrito}>
              Agregar al carrito
            </button>
          </div>
          {agregado && <p className="botica-natural__estado-carrito">Producto agregado al carrito.</p>}
        </div>
      </div>
    </article>
  );
}
