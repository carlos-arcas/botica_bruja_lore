import Link from "next/link";

import { debugLogViewerHabilitado } from "@/infraestructura/configuracion/debugLogs";

import { AccesosCabecera } from "./AccesosCabecera";
import { NavegacionPrincipal } from "./NavegacionPrincipal";
import estilos from "./shellComercial.module.css";

export function CabeceraComercial(): JSX.Element {
  return (
    <header className={estilos.cabecera}>
      <div className={estilos.cabeceraInterior}>
        <div className={estilos.franjaMarca}>
          <Link href="/" className={estilos.marca}>
            <span className={estilos.marcaTitulo}>La Botica de la Bruja Lore</span>
            <span className={estilos.marcaSubtitulo}>
              Tienda editorial, compendio botanico y calendario ritual
            </span>
          </Link>
        </div>
        <div className={estilos.barraCabecera}>
          <NavegacionPrincipal mostrarLogs={debugLogViewerHabilitado()} />
          <AccesosCabecera />
        </div>
      </div>
    </header>
  );
}
