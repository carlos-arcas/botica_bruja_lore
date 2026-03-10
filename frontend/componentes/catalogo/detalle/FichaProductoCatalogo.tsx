import Link from "next/link";

import {
  obtenerEtiquetaCategoria,
  obtenerEtiquetaIntencion,
  obtenerGuiaRitual,
  obtenerProductosRelacionados,
} from "@/contenido/catalogo/detalleCatalogo";
import { ProductoCatalogo } from "@/contenido/catalogo/catalogo";
import { BotonAnadirCestaRitual } from "@/componentes/catalogo/cesta/BotonAnadirCestaRitual";

import estilos from "./fichaProductoCatalogo.module.css";

type Props = {
  producto: ProductoCatalogo;
};

export function FichaProductoCatalogo({ producto }: Props): JSX.Element {
  const relacionados = obtenerProductosRelacionados(producto, undefined, 4);
  const guiaRitual = obtenerGuiaRitual(producto.intencion);

  return (
    <>
      <nav aria-label="Breadcrumb" className={estilos.breadcrumb}>
        <Link href="/">Inicio</Link>
        <span>·</span>
        <Link href="/colecciones">Colecciones</Link>
        <span>·</span>
        <span aria-current="page">{producto.nombre}</span>
      </nav>

      <section className="bloque-home">
        <p className={estilos.eyebrow}>Colección editorial-comercial</p>
        <h1>{producto.nombre}</h1>
        <p className={estilos.subtitulo}>{producto.subtitulo}</p>
        <p>{producto.descripcion}</p>
        <p>
          Navegación relacionada: <Link href="/colecciones">colecciones</Link>,{" "}
          <Link href="/hierbas">fichas herbales</Link> y <Link href="/rituales">fichas rituales</Link>.
        </p>

        <div className={estilos.resumenComercial}>
          <p><strong>Precio:</strong> {producto.precioVisible}</p>
          <p><strong>Disponibilidad:</strong> {producto.disponible ? "Disponible" : "Edición agotada"}</p>
          <p><strong>Intención:</strong> {obtenerEtiquetaIntencion(producto.intencion)}</p>
          <p><strong>Formato:</strong> {obtenerEtiquetaCategoria(producto.categoria)}</p>
        </div>

        <ul className={estilos.etiquetas} aria-label="Etiquetas del producto">
          {producto.etiquetas.map((etiqueta) => (
            <li key={`${producto.id}-${etiqueta}`}>{etiqueta}</li>
          ))}
        </ul>
      </section>

      <section className="bloque-home">
        <h2>Perfil sensorial y composición editorial</h2>
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
          <BotonAnadirCestaRitual slugProducto={producto.slug} />
          <Link href={`/encargo?producto=${producto.slug}`} className="boton boton--principal">
            Encargar o consultar esta pieza
          </Link>
          <Link href="/cesta" className="boton boton--secundario">Ver cesta ritual</Link>
          <Link href="/colecciones" className="boton boton--secundario">Seguir explorando colecciones</Link>
        </div>
      </section>

      <section className="bloque-home" aria-labelledby="relacionados-titulo">
        <div className={estilos.cabeceraRelacionados}>
          <h2 id="relacionados-titulo">Productos relacionados</h2>
          <Link href="/colecciones">Volver al catálogo</Link>
        </div>

        <ul className={estilos.rejillaRelacionados}>
          {relacionados.map((relacionado) => (
            <li key={relacionado.id}>
              <p className={estilos.metaRelacionado}>{obtenerEtiquetaIntencion(relacionado.intencion)}</p>
              <h3>{relacionado.nombre}</h3>
              <p>{relacionado.subtitulo}</p>
              <p><strong>{relacionado.precioVisible}</strong></p>
              <Link href={`/colecciones/${relacionado.slug}`} className="boton boton--secundario">
                Ver ficha
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
