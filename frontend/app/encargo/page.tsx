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
      <section className="bloque-home" aria-labelledby="titulo-confianza-encargo">
        <h2 id="titulo-confianza-encargo">Antes de enviar: información clave</h2>
        <p>
          Esta web canaliza solicitudes y encargos artesanales. La confirmación final se realiza por el canal de contacto
          disponible, sin compra o pago automático en esta fase.
        </p>
        <div className="hero-portada__acciones">
          <Link href="/condiciones-encargo" className="boton boton--secundario">Ver condiciones del encargo</Link>
          <Link href="/envios-y-preparacion" className="boton boton--secundario">Consultar envíos e incidencias</Link>
          <Link href="/privacidad" className="boton boton--secundario">Revisar privacidad</Link>
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
          <Link href="/cesta" className="boton boton--secundario">Revisar cesta ritual</Link>
        </div>
      </section>
    </main>
  );
}
