import { cookies } from "next/headers";

import { ModuloPedidosAdmin } from "@/componentes/admin/ModuloPedidosAdmin";
import { obtenerListadoAdmin } from "@/infraestructura/api/backoffice";
import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";

type Props = {
  searchParams?: { estado?: string };
};

export default async function AdminPedidosPage({ searchParams }: Props): Promise<JSX.Element> {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  const query = new URLSearchParams();
  if (searchParams?.estado) query.set("estado", searchParams.estado);
  const resultado = await obtenerListadoAdmin("pedidos", query, token);
  const items = resultado.estado === "ok" ? resultado.items : [];
  return <ModuloPedidosAdmin token={token} itemsIniciales={items} estadoActivo={searchParams?.estado ?? ""} />;
}
