import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";

import { obtenerEstadoBackoffice } from "@/infraestructura/api/backoffice";

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
  const cookie = headers().get("cookie") ?? "";
  const acceso = await obtenerEstadoBackoffice(cookie);

  if (acceso.estado !== "autorizado") {
    return (
      <main className="admin-shell">
        <section className="admin-bloque">
          <h1>Acceso administrativo denegado</h1>
          <p>{acceso.detalle}</p>
          <p>
            Inicia sesión en backend y vuelve a intentar desde <a href="http://127.0.0.1:8000/admin/login/">Django Admin</a>.
          </p>
        </section>
      </main>
    );
  }

  return (
    <div className="admin-shell">
      <header className="admin-cabecera">
        <div>
          <p className="admin-eyebrow">Backoffice · La Botica de la Bruja Lore</p>
          <h1>Gestión editorial y comercial</h1>
        </div>
        <p className="admin-usuario">Sesión: {acceso.usuario.username}</p>
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
