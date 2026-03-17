import { PanelFiltrosBoticaNatural } from "@/componentes/botica-natural/filtros/PanelFiltrosBoticaNatural";
import { TarjetaProductoBoticaNatural } from "@/componentes/botica-natural/TarjetaProductoBoticaNatural";
import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

type Props = {
  productos: ProductoSeccionPublica[];
  filtrosActivos: { beneficio: string; formato: string; modo_uso: string; precio_min: string; precio_max: string };
};

export function ListadoProductosBoticaNatural({ productos, filtrosActivos }: Props): JSX.Element {
  if (productos.length === 0) {
    return (
      <section aria-live="polite" className="botica-natural__estado-vacio">
        <h2>Botica Natural sin productos publicados</h2>
        <p>No hay productos públicos en esta sección ahora mismo. Cuando se publiquen en catálogo aparecerán aquí.</p>
      </section>
    );
  }

  return (
    <section className="botica-natural__layout-filtros">
      <aside className="botica-natural__filtros" aria-label="Filtros de Botica Natural">
        <h2>Filtrar catálogo</h2>
        <PanelFiltrosBoticaNatural filtrosActivos={filtrosActivos} />
      </aside>
      <section aria-label="Productos de Botica Natural" className="botica-natural__rejilla">
        {productos.map((producto) => (
          <TarjetaProductoBoticaNatural key={producto.sku} producto={producto} />
        ))}
      </section>
    </section>
  );
}
