import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { BotonLogoutBackoffice } from "@/componentes/admin/BotonLogoutBackoffice";
import { obtenerUsuarioBackofficeSesionActual } from "@/infraestructura/auth/sesionBackoffice";

import { NavegacionLateralAdmin } from "@/componentes/admin/NavegacionLateralAdmin";

export default async function AdminLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
  const usuario = await obtenerUsuarioBackofficeSesionActual();
  if (!usuario) {
    redirect("/admin/login?next=/admin");
  }

  return (
    <div className="admin-shell">
      <header className="admin-cabecera">
        <div>
          <p className="admin-eyebrow">Zona de administración</p>
          <h1>Backoffice · La Botica de la Bruja Lore</h1>
        </div>
        <div className="admin-sesion">
          <p className="admin-usuario">Sesión activa: {usuario.username}</p>
          <BotonLogoutBackoffice />
        </div>
      </header>
      <div className="admin-grid">
        <NavegacionLateralAdmin />
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
