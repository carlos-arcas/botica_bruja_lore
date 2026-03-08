import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BloquePlantasRelacionadas } from "@/componentes/rituales/detalle/BloquePlantasRelacionadas";
import { BloqueResolucionComercialRitual } from "@/componentes/rituales/detalle/BloqueResolucionComercialRitual";
import { CabeceraFichaRitual } from "@/componentes/rituales/detalle/CabeceraFichaRitual";
import { EstadoErrorFichaRitual } from "@/componentes/rituales/detalle/EstadoFichaRitual";
import { obtenerFichaRitualConectada } from "@/infraestructura/api/rituales";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slugLegible = params.slug.replace(/-/g, " ");
  return {
    title: `${slugLegible} | Ficha ritual | La Botica de la Bruja Lore`,
    description:
      "Ficha ritual conectada del Ciclo 2: contexto editorial del ritual con salida herbal y resolución comercial mínima.",
  };
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

  return (
    <main className="contenedor-home">
      <CabeceraFichaRitual ritual={ritual} />
      <BloquePlantasRelacionadas plantas={plantas} />
      <BloqueResolucionComercialRitual productos={productos} />
    </main>
  );
}
