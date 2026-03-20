import { ContenedorPaginaComercial } from "@/componentes/shell/ContenedorPaginaComercial";
import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";

import { CatalogoColecciones } from "@/componentes/catalogo/CatalogoColecciones";
import { JsonLd } from "@/componentes/seo/JsonLd";
import { BloqueGuiasRelacionadas } from "@/componentes/editorial/BloqueGuiasRelacionadas";
import { BloqueEnlazadoContextual } from "@/componentes/seo/BloqueEnlazadoContextual";
import {
  INTRO_LISTADO_COLECCIONES,
  METADATA_LISTADO_COLECCIONES,
} from "@/contenido/catalogo/seoLandingsCatalogo";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";
import { construirSchemasLandingCatalogo } from "@/infraestructura/seo/structuredData";
import { BLOQUES_ENLAZADO_CATALOGO } from "@/contenido/catalogo/enlazadoInterno";
import { obtenerGuiasRelacionadasPorHub } from "@/contenido/editorial/guiasEditoriales";

export const metadata: Metadata = construirMetadataSeo({
  title: METADATA_LISTADO_COLECCIONES.title,
  description: METADATA_LISTADO_COLECCIONES.description,
  rutaCanonical: METADATA_LISTADO_COLECCIONES.rutaCanonical,
});

type Props = {
  searchParams?: { q?: string; in?: string; cat?: string; ord?: string };
};

const IndicadorCestaRitualDiferido = dynamic(
  () => import("@/componentes/catalogo/cesta/IndicadorCestaRitual").then((modulo) => modulo.IndicadorCestaRitual),
  {
    ssr: false,
    loading: () => (
      <Link href="/cesta" className="boton boton--secundario">
        Mi selección
      </Link>
    ),
  },
);

export default function PaginaColecciones({ searchParams }: Props): JSX.Element {
  const bloqueEnlazado = BLOQUES_ENLAZADO_CATALOGO.colecciones;
  const guiasRelacionadas = obtenerGuiasRelacionadasPorHub("colecciones");
  const schemasLanding = construirSchemasLandingCatalogo({
    ruta: METADATA_LISTADO_COLECCIONES.rutaCanonical,
    titulo: METADATA_LISTADO_COLECCIONES.title,
    descripcion: METADATA_LISTADO_COLECCIONES.description,
    nombreListado: "Colecciones",
  });

  return (
    <ContenedorPaginaComercial>
      {schemasLanding.length > 0 ? <JsonLd id="schema-landing-colecciones" data={schemasLanding} /> : null}
      <section className="bloque-home">
        <p className="hero-portada__eyebrow">{INTRO_LISTADO_COLECCIONES.eyebrow}</p>
        {INTRO_LISTADO_COLECCIONES.parrafos.map((parrafo) => (
          <p key={parrafo}>{parrafo}</p>
        ))}
      </section>

      <BloqueEnlazadoContextual bloque={bloqueEnlazado} />

      <BloqueGuiasRelacionadas
        titulo="Exploración guiada desde el catálogo"
        descripcion="Descubre guías editoriales para elegir colecciones con criterio y mantener una navegación editorial-comercial coherente."
        guias={guiasRelacionadas}
      />

      <section className="bloque-home">
        <h2>Tu selección para encargo</h2>
        <p>Guarda piezas de interés y prepara una solicitud de encargo con varias referencias en un solo paso.</p>
        <IndicadorCestaRitualDiferido />
      </section>

      <CatalogoColecciones searchParamsIniciales={searchParams} />

      <section className="bloque-home">
        <h2>Exploración conectada</h2>
        <p>Accede a otras rutas clave del catálogo para complementar la decisión de compra con contexto editorial.</p>
        <div className="hero-portada__acciones">
          {INTRO_LISTADO_COLECCIONES.enlacesInternos.map((enlace) => (
            <Link key={enlace.href} href={enlace.href} className="boton boton--secundario">
              {enlace.etiqueta}
            </Link>
          ))}
        </div>
      </section>
    </ContenedorPaginaComercial>
  );
}
