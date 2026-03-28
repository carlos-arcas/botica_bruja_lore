"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { construirNavegacionPrincipal, esRutaActiva } from "@/contenido/shell/navegacionGlobal";

import estilos from "./shellComercial.module.css";

type NavegacionPrincipalProps = {
  mostrarLogs: boolean;
};

export function NavegacionPrincipal({ mostrarLogs }: NavegacionPrincipalProps): JSX.Element {
  const rutaActual = usePathname();
  const enlaces = construirNavegacionPrincipal(mostrarLogs);

  return (
    <nav aria-label="Navegacion principal" className={estilos.navegacion}>
      <ul>
        {enlaces.map((enlace) => {
          const activa = esRutaActiva(rutaActual, enlace);

          return (
            <li
              key={enlace.href}
              className={enlace.submenu ? estilos.itemConSubmenu : undefined}
            >
              <Link
                href={enlace.href}
                className={`${estilos.enlace} ${activa ? estilos.enlaceActiva : ""} ${
                  enlace.submenu ? estilos.enlaceConSubmenu : ""
                }`.trim()}
                aria-current={activa ? "page" : undefined}
              >
                {enlace.etiqueta}
              </Link>
              {enlace.submenu ? (
                <div className={estilos.submenu} aria-label={`Secciones de ${enlace.etiqueta}`}>
                  <ul>
                    {enlace.submenu.map((item) => {
                      const activaSubmenu = esRutaActiva(rutaActual, item);

                      return (
                        <li key={`${item.etiqueta}-${item.href}`}>
                          <Link
                            href={item.href}
                            className={`${estilos.submenuEnlace} ${
                              activaSubmenu ? estilos.submenuEnlaceActivo : ""
                            }`.trim()}
                            aria-current={activaSubmenu ? "page" : undefined}
                          >
                            <span>{item.etiqueta}</span>
                            {item.descripcion ? (
                              <span className={estilos.submenuDescripcion}>
                                {item.descripcion}
                              </span>
                            ) : null}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
