import { DescubrimientoIntencion } from "@/componentes/home/DescubrimientoIntencion";
import { EstadoConexionHerbal } from "@/componentes/home/EstadoConexionHerbal";
import { HeroPortada } from "@/componentes/home/HeroPortada";
import { PreviewLineaHerbal } from "@/componentes/home/PreviewLineaHerbal";
import { obtenerPreviewHerbal } from "@/infraestructura/api/herbal";

export default async function Home(): Promise<JSX.Element> {
  const previewHerbal = await obtenerPreviewHerbal();

  return (
    <main className="contenedor-home contenedor-home--portada">
      <HeroPortada />
      <DescubrimientoIntencion />
      {previewHerbal.estado === "ok" ? (
        <PreviewLineaHerbal plantas={previewHerbal.plantas} />
      ) : (
        <EstadoConexionHerbal mensaje={previewHerbal.mensaje} />
      )}
    </main>
  );
}
