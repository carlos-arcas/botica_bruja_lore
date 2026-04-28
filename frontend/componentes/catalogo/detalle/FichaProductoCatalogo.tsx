import Link from "next/link";

import {
  obtenerEtiquetaCategoria,
  obtenerEtiquetaIntencion,
  obtenerGuiaRitual,
  obtenerProductosRelacionados,
} from "@/contenido/catalogo/detalleCatalogo";
import { ProductoCatalogo } from "@/contenido/catalogo/catalogo";
import { EventoVistaProducto } from "@/componentes/analitica/EventoVistaProducto";
import { BotonAgregarCarrito } from "@/componentes/catalogo/cesta/BotonAgregarCarrito";
import { resolverMensajeDisponibilidad } from "@/contenido/catalogo/disponibilidadStock";

import estilos from "./fichaProductoCatalogo.module.css";

type Props = {
  producto: ProductoCatalogo;
};

export function FichaProductoCatalogo({ producto }: Props): JSX.Element {
  const relacionados = obtenerProductosRelacionados(producto, undefined, 4);
  const guiaRitual = obtenerGuiaRitual(producto.intencion);
  const mensajeDisponibilidad = resolverMensajeDisponibilidad(producto);

  return (
    <>
      <EventoVistaProducto idProducto={producto.id} slugProducto={producto.slug} />
      <nav aria-label="Breadcrumb" className={estilos.breadcrumb}>
        <Link href="/">Inicio</Link>
        <span>·</span>
        <Link href="/colecciones">Colecciones</Link>
        <span>·</span>
        <span aria-current="page">{producto.nombre}</span>
      </nav>

      <section className="bloque-home">
        <p className={estilos.eyebrow}>Coleccion editorial-comercial</p>
        <h1>{producto.nombre}</h1>
        <p className={estilos.subtitulo}>{producto.subtitulo}</p>
        <p>{producto.descripcion}</p>
        <p>
          Navegacion relacionada: <Link href="/colecciones">colecciones</Link>,{" "}
          <Link href="/hierbas">fichas herbales</Link> y <Link href="/rituales">fichas rituales</Link>.
        </p>

        <div className={estilos.resumenComercial}>
          <p><strong>Precio:</strong> {producto.precioVisible}</p>
          <p><strong>Disponibilidad:</strong> {producto.disponible ? "Disponible" : "Sin stock"}</p>
          <p><strong>Intencion:</strong> {obtenerEtiquetaIntencion(producto.intencion)}</p>
          <p><strong>Formato:</strong> {obtenerEtiquetaCategoria(producto.categoria)}</p>
        </div>

        <ul className={estilos.etiquetas} aria-label="Etiquetas del producto">
          {producto.etiquetas.map((etiqueta) => (
            <li key={`${producto.id}-${etiqueta}`}>{etiqueta}</li>
          ))}
        </ul>
      </section>

      <section className="bloque-home">
        <h2>Perfil sensorial y composicion editorial</h2>
        <p>{producto.notasSensoriales}</p>
      </section>

      <section className="bloque-home">
        <h2>{guiaRitual.titulo}</h2>
        <ol className={estilos.listaPasos}>
          {guiaRitual.pasos.map((paso) => (
            <li key={paso}>{paso}</li>
          ))}
        </ol>
        <div className={estilos.accionesFicha}>
          {producto.disponible ? (
            <Link href={`/checkout?producto=${producto.slug}`} className="boton boton--principal">Comprar ahora</Link>
          ) : (
            <button type="button" className="boton boton--principal" disabled aria-disabled="true">Sin stock</button>
          )}
          <BotonAgregarCarrito slugProducto={producto.slug} disabled={!producto.disponible} motivoBloqueo={mensajeDisponibilidad} />
          <Link href="/colecciones" className="boton boton--secundario">Volver al listado de colecciones rituales</Link>
          <Link href="/rituales" className="boton boton--secundario">Explorar rituales relacionados por intencion</Link>
          <Link href="/cesta" className="boton boton--secundario">Ver seleccion</Link>
          {!producto.disponible && (
            <Link href={`/encargo?producto=${producto.slug}`} className="boton boton--secundario">Consultar orientacion para esta pieza</Link>
          )}
        </div>
      </section>

      <section className="bloque-home" aria-labelledby="relacionados-titulo">
        <div className={estilos.cabeceraRelacionados}>
          <h2 id="relacionados-titulo">Productos relacionados</h2>
          <Link href="/colecciones">Volver al catalogo</Link>
        </div>

        <ul className={estilos.rejillaRelacionados}>
          {relacionados.map((relacionado) => (
            <li key={relacionado.id}>
              <p className={estilos.metaRelacionado}>{obtenerEtiquetaIntencion(relacionado.intencion)}</p>
              <h3>{relacionado.nombre}</h3>
              <p>{relacionado.subtitulo}</p>
              <p><strong>{relacionado.precioVisible}</strong></p>
              <Link href={`/colecciones/${relacionado.slug}`} className="boton boton--secundario">
                {`Ver ficha de ${relacionado.nombre}`}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
