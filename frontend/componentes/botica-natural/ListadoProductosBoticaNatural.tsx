import { TarjetaProductoBoticaNatural } from "@/componentes/botica-natural/TarjetaProductoBoticaNatural";
import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

type Props = {
  productos: ProductoSeccionPublica[];
};

export function ListadoProductosBoticaNatural({ productos }: Props): JSX.Element {
  if (productos.length === 0) {
    return (
      <section aria-live="polite" className="botica-natural__estado-vacio">
        <h2>Botica Natural sin productos publicados</h2>
        <p>No hay productos públicos en esta sección ahora mismo. Cuando se publiquen en catálogo aparecerán aquí.</p>
      </section>
    );
  }

  return (
    <section aria-label="Productos de Botica Natural" className="botica-natural__contenedor-listado">
      <section className="botica-natural__rejilla">
        {productos.map((producto) => (
          <TarjetaProductoBoticaNatural key={producto.sku} producto={producto} />
        ))}
      </section>
    </section>
  );
}
