import { cookies } from "next/headers";

import { ModuloPedidosAdmin } from "@/componentes/admin/ModuloPedidosAdmin";
import { resolverEstadoRenderListadoAdmin } from "@/componentes/admin/estadoListadoAdmin";
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
  const estadoInicial = resolverEstadoRenderListadoAdmin(resultado, {
    mensajeVacio: "No hay pedidos demo que coincidan con el filtro actual.",
    mensajeDenegado: "No pudimos cargar pedidos porque tu sesión administrativa no es válida o no tiene permisos.",
    mensajeError: "No pudimos cargar pedidos por un error del backoffice.",
  });

  return <ModuloPedidosAdmin token={token} itemsIniciales={estadoInicial.items} estadoListadoInicial={estadoInicial.estado} estadoActivo={searchParams?.estado ?? ""} />;
}
