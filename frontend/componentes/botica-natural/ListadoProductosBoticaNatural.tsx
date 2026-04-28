import {
  BOTICA_NATURAL_PUBLICA,
  type ConfiguracionSeccionPublica,
} from "@/componentes/botica-natural/contratoSeccionPublica";
import { TarjetaProductoBoticaNatural } from "@/componentes/botica-natural/TarjetaProductoBoticaNatural";
import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

export type PropsListadoSeccionPublica = {
  productos: ProductoSeccionPublica[];
  configuracionSeccion?: ConfiguracionSeccionPublica;
};

export function ListadoProductosBoticaNatural({
  productos,
  configuracionSeccion = BOTICA_NATURAL_PUBLICA,
}: PropsListadoSeccionPublica): JSX.Element {
  if (productos.length === 0) {
    return (
      <section aria-live="polite" className="botica-natural__estado-vacio">
        <h2>{configuracionSeccion.tituloVacio}</h2>
        <p>{configuracionSeccion.descripcionVacio}</p>
      </section>
    );
  }

  return (
    <section aria-label={`Productos de ${configuracionSeccion.nombre}`} className="botica-natural__contenedor-listado">
      <section className="botica-natural__rejilla">
        {productos.map((producto) => (
          <TarjetaProductoBoticaNatural key={producto.sku} producto={producto} />
        ))}
      </section>
    </section>
  );
}
