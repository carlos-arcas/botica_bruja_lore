import Link from "next/link";

export function HeroPortada(): JSX.Element {
  return (
    <section className="hero-portada">
      <p className="hero-portada__eyebrow">Portada narrativa de la botica</p>
      <h1>La Botica de la Bruja Lore</h1>
      <p>
        Hierbas a granel, guía editorial y descubrimiento por intención para una experiencia
        natural que evoluciona hacia lo místico sin perder claridad.
      </p>
      <div className="hero-portada__acciones">
        <Link href="/hierbas" className="boton boton--principal">
          Entrar a la línea herbal
        </Link>
        <a href="#descubrimiento-intencion" className="boton boton--secundario">
          Descubrir por intención
        </a>
        <Link href="/rituales" className="boton boton--secundario">
          Ver rituales conectados
        </Link>
      </div>
      <div className="hero-portada__nota">
        <strong>Bruja Lore</strong> te orienta con microguías prácticas, contexto tradicional y una
        navegación sobria enfocada en elección útil.
      </div>
    </section>
  );
}
