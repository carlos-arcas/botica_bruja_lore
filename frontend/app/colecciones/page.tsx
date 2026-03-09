import type { Metadata } from "next";
import Link from "next/link";

import { CatalogoColecciones } from "@/componentes/catalogo/CatalogoColecciones";
import { IndicadorCestaRitual } from "@/componentes/catalogo/cesta/IndicadorCestaRitual";

export const metadata: Metadata = {
  title: "Colecciones rituales | La Botica de la Bruja Lore",
  description:
    "Catálogo navegable de colecciones rituales con filtros por intención y formato dentro de La Botica de la Bruja Lore.",
};

type Props = {
  searchParams?: { q?: string; in?: string; cat?: string; ord?: string };
};

export default function PaginaColecciones({ searchParams }: Props): JSX.Element {
  return (
    <main className="contenedor-home">
      <section className="bloque-home">
        <h2>Tu selección ritual</h2>
        <p>Guarda piezas de interés y prepara una consulta con varias referencias en un solo paso.</p>
        <IndicadorCestaRitual />
      </section>
      <CatalogoColecciones searchParamsIniciales={searchParams} />
      <section className="bloque-home">
        <h2>Exploración conectada</h2>
        <p>Si prefieres una entrada por contenido vivo, puedes recorrer la línea herbal o la sección de rituales publicados.</p>
        <div className="hero-portada__acciones">
          <Link href="/hierbas" className="boton boton--secundario">Explorar hierbas</Link>
          <Link href="/rituales" className="boton boton--secundario">Ver rituales conectados</Link>
        </div>
      </section>
    </main>
  );
}
