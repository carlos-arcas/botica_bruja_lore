import Link from "next/link";

import { ENLACES_FOOTER } from "@/contenido/shell/navegacionGlobal";

import estilos from "./shellComercial.module.css";

export function FooterComercial(): JSX.Element {
  return (
    <footer className={estilos.footer}>
      <div className={estilos.footerInterior}>
        <p>
          La Botica de la Bruja Lore une catálogo y narrativa para ayudarte a elegir con calma: hierbas, objetos rituales
          y combinaciones pensadas como piezas artesanales.
        </p>
        <nav aria-label="Navegación de cierre" className={estilos.footerNavegacion}>
          {ENLACES_FOOTER.map((enlace) => (
            <Link key={enlace.href} href={enlace.href}>
              {enlace.etiqueta}
            </Link>
          ))}
        </nav>
        <p>
          Ecommerce local con pedido real: el encargo artesanal queda como consulta personalizada para casos que necesitan revision humana.
          Los productos herbales y esotericos se presentan con uso tradicional, ritual, aromatico, cultural o decorativo; no sustituyen consejo medico ni garantizan resultados.
        </p>
        <Link href="/checkout" className={estilos.ctaFooter}>
          Finalizar compra en checkout
        </Link>
      </div>
    </footer>
  );
}
