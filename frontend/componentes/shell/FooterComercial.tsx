import Link from "next/link";

import { ENLACES_FOOTER } from "@/contenido/shell/navegacionGlobal";

import estilos from "./shellComercial.module.css";

export function FooterComercial(): JSX.Element {
  const enlacesExploracion = ENLACES_FOOTER.filter((enlace) => enlace.categoria === "explorar");
  const enlacesConfianza = ENLACES_FOOTER.filter((enlace) => enlace.categoria === "confianza");

  return (
    <footer className={estilos.footer}>
      <div className={estilos.footerInterior}>
        <p>
          La Botica de la Bruja Lore une catálogo y narrativa para ayudarte a elegir con calma: hierbas, objetos rituales
          y combinaciones pensadas como piezas artesanales.
        </p>
        <nav aria-label="Navegación de cierre" className={estilos.footerNavegacion}>
          {enlacesExploracion.map((enlace) => (
            <Link key={enlace.href} href={enlace.href}>
              {enlace.etiqueta}
            </Link>
          ))}
        </nav>
        <nav aria-label="Información comercial y privacidad" className={estilos.footerNavegacion}>
          {enlacesConfianza.map((enlace) => (
            <Link key={enlace.href} href={enlace.href}>
              {enlace.etiqueta}
            </Link>
          ))}
        </nav>
        <p>
          Proyecto demo editorial-comercial: sin checkout activo, con asesoría y encargo artesanal como continuidad natural.
        </p>
        <Link href="/encargo" className={estilos.ctaFooter}>
          Continuar hacia una solicitud de encargo
        </Link>
      </div>
    </footer>
  );
}
