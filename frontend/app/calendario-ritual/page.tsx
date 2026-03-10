import type { Metadata } from "next";
import Link from "next/link";

import { CalendarioRitualInteractivo } from "@/componentes/rituales/calendario/CalendarioRitualInteractivo";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Calendario ritual editorial | La Botica de la Bruja Lore",
  description:
    "Consulta rituales aplicables por fecha en el calendario editorial de La Botica de la Bruja Lore, conectado a la biblioteca de rituales publicada.",
  rutaCanonical: "/calendario-ritual",
});

export default function PaginaCalendarioRitual(): JSX.Element {
  return (
    <main className="contenedor-home">
      <section className="bloque-home">
        <p className="hero-portada__eyebrow">Calendario ritual editorial</p>
        <h1>Calendario ritual por fecha</h1>
        <p>
          Esta superficie mínima te permite consultar qué rituales están activos en una fecha concreta, sin abrir
          backoffice ni automatizaciones.
        </p>
        <div className="hero-portada__acciones">
          <Link href="/rituales" className="boton boton--secundario">
            Ver biblioteca ritual completa
          </Link>
        </div>
      </section>

      <CalendarioRitualInteractivo />
    </main>
  );
}
