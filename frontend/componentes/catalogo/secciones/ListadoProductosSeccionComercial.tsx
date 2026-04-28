import Link from "next/link";

import { TarjetaProductoBoticaNatural } from "@/componentes/botica-natural/TarjetaProductoBoticaNatural";
import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

type Props = {
  productos: ProductoSeccionPublica[];
};

export function ListadoProductosSeccionComercial({ productos }: Props): JSX.Element {
  if (productos.length === 0) {
    return (
      <section aria-live="polite" className="botica-natural__estado-vacio">
        <h2>No hay productos publicados en esta seccion</h2>
        <p>Puedes seguir explorando otras familias o pedir orientacion para una preparacion artesanal.</p>
        <div className="botica-natural__acciones">
          <Link href="/colecciones" className="boton boton--secundario">Seguir explorando</Link>
          <Link href="/encargo?origen=consulta" className="boton boton--secundario">Consulta personalizada</Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Productos de la seccion" className="botica-natural__contenedor-listado">
      <section className="botica-natural__rejilla">
        {productos.map((producto) => (
          <TarjetaProductoBoticaNatural key={producto.sku} producto={producto} />
        ))}
      </section>
    </section>
  );
}
