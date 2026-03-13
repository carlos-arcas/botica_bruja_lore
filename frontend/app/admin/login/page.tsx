import { redirect } from "next/navigation";

import { FormularioLoginBackoffice } from "@/componentes/admin/FormularioLoginBackoffice";
import { obtenerUsuarioBackofficeSesionActual } from "@/infraestructura/auth/sesionBackoffice";

type Props = { searchParams?: { next?: string } };

export default async function AdminLoginPage({ searchParams }: Props): Promise<JSX.Element> {
  const usuario = await obtenerUsuarioBackofficeSesionActual();
  const nextDestino = searchParams?.next || "/admin";

  if (usuario) {
    redirect(nextDestino);
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
