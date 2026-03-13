import Link from "next/link";

import { ETIQUETA_ENLACE_ADMIN_CABECERA } from "@/contenido/shell/navegacionGlobal";
import { construirUrlAdmin } from "@/infraestructura/configuracion/adminUrl";

import { NavegacionPrincipal } from "./NavegacionPrincipal";
import estilos from "./shellComercial.module.css";

const URL_ACCESO_ADMIN = construirUrlAdmin("/admin/");

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
            href={URL_ACCESO_ADMIN}
            className={estilos.enlaceAdmin}
            aria-label="Abrir acceso a administración de Django"
          >
            {ETIQUETA_ENLACE_ADMIN_CABECERA}
          </Link>
        </div>
      </div>
    </header>
  );
}
