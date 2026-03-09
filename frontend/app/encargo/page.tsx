import type { Metadata } from "next";
import Link from "next/link";

import { FlujoEncargoConsulta } from "@/componentes/catalogo/encargo/FlujoEncargoConsulta";

type Props = {
  searchParams?: { producto?: string };
};

export const metadata: Metadata = {
  title: "Encargo ritual | La Botica de la Bruja Lore",
  description: "Flujo ligero para preparar una consulta de encargo desde las fichas de colección.",
};

export default function PaginaEncargo({ searchParams }: Props): JSX.Element {
  return (
    <main className="contenedor-home">
      <FlujoEncargoConsulta slugPreseleccionado={searchParams?.producto} />
      <section className="bloque-home">
        <h2>Camino editorial recomendado</h2>
        <p>
          Si aún estás explorando, vuelve a colecciones para revisar intenciones, formatos y notas sensoriales antes de
          cerrar la consulta.
        </p>
        <Link href="/colecciones" className="boton boton--secundario">Explorar colecciones</Link>
      </section>
    </main>
  );
}
