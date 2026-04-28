import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FormularioLoginBackoffice } from "@/componentes/admin/FormularioLoginBackoffice";
import { obtenerUsuarioBackofficeSesionActual } from "@/infraestructura/auth/sesionBackoffice";
import { construirMetadataSeo } from "@/infraestructura/seo/metadataSeo";

type Props = { searchParams?: { next?: string } };

export const metadata: Metadata = construirMetadataSeo({
  title: "Acceso admin | La Botica de la Bruja Lore",
  description: "Acceso privado al backoffice.",
  indexable: false,
});

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
