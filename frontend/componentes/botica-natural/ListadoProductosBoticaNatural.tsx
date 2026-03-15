import Link from "next/link";

import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

type Props = {
  productos: ProductoSeccionPublica[];
};

export function ListadoProductosBoticaNatural({ productos }: Props): JSX.Element {
  if (productos.length === 0) {
    return (
      <section aria-live="polite" className="botica-natural__estado-vacio">
        <h2>Botica Natural sin productos publicados</h2>
        <p>
          No hay productos públicos en esta sección ahora mismo. Cuando se publiquen en catálogo aparecerán aquí.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Productos de Botica Natural" className="botica-natural__rejilla">
      {productos.map((producto) => (
        <article key={producto.sku} className="botica-natural__card">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              loading="lazy"
              className="botica-natural__imagen"
            />
          ) : (
            <div className="botica-natural__imagen botica-natural__imagen--fallback" aria-hidden="true" />
          )}
          <div className="botica-natural__contenido">
            <h2>{producto.nombre}</h2>
            <p>{producto.descripcion_corta}</p>
            <p className="botica-natural__precio">{producto.precio_visible}</p>
            <Link href={`/botica-natural/${producto.slug}`} className="boton boton--secundario">
              Ver detalle
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}
