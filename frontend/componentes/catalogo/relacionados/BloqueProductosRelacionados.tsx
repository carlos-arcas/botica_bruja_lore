import { BotonAnadirCestaRitual } from "@/componentes/catalogo/cesta/BotonAnadirCestaRitual";
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
        {productos.map((producto) => (
          <article key={producto.sku} className="botica-natural__card">
            {producto.imagen_url ? (
              <img src={producto.imagen_url} alt={producto.nombre} loading="lazy" className="botica-natural__imagen" />
            ) : (
              <div className="botica-natural__imagen botica-natural__imagen--fallback" aria-hidden="true" />
            )}
            <div className="botica-natural__contenido">
              <h3>{producto.nombre}</h3>
              <p className="botica-natural__precio">{producto.precio_visible}</p>
              <BotonAnadirCestaRitual slugProducto={producto.slug} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
