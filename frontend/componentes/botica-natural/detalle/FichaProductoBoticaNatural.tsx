import Link from "next/link";

import { EventoVistaProducto } from "@/componentes/analitica/EventoVistaProducto";
import { ImagenProductoBoticaNatural } from "@/componentes/botica-natural/ImagenProductoBoticaNatural";
import { BotonAgregarCarrito } from "@/componentes/catalogo/cesta/BotonAgregarCarrito";
import { EstadoDisponibilidadProducto } from "@/componentes/catalogo/disponibilidad/EstadoDisponibilidadProducto";
import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

type Props = {
  producto: ProductoSeccionPublica;
};

function construirNombreSeccion(slugSeccion: string): string {
  if (slugSeccion === "botica-natural") return "Botica Natural";
  return slugSeccion
    .split("-")
    .filter(Boolean)
    .map((parte) => `${parte[0]?.toUpperCase() ?? ""}${parte.slice(1)}`)
    .join(" ");
}

export function FichaProductoBoticaNatural({ producto }: Props): JSX.Element {
  const nombreSeccion = construirNombreSeccion(producto.seccion_publica);
  const urlSeccion = `/${producto.seccion_publica}`;

  return (
    <>
      <EventoVistaProducto idProducto={producto.sku} slugProducto={producto.slug} />
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
          <p>{producto.descripcion_corta || "Producto publicado en catálogo con información comercial mínima."}</p>
          <p className="botica-natural__precio">{producto.precio_visible || "Precio no disponible"}</p>
          <EstadoDisponibilidadProducto producto={producto} />
          <p>La disponibilidad es orientativa: confirmaremos las unidades al preparar el pedido.</p>
          <div className="botica-natural__acciones">
            {producto.disponible ? <Link href={`/checkout?producto=${producto.slug}`} className="boton boton--principal">Comprar ahora</Link> : <button type="button" className="boton boton--principal" disabled aria-disabled="true">No disponible para compra</button>}
            {producto.disponible ? <BotonAgregarCarrito slugProducto={producto.slug} /> : null}
            {!producto.disponible ? (
              <Link href={`/encargo?origen=consulta&producto=${producto.slug}`} className="boton boton--secundario">
                Consulta personalizada
              </Link>
            ) : null}
            <Link href={urlSeccion} className="boton boton--secundario">
              Volver a {nombreSeccion}
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
