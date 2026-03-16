import { TarjetaProductoBoticaNatural } from "@/componentes/botica-natural/TarjetaProductoBoticaNatural";
import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

type Props = {
  productos: ProductoSeccionPublica[];
  filtrosActivos: { beneficio: string; formato: string; modo_uso: string; precio_min: string; precio_max: string };
};

function opcionUnica(productos: ProductoSeccionPublica[], clave: "beneficio_principal" | "formato_comercial" | "modo_uso") {
  return Array.from(new Set(productos.map((item) => item[clave]).filter(Boolean))).sort();
}

export function ListadoProductosBoticaNatural({ productos, filtrosActivos }: Props): JSX.Element {
  if (productos.length === 0) {
    return (
      <section aria-live="polite" className="botica-natural__estado-vacio">
        <h2>Botica Natural sin productos publicados</h2>
        <p>No hay productos públicos en esta sección ahora mismo. Cuando se publiquen en catálogo aparecerán aquí.</p>
      </section>
    );
  }

  const beneficios = opcionUnica(productos, "beneficio_principal");
  const formatos = opcionUnica(productos, "formato_comercial");
  const modos = opcionUnica(productos, "modo_uso");

  return (
    <section className="botica-natural__layout-filtros">
      <aside className="botica-natural__filtros" aria-label="Filtros de Botica Natural">
        <h2>Filtrar catálogo</h2>
        <p>Beneficio</p>
        <ul>{beneficios.map((it) => <li key={it}>{it}</li>)}</ul>
        <p>Formato</p>
        <ul>{formatos.map((it) => <li key={it}>{it}</li>)}</ul>
        <p>Modo de uso</p>
        <ul>{modos.map((it) => <li key={it}>{it}</li>)}</ul>
        <p>Precio: {filtrosActivos.precio_min || "0"} - {filtrosActivos.precio_max || "∞"}</p>
      </aside>
      <section aria-label="Productos de Botica Natural" className="botica-natural__rejilla">
        {productos.map((producto) => (
          <TarjetaProductoBoticaNatural key={producto.sku} producto={producto} />
        ))}
      </section>
    </section>
  );
}
