import Link from "next/link";

import { type PaginaLegalComercial } from "@/contenido/legal/contenidoLegalComercial";

export function PaginaLegalComercialBase({ pagina }: { pagina: PaginaLegalComercial }): JSX.Element {
  return (
    <main className="contenedor-home">
      <section className="hero-portada bloque-home" aria-labelledby="titulo-legal-comercial">
        <p className="hero-portada__etiqueta">Información comercial mínima</p>
        <h1 id="titulo-legal-comercial">{pagina.titulo}</h1>
        <p>{pagina.introduccion}</p>
        <p>{pagina.aviso}</p>
      </section>

      {pagina.secciones.map((seccion) => (
        <section key={seccion.titulo} className="bloque-home" aria-label={seccion.titulo}>
          <h2>{seccion.titulo}</h2>
          <p>{seccion.descripcion}</p>
          {seccion.puntos && (
            <ul className="lista-destacada">
              {seccion.puntos.map((punto) => (
                <li key={punto}>{punto}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="bloque-home cta-final-home" aria-labelledby="titulo-cta-legal-comercial">
        <h2 id="titulo-cta-legal-comercial">Siguiente paso recomendado</h2>
        <p>Si tu intención está clara, continúa con el flujo de solicitud o vuelve al catálogo para comparar opciones.</p>
        <div className="hero-portada__acciones">
          <Link href={pagina.cta.primaria.href} className="boton boton--principal">
            {pagina.cta.primaria.texto}
          </Link>
          <Link href={pagina.cta.secundaria.href} className="boton boton--secundario">
            {pagina.cta.secundaria.texto}
          </Link>
        </div>
      </section>
    </main>
  );
}
