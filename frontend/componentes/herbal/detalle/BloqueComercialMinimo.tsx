import { ProductoHerbalMinimoPublico } from "@/infraestructura/api/herbal";

type Props = {
  productos: ProductoHerbalMinimoPublico[];
};

export function BloqueComercialMinimo({ productos }: Props): JSX.Element {
  return (
    <section className="bloque-home bloque-home--comercial-minimo">
      <h2>Selección comercial</h2>
      <p>
        Productos de la botica vinculados a esta planta para preparar una compra o una consulta artesanal.</p>

      {productos.length > 0 ? (
        <ul className="ficha-herbal__productos" aria-label="Productos herbales asociados">
          {productos.map((producto) => (
            <li key={producto.sku}>
              <h3>{producto.nombre}</h3>
              <p>Referencia: {producto.sku}</p>
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
