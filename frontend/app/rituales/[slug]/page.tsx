import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { BloquePlantasRelacionadas } from "@/componentes/rituales/detalle/BloquePlantasRelacionadas";
import { BloqueProductosRelacionados } from "@/componentes/catalogo/relacionados/BloqueProductosRelacionados";
import { CabeceraFichaRitual } from "@/componentes/rituales/detalle/CabeceraFichaRitual";
import { EstadoErrorFichaRitual } from "@/componentes/rituales/detalle/EstadoFichaRitual";
import { BloqueGuiasRelacionadas } from "@/componentes/editorial/BloqueGuiasRelacionadas";
import { JsonLd } from "@/componentes/seo/JsonLd";
import { obtenerFichaRitualConectada } from "@/infraestructura/api/rituales";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import {
  construirDescriptionFichaPublica,
  construirTitleFichaPublica,
} from "@/infraestructura/seo/seoFichasPublicas";
import { construirSchemasFichaRitual } from "@/infraestructura/seo/structuredData";
import { obtenerGuiasRelacionadasPorFicha } from "@/contenido/editorial/guiasEditoriales";

type Props = {
  params: { slug: string };
};

const obtenerFichaRitualCacheada = cache(obtenerFichaRitualConectada);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resultado = await obtenerFichaRitualCacheada(params.slug);

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
  const resultado = await obtenerFichaRitualCacheada(params.slug);

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
  const guiasRelacionadas = obtenerGuiasRelacionadasPorFicha({ tipoFicha: "rituales", slug: ritual.slug });
  const schemasFicha = construirSchemasFichaRitual(ritual);

  return (
    <main className="contenedor-home">
      {schemasFicha.length > 0 ? <JsonLd id="schema-ficha-ritual" data={schemasFicha} /> : null}
      <CabeceraFichaRitual ritual={ritual} />
      <BloquePlantasRelacionadas plantas={plantas} />
      <BloqueProductosRelacionados titulo="Productos para este ritual" productos={productos} />
      <BloqueGuiasRelacionadas
        titulo="Guías editoriales relacionadas con este ritual"
        descripcion="Amplía esta práctica con guías conectadas al hub de rituales y a rutas complementarias del catálogo."
        guias={guiasRelacionadas}
      />
    </main>
  );
}
