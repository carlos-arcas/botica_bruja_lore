import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BloqueComercialMinimo } from "@/componentes/herbal/detalle/BloqueComercialMinimo";
import { BloqueEditorialPlanta } from "@/componentes/herbal/detalle/BloqueEditorialPlanta";
import { BloqueRitualesRelacionados } from "@/componentes/herbal/detalle/BloqueRitualesRelacionados";
import { CabeceraFichaHerbal } from "@/componentes/herbal/detalle/CabeceraFichaHerbal";
import { EstadoErrorFichaHerbal } from "@/componentes/herbal/detalle/EstadoFichaHerbal";
import { JsonLd } from "@/componentes/seo/JsonLd";
import { obtenerFichaHerbalConectada } from "@/infraestructura/api/herbal";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import {
  construirDescriptionFichaPublica,
  construirTitleFichaPublica,
} from "@/infraestructura/seo/seoFichasPublicas";
import { construirSchemasFichaHerbal } from "@/infraestructura/seo/structuredData";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resultado = await obtenerFichaHerbalConectada(params.slug);

  if (resultado.estado !== "ok") {
    return construirMetadataSeo({
      title: "Ficha herbal no disponible | La Botica de la Bruja Lore",
      description: "La ficha herbal solicitada no está publicada o no está disponible ahora mismo.",
      indexable: false,
    });
  }

  const { planta } = resultado.ficha;

  return construirMetadataSeo({
    title: construirTitleFichaPublica({
      nombre: planta.nombre,
      tipoFicha: "hierba",
    }),
    description: construirDescriptionFichaPublica({
      nombre: planta.nombre,
      tipoFicha: "hierba",
      resumen: planta.descripcion_breve,
      intenciones: planta.intenciones.map((intencion) => intencion.nombre),
    }),
    rutaCanonical: `/hierbas/${params.slug}`,
  });
}

export default async function PaginaDetalleHerbal({ params }: Props): Promise<JSX.Element> {
  const resultado = await obtenerFichaHerbalConectada(params.slug);

  if (resultado.estado === "no_encontrado") {
    notFound();
  }

  if (resultado.estado === "error") {
    return (
      <main className="contenedor-home">
        <EstadoErrorFichaHerbal mensaje={resultado.mensaje} />
      </main>
    );
  }

  const { planta, productos, rituales } = resultado.ficha;
  const schemasFicha = construirSchemasFichaHerbal(planta);

  return (
    <main className="contenedor-home">
      {schemasFicha.length > 0 ? <JsonLd id="schema-ficha-herbal" data={schemasFicha} /> : null}
      <CabeceraFichaHerbal planta={planta} />
      <BloqueEditorialPlanta planta={planta} />
      <BloqueComercialMinimo productos={productos} />
      <BloqueRitualesRelacionados rituales={rituales} />
    </main>
  );
}
