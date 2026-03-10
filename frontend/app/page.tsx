import type { Metadata } from "next";

import { AlquimiaDeseo } from "@/componentes/home/AlquimiaDeseo";
import { BloqueConfianza } from "@/componentes/home/BloqueConfianza";
import { ComoFuncionaRitual } from "@/componentes/home/ComoFuncionaRitual";
import { CtaFinalHome } from "@/componentes/home/CtaFinalHome";
import { EstadoConexionHerbal } from "@/componentes/home/EstadoConexionHerbal";
import { FaqHome } from "@/componentes/home/FaqHome";
import { HeroPortada } from "@/componentes/home/HeroPortada";
import { IntencionesDestacadas } from "@/componentes/home/IntencionesDestacadas";
import { NavegacionSecciones } from "@/componentes/home/NavegacionSecciones";
import { PreviewLineaHerbal } from "@/componentes/home/PreviewLineaHerbal";
import { obtenerPreviewHerbal } from "@/infraestructura/api/herbal";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "La Botica de la Bruja Lore | Botica artesanal y ritual",
  description:
    "Home editorial-comercial de La Botica de la Bruja Lore: alquimia del deseo, colecciones por intención y guía ritual accesible.",
  rutaCanonical: "/",
});

export default async function Home(): Promise<JSX.Element> {
  const previewHerbal = await obtenerPreviewHerbal();

  return (
    <main className="contenedor-home contenedor-home--portada">
      <HeroPortada />
      <NavegacionSecciones />
      <AlquimiaDeseo />
      <IntencionesDestacadas />
      <ComoFuncionaRitual />
      <BloqueConfianza />
      {previewHerbal.estado === "ok" ? (
        <PreviewLineaHerbal plantas={previewHerbal.plantas} />
      ) : (
        <EstadoConexionHerbal mensaje={previewHerbal.mensaje} />
      )}
      <FaqHome />
      <CtaFinalHome />
    </main>
  );
}
