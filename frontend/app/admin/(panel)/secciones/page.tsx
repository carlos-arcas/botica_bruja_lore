import { cookies } from "next/headers";

import { ModuloCrudAdmin } from "@/componentes/admin/ModuloCrudAdmin";
import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";
import { obtenerListadoAdmin } from "@/infraestructura/api/backoffice";

export default async function AdminSeccionesPage(): Promise<JSX.Element> {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  const resultado = await obtenerListadoAdmin("secciones", new URLSearchParams(), token);
  return <ModuloCrudAdmin modulo="secciones" titulo="Secciones públicas" token={token} itemsIniciales={resultado.estado === "ok" ? resultado.items : []} campoEstado="publicada" plantilla={{ id: "", slug: "", nombre: "", descripcion: "", orden: 100, publicada: false }} />;
}
