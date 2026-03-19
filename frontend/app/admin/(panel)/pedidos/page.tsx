import { cookies } from "next/headers";

import { ModuloPedidosAdmin } from "@/componentes/admin/ModuloPedidosAdmin";
import { obtenerListadoAdmin } from "@/infraestructura/api/backoffice";
import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";

export default async function AdminPedidosPage(): Promise<JSX.Element> {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  const resultado = await obtenerListadoAdmin("pedidos", new URLSearchParams(), token);
  const items = resultado.estado === "ok" ? resultado.items : [];
  return <ModuloPedidosAdmin token={token} itemsIniciales={items} />;
}
