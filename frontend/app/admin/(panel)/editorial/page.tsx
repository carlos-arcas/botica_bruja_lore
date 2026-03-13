import { cookies } from "next/headers";

import { ModuloCrudAdmin } from "@/componentes/admin/ModuloCrudAdmin";
import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";
import { obtenerListadoAdmin } from "@/infraestructura/api/backoffice";

export default async function AdminEditorialPage(): Promise<JSX.Element> {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  const resultado = await obtenerListadoAdmin("editorial", new URLSearchParams(), token);
  return <ModuloCrudAdmin modulo="editorial" titulo="Editorial" token={token} itemsIniciales={resultado.estado === "ok" ? resultado.items : []} campoEstado="publicado" plantilla={{ id: "", slug: "", titulo: "", resumen: "", contenido: "", tema: "", hub: "", subhub: "", imagen_url: "", indexable: true, publicado: false, seccion_publica: "" }} />;
}
