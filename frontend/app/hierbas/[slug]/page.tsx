import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BloqueComercialMinimo } from "@/componentes/herbal/detalle/BloqueComercialMinimo";
import { BloqueEditorialPlanta } from "@/componentes/herbal/detalle/BloqueEditorialPlanta";
import { BloqueRitualesRelacionados } from "@/componentes/herbal/detalle/BloqueRitualesRelacionados";
import { CabeceraFichaHerbal } from "@/componentes/herbal/detalle/CabeceraFichaHerbal";
import { EstadoErrorFichaHerbal } from "@/componentes/herbal/detalle/EstadoFichaHerbal";
import { obtenerFichaHerbalConectada } from "@/infraestructura/api/herbal";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slugLegible = params.slug.replace(/-/g, " ");
  return construirMetadataSeo({
    title: `${slugLegible} | Ficha herbal | La Botica de la Bruja Lore`,
    description:
      "Ficha herbal conectada del Ciclo 1: contexto editorial de planta más resolución comercial mínima asociada.",
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

  return (
    <main className="contenedor-home">
      <CabeceraFichaHerbal planta={planta} />
      <BloqueEditorialPlanta planta={planta} />
      <BloqueComercialMinimo productos={productos} />
      <BloqueRitualesRelacionados rituales={rituales} />
    </main>
  );
}
