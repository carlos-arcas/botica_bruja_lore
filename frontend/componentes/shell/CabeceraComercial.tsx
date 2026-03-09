import Link from "next/link";

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
        <NavegacionPrincipal />
      </div>
    </header>
  );
}
