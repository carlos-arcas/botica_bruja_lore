import type { Metadata } from "next";
import Link from "next/link";

import {
  EstadoErrorListadoRituales,
  EstadoVacioListadoRituales,
} from "@/componentes/rituales/EstadoListadoRituales";
import { ListadoRituales } from "@/componentes/rituales/ListadoRituales";
import { obtenerListadoRituales } from "@/infraestructura/api/rituales";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Rituales conectados | La Botica de la Bruja Lore",
  description:
    "Listado público de rituales conectados por intención para el Ciclo 2 de la botica.",
  rutaCanonical: "/rituales",
});

export default async function PaginaListadoRituales(): Promise<JSX.Element> {
  const resultado = await obtenerListadoRituales();

  return (
    <main className="contenedor-home">
      <section className="bloque-home">
        <p className="hero-portada__eyebrow">Capa ritual conectada</p>
        <h1>Rituales</h1>
        <p>
          Esta ruta abre el descubrimiento ritual desde intención y contexto breve, manteniendo la
          línea herbal como puerta principal del catálogo.
        </p>
        <div className="hero-portada__acciones">
          <Link href="/hierbas" className="boton boton--principal">
            Entrar primero por hierbas
          </Link>
          <Link href="/" className="boton boton--secundario">
            Volver a portada
          </Link>
        </div>
      </section>

      {resultado.estado === "error" ? (
        <EstadoErrorListadoRituales mensaje={resultado.mensaje} />
      ) : resultado.rituales.length === 0 ? (
        <EstadoVacioListadoRituales />
      ) : (
        <section className="bloque-home">
          <h2>Rituales publicados</h2>
          <ListadoRituales rituales={resultado.rituales} />
        </section>
      )}
    </main>
  );
}
