"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  construirNavegacionPrincipal,
  construirTextoContadorCesta,
  debeMostrarContadorCesta,
  esRutaActiva,
} from "@/contenido/shell/navegacionGlobal";
import { useCarrito } from "@/componentes/catalogo/cesta/useCarrito";

import estilos from "./shellComercial.module.css";

type NavegacionPrincipalProps = {
  mostrarLogs: boolean;
};

export function NavegacionPrincipal({ mostrarLogs }: NavegacionPrincipalProps): JSX.Element {
  const rutaActual = usePathname();
  const { totalUnidades } = useCarrito();
  const enlaces = construirNavegacionPrincipal(mostrarLogs);

  return (
    <nav aria-label="Navegación principal" className={estilos.navegacion}>
      <ul>
        {enlaces.map((enlace) => {
          const activa = esRutaActiva(rutaActual, enlace);
          const mostrarContador = enlace.href === "/cesta" && debeMostrarContadorCesta(totalUnidades);

          return (
            <li key={enlace.href}>
              <Link
                href={enlace.href}
                className={`${estilos.enlace} ${activa ? estilos.enlaceActiva : ""}`.trim()}
                aria-current={activa ? "page" : undefined}
              >
                {enlace.etiqueta}
                {mostrarContador && (
                  <span className={estilos.contador} aria-label={construirTextoContadorCesta(totalUnidades)}>
                    {totalUnidades}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
