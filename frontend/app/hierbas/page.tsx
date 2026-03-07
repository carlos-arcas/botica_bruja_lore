import type { Metadata } from "next";
import Link from "next/link";

import {
  EstadoErrorListadoHerbal,
  EstadoVacioListadoHerbal,
} from "@/componentes/herbal/EstadoListadoHerbal";
import { ListadoHerbal } from "@/componentes/herbal/ListadoHerbal";
import { obtenerListadoHerbal } from "@/infraestructura/api/herbal";

export const metadata: Metadata = {
  title: "Línea herbal | La Botica de la Bruja Lore",
  description:
    "Listado herbal navegable con entrada por plantas e intención para el Ciclo 1 de la botica.",
};

export default async function PaginaListadoHerbal(): Promise<JSX.Element> {
  const resultado = await obtenerListadoHerbal();

  return (
    <main className="contenedor-home">
      <section className="bloque-home">
        <p className="hero-portada__eyebrow">Núcleo herbal navegable</p>
        <h1>Línea herbal</h1>
        <p>
          Explora plantas publicadas con contexto breve e intención principal. Esta base prepara la
          navegación hacia la ficha conectada del siguiente prompt.
        </p>
        <Link href="/" className="boton boton--secundario">
          Volver a portada
        </Link>
      </section>

      {resultado.estado === "error" ? (
        <EstadoErrorListadoHerbal mensaje={resultado.mensaje} />
      ) : resultado.plantas.length === 0 ? (
        <EstadoVacioListadoHerbal />
      ) : (
        <section className="bloque-home">
          <h2>Plantas disponibles</h2>
          <ListadoHerbal plantas={resultado.plantas} />
        </section>
      )}
    </main>
  );
}
