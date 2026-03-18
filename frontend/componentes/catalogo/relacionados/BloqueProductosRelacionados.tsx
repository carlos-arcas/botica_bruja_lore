import Link from "next/link";

import { ImagenProductoBoticaNatural } from "@/componentes/botica-natural/ImagenProductoBoticaNatural";
import { BotonAgregarCarrito } from "@/componentes/catalogo/cesta/BotonAgregarCarrito";
import { construirHrefFichaProductoPublico } from "@/componentes/catalogo/rutasProductoPublico";
import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

type Props = {
  titulo: string;
  productos: ProductoSeccionPublica[];
};

export function BloqueProductosRelacionados({ titulo, productos }: Props): JSX.Element {
  if (productos.length === 0) return <></>;

  return (
    <section className="bloque-home" aria-label={titulo}>
      <h2>{titulo}</h2>
      <div className="botica-natural__rejilla">
        {productos.map((producto) => {
          const hrefFicha = construirHrefFichaProductoPublico(producto);

          return (
            <article key={producto.sku} className="botica-natural__card">
              <Link href={hrefFicha} className="botica-natural__media-enlace" aria-label={`Abrir ficha de ${producto.nombre}`}>
                <ImagenProductoBoticaNatural
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  className="botica-natural__imagen"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 320px"
                />
              </Link>
              <div className="botica-natural__contenido">
                <h3>{producto.nombre}</h3>
                <p className="botica-natural__precio">{producto.precio_visible}</p>
                <BotonAgregarCarrito slugProducto={producto.slug} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
