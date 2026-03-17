import { redirect } from "next/navigation";

import { FormularioLoginBackoffice } from "@/componentes/admin/FormularioLoginBackoffice";
import { obtenerUsuarioBackofficeSesionActual } from "@/infraestructura/auth/sesionBackoffice";

export default async function LoginPage(): Promise<JSX.Element> {
  const usuario = await obtenerUsuarioBackofficeSesionActual();
  if (usuario) {
    redirect("/admin");
  }

  return (
    <main className="admin-shell">
      <section className="admin-bloque">
        <h1>Acceso admin</h1>
        <p>Inicia sesión con tu cuenta staff para gestionar el backoffice.</p>
        <FormularioLoginBackoffice />
      </section>
    </main>
  );
}
