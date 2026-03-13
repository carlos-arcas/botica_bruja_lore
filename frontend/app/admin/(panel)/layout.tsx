import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { BotonLogoutBackoffice } from "@/componentes/admin/BotonLogoutBackoffice";
import { obtenerUsuarioBackofficeSesionActual } from "@/infraestructura/auth/sesionBackoffice";

const MODULOS_ADMIN = [
  { href: "/admin", etiqueta: "Dashboard" },
  { href: "/admin/productos", etiqueta: "Productos" },
  { href: "/admin/rituales", etiqueta: "Rituales" },
  { href: "/admin/editorial", etiqueta: "Editorial" },
  { href: "/admin/importacion", etiqueta: "Importación" },
  { href: "/admin/imagenes", etiqueta: "Imágenes" },
  { href: "/admin/ajustes", etiqueta: "Ajustes" },
];

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
            {MODULOS_ADMIN.map((modulo) => (
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
