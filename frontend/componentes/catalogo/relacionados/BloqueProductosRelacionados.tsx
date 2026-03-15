import Link from "next/link";

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
                {producto.imagen_url ? (
                  <img src={producto.imagen_url} alt={producto.nombre} loading="lazy" className="botica-natural__imagen" />
                ) : (
                  <div className="botica-natural__imagen botica-natural__imagen--fallback" aria-hidden="true" />
                )}
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
