import Link from "next/link";

import { EstadoDisponibilidadProducto } from "@/componentes/catalogo/disponibilidad/EstadoDisponibilidadProducto";
import { ProductoRelacionadoRitual } from "@/infraestructura/api/rituales";

type Props = {
  productos: ProductoRelacionadoRitual[];
};

export function BloqueResolucionComercialRitual({ productos }: Props): JSX.Element {
  return (
    <section className="bloque-home bloque-home--comercial-minimo">
      <h2>Resolución comercial mínima</h2>
      <p>
        La ficha ritual sugiere una salida de catálogo básica sin convertirse en checkout ni en
        ficha de producto completa.
      </p>

      <p>
        Si quieres comparar formatos antes de consultar, visita el <Link href="/colecciones">listado de colecciones rituales</Link>.
      </p>

      {productos.length > 0 ? (
        <ul className="ficha-ritual__productos" aria-label="Productos relacionados al ritual">
          {productos.map((producto) => (
            <li key={producto.sku}>
              <h3>{producto.nombre}</h3>
              <p>Referencia: {producto.sku}</p>
              <p>
                Tipo: {producto.tipo_producto} · Categoría: {producto.categoria_comercial}
              </p>
              <EstadoDisponibilidadProducto producto={producto} compacta />
            </li>
          ))}
        </ul>
      ) : (
        <p>Aún no hay productos públicos relacionados con este ritual.</p>
      )}
    </section>
  );
}
