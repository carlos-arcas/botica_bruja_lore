import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BloquePlantasRelacionadas } from "@/componentes/rituales/detalle/BloquePlantasRelacionadas";
import { BloqueResolucionComercialRitual } from "@/componentes/rituales/detalle/BloqueResolucionComercialRitual";
import { CabeceraFichaRitual } from "@/componentes/rituales/detalle/CabeceraFichaRitual";
import { EstadoErrorFichaRitual } from "@/componentes/rituales/detalle/EstadoFichaRitual";
import { JsonLd } from "@/componentes/seo/JsonLd";
import { obtenerFichaRitualConectada } from "@/infraestructura/api/rituales";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import {
  construirDescriptionFichaPublica,
  construirTitleFichaPublica,
} from "@/infraestructura/seo/seoFichasPublicas";
import { construirSchemasFichaRitual } from "@/infraestructura/seo/structuredData";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resultado = await obtenerFichaRitualConectada(params.slug);

  if (resultado.estado !== "ok") {
    return construirMetadataSeo({
      title: "Ficha ritual no disponible | La Botica de la Bruja Lore",
      description: "La ficha ritual solicitada no está publicada o no está disponible ahora mismo.",
      indexable: false,
    });
  }

  const { ritual } = resultado.ficha;

  return construirMetadataSeo({
    title: construirTitleFichaPublica({
      nombre: ritual.nombre,
      tipoFicha: "ritual",
    }),
    description: construirDescriptionFichaPublica({
      nombre: ritual.nombre,
      tipoFicha: "ritual",
      resumen: ritual.contexto_breve,
      intenciones: ritual.intenciones.map((intencion) => intencion.nombre),
    }),
    rutaCanonical: `/rituales/${params.slug}`,
  });
}

export default async function PaginaDetalleRitual({ params }: Props): Promise<JSX.Element> {
  const resultado = await obtenerFichaRitualConectada(params.slug);

  if (resultado.estado === "no_encontrado") {
    notFound();
  }

  if (resultado.estado === "error") {
    return (
      <main className="contenedor-home">
        <EstadoErrorFichaRitual mensaje={resultado.mensaje} />
      </main>
    );
  }

  const { ritual, plantas, productos } = resultado.ficha;
  const schemasFicha = construirSchemasFichaRitual(ritual);

  return (
    <main className="contenedor-home">
      {schemasFicha.length > 0 ? <JsonLd id="schema-ficha-ritual" data={schemasFicha} /> : null}
      <CabeceraFichaRitual ritual={ritual} />
      <BloquePlantasRelacionadas plantas={plantas} />
      <BloqueResolucionComercialRitual productos={productos} />
    </main>
  );
}
