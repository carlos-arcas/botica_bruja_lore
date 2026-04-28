import Link from "next/link";

import {
  construirHrefSeccionPublicaVisible,
  construirNombreSeccionPublica,
} from "@/componentes/botica-natural/contratoSeccionPublica";
import { ImagenProductoBoticaNatural } from "@/componentes/botica-natural/ImagenProductoBoticaNatural";
import { BotonAgregarCarrito } from "@/componentes/catalogo/cesta/BotonAgregarCarrito";
import { EstadoDisponibilidadProducto } from "@/componentes/catalogo/disponibilidad/EstadoDisponibilidadProducto";
import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

type Props = {
  producto: ProductoSeccionPublica;
};

export function FichaProductoBoticaNatural({ producto }: Props): JSX.Element {
  const nombreSeccion = construirNombreSeccionPublica(producto.seccion_publica);
  const urlSeccion = construirHrefSeccionPublicaVisible(producto.seccion_publica);

  return (
    <>
      <nav aria-label="Breadcrumb" className="botica-natural__breadcrumb">
        <Link href="/">Inicio</Link>
        <span>·</span>
        <Link href={urlSeccion}>{nombreSeccion}</Link>
        <span>·</span>
        <span aria-current="page">{producto.nombre}</span>
      </nav>

      <article className="botica-natural__ficha">
        <section className="botica-natural__ficha-media" aria-label={`Imagen de ${producto.nombre}`}>
          <ImagenProductoBoticaNatural
            src={producto.imagen_url}
            alt={producto.nombre}
            className="botica-natural__imagen-ficha"
            sizes="(max-width: 900px) 100vw, 50vw"
            prioridad
            variante="ficha"
          />
        </section>

        <section className="botica-natural__ficha-contenido">
          <p className="botica-natural__eyebrow">{nombreSeccion}</p>
          <h1>{producto.nombre}</h1>
          <p>{producto.descripcion_corta || "Producto publicado en catalogo con informacion comercial minima."}</p>
          <p className="botica-natural__precio">{producto.precio_visible || "Precio no disponible"}</p>
          <EstadoDisponibilidadProducto producto={producto} />
          <p>La disponibilidad publica es informativa: no reserva unidades y el backend vuelve a validar el stock al crear el pedido.</p>
          <div className="botica-natural__acciones">
            {producto.disponible ? (
              <BotonAgregarCarrito slugProducto={producto.slug} />
            ) : (
              <button type="button" className="boton boton--principal" disabled aria-disabled="true">
                No disponible para compra
              </button>
            )}
            <Link href={urlSeccion} className="boton boton--secundario">
              Volver a {nombreSeccion}
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
