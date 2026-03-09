import type { Metadata } from "next";
import Link from "next/link";

import { FlujoEncargoConsulta } from "@/componentes/catalogo/encargo/FlujoEncargoConsulta";

type Props = {
  searchParams?: { producto?: string; cesta?: string };
};

export const metadata: Metadata = {
  title: "Solicitud de encargo artesanal | La Botica de la Bruja Lore",
  description: "Prepara una solicitud de encargo clara y compártela por un canal real si está configurado.",
};

export default function PaginaEncargo({ searchParams }: Props): JSX.Element {
  return (
    <main className="contenedor-home">
      <FlujoEncargoConsulta slugPreseleccionado={searchParams?.producto} cestaPreseleccionada={searchParams?.cesta} />
      <section className="bloque-home">
        <h2>Camino editorial recomendado</h2>
        <p>
          Si aún estás explorando, vuelve a colecciones para revisar intenciones, formatos y notas sensoriales antes de
          cerrar la solicitud.
        </p>
        <div className="hero-portada__acciones">
          <Link href="/colecciones" className="boton boton--secundario">Explorar colecciones</Link>
          <Link href="/cesta" className="boton boton--secundario">Revisar cesta ritual</Link>
        </div>
      </section>
    </main>
  );
}
