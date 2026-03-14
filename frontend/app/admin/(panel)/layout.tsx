import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BotonLogoutBackoffice } from "@/componentes/admin/BotonLogoutBackoffice";
import { obtenerUsuarioBackofficeSesionActual } from "@/infraestructura/auth/sesionBackoffice";

import { obtenerEnlacesAdminVisibles } from "@/componentes/admin/enlacesAdmin";

export default async function AdminLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
  const usuario = await obtenerUsuarioBackofficeSesionActual();
  if (!usuario) {
    redirect("/admin/login?next=/admin");
  }

  return (
    <div className="admin-shell">
      <header className="admin-cabecera">
        <div>
          <p className="admin-eyebrow">Backoffice · La Botica de la Bruja Lore</p>
          <h1>Gestión editorial y comercial</h1>
        </div>
        <div>
          <p className="admin-usuario">Sesión: {usuario.username}</p>
          <BotonLogoutBackoffice />
        </div>
      </header>
      <div className="admin-grid">
        <nav className="admin-nav" aria-label="Módulos de administración">
          <ul>
            {obtenerEnlacesAdminVisibles("sidebar").map((modulo) => (
              <li key={modulo.href}>
                <Link href={modulo.href}>{modulo.etiqueta}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
