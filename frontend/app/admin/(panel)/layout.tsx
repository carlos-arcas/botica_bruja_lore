import type { ReactNode } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BotonLogoutBackoffice } from "@/componentes/admin/BotonLogoutBackoffice";
import { NavegacionLateralAdmin } from "@/componentes/admin/NavegacionLateralAdmin";
import { obtenerUsuarioBackofficeSesionActual } from "@/infraestructura/auth/sesionBackoffice";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

export const metadata: Metadata = construirMetadataSeo({
  title: "Backoffice | La Botica de la Bruja Lore",
  description: "Area privada de operacion interna.",
  indexable: false,
});

export default async function AdminLayout({ children }: { children: ReactNode }): Promise<JSX.Element> {
  const usuario = await obtenerUsuarioBackofficeSesionActual();
  if (!usuario) {
    redirect("/admin/login?next=/admin");
  }

  return (
    <div className="admin-shell">
      <header className="admin-cabecera admin-cabecera--topbar">
        <div>
          <p className="admin-eyebrow">Zona de administración</p>
          <h1>Backoffice · La Botica de la Bruja Lore</h1>
        </div>
        <div className="admin-sesion">
          <p className="admin-usuario">Sesión activa: {usuario.username}</p>
          <BotonLogoutBackoffice />
        </div>
      </header>
      <NavegacionLateralAdmin />
      <main className="admin-main">{children}</main>
    </div>
  );
}
