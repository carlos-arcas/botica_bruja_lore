"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { obtenerEnlacesAdminVisibles } from "@/componentes/admin/enlacesAdmin";

function esModuloActivo(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavegacionLateralAdmin(): JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="admin-nav admin-topbar-nav" aria-label="Navegación de backoffice">
      <ul>
        {obtenerEnlacesAdminVisibles("topbar").map((modulo) => {
          const activo = esModuloActivo(pathname, modulo.href);
          return (
            <li key={modulo.href}>
              <Link href={modulo.href} aria-current={activo ? "page" : undefined} className={activo ? "admin-nav-link admin-nav-link--activo" : "admin-nav-link"}>
                {modulo.etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
