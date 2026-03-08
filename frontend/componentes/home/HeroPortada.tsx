import Link from "next/link";

export function HeroPortada(): JSX.Element {
  return (
    <section className="hero-portada hero-portada--con-fondo">
      <div className="hero-portada__overlay" />
      <div className="hero-portada__contenido">
        <p className="hero-portada__eyebrow">Portada narrativa de la botica</p>
        <h1>La Botica de la Bruja Lore</h1>
        <p>
          Hierbas a granel, guía editorial y descubrimiento por intención para una experiencia
          natural que evoluciona hacia lo místico sin perder claridad.
        </p>
        <div className="hero-portada__acciones">
          <Link href="/hierbas" className="boton boton--principal">
            Explorar hierbas
          </Link>
          <Link href="/rituales" className="boton boton--secundario boton--secundario-claro">
            Ver rituales
          </Link>
        </div>
      </div>
    </section>
  );
}
