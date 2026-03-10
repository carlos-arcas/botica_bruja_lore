import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { BloqueComercialMinimo } from "@/componentes/herbal/detalle/BloqueComercialMinimo";
import { BloqueEditorialPlanta } from "@/componentes/herbal/detalle/BloqueEditorialPlanta";
import { BloqueRitualesRelacionados } from "@/componentes/herbal/detalle/BloqueRitualesRelacionados";
import { CabeceraFichaHerbal } from "@/componentes/herbal/detalle/CabeceraFichaHerbal";
import { EstadoErrorFichaHerbal } from "@/componentes/herbal/detalle/EstadoFichaHerbal";
import { BloqueGuiasRelacionadas } from "@/componentes/editorial/BloqueGuiasRelacionadas";
import { JsonLd } from "@/componentes/seo/JsonLd";
import { obtenerFichaHerbalConectada } from "@/infraestructura/api/herbal";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import {
  construirDescriptionFichaPublica,
  construirTitleFichaPublica,
} from "@/infraestructura/seo/seoFichasPublicas";
import { construirSchemasFichaHerbal } from "@/infraestructura/seo/structuredData";
import { obtenerGuiasRelacionadasPorFicha } from "@/contenido/editorial/guiasEditoriales";

type Props = {
  params: { slug: string };
};

const obtenerFichaHerbalCacheada = cache(obtenerFichaHerbalConectada);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resultado = await obtenerFichaHerbalCacheada(params.slug);

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
  const resultado = await obtenerFichaHerbalCacheada(params.slug);

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
  const guiasRelacionadas = obtenerGuiasRelacionadasPorFicha({ tipoFicha: "hierbas", slug: planta.slug });
  const schemasFicha = construirSchemasFichaHerbal(planta);

  return (
    <main className="contenedor-home">
      {schemasFicha.length > 0 ? <JsonLd id="schema-ficha-herbal" data={schemasFicha} /> : null}
      <CabeceraFichaHerbal planta={planta} />
      <BloqueEditorialPlanta planta={planta} />
      <BloqueComercialMinimo productos={productos} />
      <BloqueRitualesRelacionados rituales={rituales} />
      <BloqueGuiasRelacionadas
        titulo="Guías editoriales relacionadas con esta hierba"
        descripcion="Conecta esta ficha con rutas editoriales para seguir explorando la línea herbal y el catálogo asociado."
        guias={guiasRelacionadas}
      />
    </main>
  );
}
