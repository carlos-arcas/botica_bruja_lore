import { cookies } from "next/headers";

import { ModuloCrudAdmin } from "@/componentes/admin/ModuloCrudAdmin";
import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";
import { obtenerListadoAdmin } from "@/infraestructura/api/backoffice";

export default async function AdminRitualesPage(): Promise<JSX.Element> {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  const resultado = await obtenerListadoAdmin("rituales", new URLSearchParams(), token);
  return <ModuloCrudAdmin modulo="rituales" titulo="Rituales" token={token} itemsIniciales={resultado.estado === "ok" ? resultado.items : []} campoEstado="publicado" plantilla={{ id: "", slug: "", nombre: "", contexto_breve: "", contenido: "", imagen_url: "", publicado: false }} />;
}
