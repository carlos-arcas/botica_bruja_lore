import { cookies } from "next/headers";

import { ModuloProductosAdmin } from "@/componentes/admin/ModuloProductosAdmin";
import { obtenerListadoAdmin } from "@/infraestructura/api/backoffice";
import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";

export default async function AdminProductosPage(): Promise<JSX.Element> {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  const resultado = await obtenerListadoAdmin("productos", new URLSearchParams(), token);
  const items = resultado.estado === "ok" ? resultado.items : [];
  return <ModuloProductosAdmin token={token} itemsIniciales={items} />;
}
