import Link from "next/link";

import { AccionesTarjetaProductoBoticaNatural } from "@/componentes/botica-natural/AccionesTarjetaProductoBoticaNatural";
import { ImagenProductoBoticaNatural } from "@/componentes/botica-natural/ImagenProductoBoticaNatural";
import { EstadoDisponibilidadProducto } from "@/componentes/catalogo/disponibilidad/EstadoDisponibilidadProducto";
import { construirHrefFichaProductoPublico } from "@/componentes/catalogo/rutasProductoPublico";
import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

type Props = {
  producto: ProductoSeccionPublica;
};

export function TarjetaProductoBoticaNatural({ producto }: Props): JSX.Element {
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
        <EstadoDisponibilidadProducto producto={producto} compacta />
        <AccionesTarjetaProductoBoticaNatural hrefFicha={hrefFicha} producto={producto} />
      </div>
    </article>
  );
}
