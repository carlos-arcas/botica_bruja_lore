import Link from "next/link";

import { ENLACE_ADMIN_CABECERA } from "@/contenido/shell/navegacionGlobal";

import { NavegacionPrincipal } from "./NavegacionPrincipal";
import estilos from "./shellComercial.module.css";

export function CabeceraComercial(): JSX.Element {
  return (
    <header className={estilos.cabecera}>
      <div className={estilos.cabeceraInterior}>
        <Link href="/" className={estilos.marca}>
          La Botica de la Bruja Lore
          <span>Botica editorial · ritual artesanal</span>
        </Link>
        <div className={estilos.accionesCabecera}>
          <NavegacionPrincipal />
          <Link
            href={ENLACE_ADMIN_CABECERA.href}
            className={estilos.enlaceAdmin}
            aria-label="Abrir acceso a administración de Django"
          >
            {ENLACE_ADMIN_CABECERA.etiqueta}
          </Link>
        </div>
      </div>
    </header>
  );
}
