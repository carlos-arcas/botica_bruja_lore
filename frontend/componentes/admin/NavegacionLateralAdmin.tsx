"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { obtenerEnlacesAdminVisibles } from "@/componentes/admin/enlacesAdmin";

export function NavegacionLateralAdmin(): JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="admin-nav" aria-label="Módulos de administración">
      <ul>
        {obtenerEnlacesAdminVisibles("sidebar").map((modulo) => {
          const activo = pathname === modulo.href;
          return (
            <li key={modulo.href}>
              <Link href={modulo.href} aria-current={activo ? "page" : undefined}>
                {modulo.etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
