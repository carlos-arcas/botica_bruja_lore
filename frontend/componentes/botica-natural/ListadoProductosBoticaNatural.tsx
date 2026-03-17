import { TarjetaProductoBoticaNatural } from "@/componentes/botica-natural/TarjetaProductoBoticaNatural";
import { BENEFICIOS_BOTICA, FORMATOS_BOTICA, MODOS_USO_BOTICA } from "@/contenido/catalogo/taxonomiasBoticaNatural";
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
        <form method="get" className="botica-natural__filtros-formulario">
          <label>
            Beneficio
            <select name="beneficio" defaultValue={filtrosActivos.beneficio}>
              <option value="">Todos</option>
              {BENEFICIOS_BOTICA.map((it) => <option key={it.valor} value={it.valor}>{it.etiqueta}</option>)}
            </select>
          </label>
          <label>
            Formato
            <select name="formato" defaultValue={filtrosActivos.formato}>
              <option value="">Todos</option>
              {FORMATOS_BOTICA.map((it) => <option key={it.valor} value={it.valor}>{it.etiqueta}</option>)}
            </select>
          </label>
          <label>
            Modo de uso
            <select name="modo_uso" defaultValue={filtrosActivos.modo_uso}>
              <option value="">Todos</option>
              {MODOS_USO_BOTICA.map((it) => <option key={it.valor} value={it.valor}>{it.etiqueta}</option>)}
            </select>
          </label>
          <label>
            Precio mínimo (€)
            <input name="precio_min" inputMode="decimal" defaultValue={filtrosActivos.precio_min} />
          </label>
          <label>
            Precio máximo (€)
            <input name="precio_max" inputMode="decimal" defaultValue={filtrosActivos.precio_max} />
          </label>
          <button type="submit" className="boton boton--secundario">Aplicar</button>
        </form>
      </aside>
      <section aria-label="Productos de Botica Natural" className="botica-natural__rejilla">
        {productos.map((producto) => (
          <TarjetaProductoBoticaNatural key={producto.sku} producto={producto} />
        ))}
      </section>
    </section>
  );
}
