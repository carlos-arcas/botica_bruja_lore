import Link from "next/link";

import { PaginaLegalComercial } from "@/contenido/legal/paginasLegalesComerciales";

import estilos from "./paginaLegalComercial.module.css";

type Props = {
  contenido: PaginaLegalComercial;
  notaCanal?: string;
};

export function PaginaLegalComercialVista({ contenido, notaCanal }: Props): JSX.Element {
  return (
    <main className="contenedor-home">
      <article className="hero-portada">
        <p className={estilos.etiqueta}>Información comercial mínima</p>
        <h1>{contenido.titulo}</h1>
        <p>{contenido.introduccion}</p>
        <p className={estilos.aviso}>{contenido.aviso}</p>
        {notaCanal && <p className={estilos.notaCanal}>{notaCanal}</p>}
      </article>

      {contenido.secciones.map((seccion) => (
        <section key={seccion.titulo} className="bloque-home" aria-label={seccion.titulo}>
          <h2>{seccion.titulo}</h2>
          {seccion.parrafos.map((parrafo) => (
            <p key={parrafo}>{parrafo}</p>
          ))}
          {seccion.lista && (
            <ul className={estilos.lista}>
              {seccion.lista.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="bloque-home" aria-label="Siguiente paso">
        <h2>Siguiente paso</h2>
        <p>Si te encaja esta forma de trabajo, puedes seguir por catálogo o abrir tu solicitud de encargo.</p>
        <div className="hero-portada__acciones">
          <Link href={contenido.ctaPrincipal.href} className="boton boton--principal">{contenido.ctaPrincipal.texto}</Link>
          <Link href={contenido.ctaSecundaria.href} className="boton boton--secundario">{contenido.ctaSecundaria.texto}</Link>
        </div>
      </section>
    </main>
  );
}
