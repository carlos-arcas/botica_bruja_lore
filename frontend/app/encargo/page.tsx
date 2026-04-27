import type { Metadata } from "next";
import Link from "next/link";

import { FlujoEncargoConsulta } from "@/componentes/catalogo/encargo/FlujoEncargoConsulta";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

type Props = {
  searchParams?: { producto?: string; cesta?: string; origen?: string };
};

export const metadata: Metadata = construirMetadataSeo({
  title: "Checkout demo | La Botica de la Bruja Lore",
  description:
    "Prepara un pedido demo sin cobro real o conserva el resumen para una consulta manual si el canal está configurado.",
  indexable: false,
});

export default function PaginaEncargo({ searchParams }: Props): JSX.Element {
  return (
    <main className="contenedor-home">
      <FlujoEncargoConsulta slugPreseleccionado={searchParams?.producto} cestaPreseleccionada={searchParams?.cesta} origenPreseleccionado={searchParams?.origen} />
      <section className="bloque-home">
        <h2>Antes de confirmar tu pedido demo</h2>
        <p>
          Consulta estas páginas para entender cómo revisamos el pedido demo, cómo tratamos tiempos e incidencias y qué
          uso damos a tus datos de contacto dentro de esta demo.
        </p>
        <div className="hero-portada__acciones">
          <Link href="/condiciones-encargo" className="boton boton--secundario">Condiciones del encargo</Link>
          <Link href="/envios-y-preparacion" className="boton boton--secundario">Envíos y preparación</Link>
          <Link href="/privacidad" className="boton boton--secundario">Privacidad y contacto</Link>
        </div>
      </section>

      <section className="bloque-home">
        <h2>Camino editorial recomendado</h2>
        <p>
          Si aún estás explorando, vuelve a colecciones para revisar intenciones, formatos y notas sensoriales antes de
          cerrar la solicitud.
        </p>
        <div className="hero-portada__acciones">
          <Link href="/colecciones" className="boton boton--secundario">Explorar colecciones</Link>
          <Link href="/cesta" className="boton boton--secundario">Revisar selección</Link>
        </div>
      </section>
    </main>
  );
}
