import Link from "next/link";

import { BotonAgregarCarrito } from "@/componentes/catalogo/cesta/BotonAgregarCarrito";
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
      <nav aria-label="Breadcrumb" className="botica-natural__breadcrumb">
        <Link href="/">Inicio</Link>
        <span>·</span>
        <Link href={urlSeccion}>{nombreSeccion}</Link>
        <span>·</span>
        <span aria-current="page">{producto.nombre}</span>
      </nav>

      <article className="botica-natural__ficha">
        <section className="botica-natural__ficha-media" aria-label={`Imagen de ${producto.nombre}`}>
          {producto.imagen_url ? (
            <img src={producto.imagen_url} alt={producto.nombre} className="botica-natural__imagen-ficha" />
          ) : (
            <div className="botica-natural__imagen-ficha botica-natural__imagen--fallback" aria-hidden="true" />
          )}
        </section>

        <section className="botica-natural__ficha-contenido">
          <p className="botica-natural__eyebrow">{nombreSeccion}</p>
          <h1>{producto.nombre}</h1>
          <p>{producto.descripcion_corta || "Producto publicado en catálogo con información comercial mínima."}</p>
          <p className="botica-natural__precio">{producto.precio_visible || "Precio no disponible"}</p>
          <div className="botica-natural__acciones">
            <BotonAgregarCarrito slugProducto={producto.slug} />
            <Link href={urlSeccion} className="boton boton--secundario">
              Volver a {nombreSeccion}
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
