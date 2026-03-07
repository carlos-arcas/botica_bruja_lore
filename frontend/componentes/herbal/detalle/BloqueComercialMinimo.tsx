import { ProductoHerbalMinimoPublico } from "@/infraestructura/api/herbal";

type Props = {
  productos: ProductoHerbalMinimoPublico[];
};

export function BloqueComercialMinimo({ productos }: Props): JSX.Element {
  return (
    <section className="bloque-home bloque-home--comercial-minimo">
      <h2>Resolución comercial mínima</h2>
      <p>
        Estos productos herbales conectan la planta con una salida de catálogo básica del Ciclo 1,
        sin abrir checkout ni detalle comercial avanzado.
      </p>

      {productos.length > 0 ? (
        <ul className="ficha-herbal__productos" aria-label="Productos herbales asociados">
          {productos.map((producto) => (
            <li key={producto.sku}>
              <h3>{producto.nombre}</h3>
              <p>SKU demo: {producto.sku}</p>
              <p>
                Tipo: {producto.tipo_producto} · Categoría: {producto.categoria_comercial}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aún no hay productos herbales públicos vinculados a esta planta.</p>
      )}
    </section>
  );
}
