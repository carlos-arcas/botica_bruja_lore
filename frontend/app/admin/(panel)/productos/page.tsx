import { cookies } from "next/headers";

import { ModuloProductosAdmin } from "@/componentes/admin/ModuloProductosAdmin";
import { resolverEstadoRenderListadoAdmin } from "@/componentes/admin/estadoListadoAdmin";
import { obtenerListadoAdmin } from "@/infraestructura/api/backoffice";
import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";

export default async function AdminProductosPage(): Promise<JSX.Element> {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  const resultado = await obtenerListadoAdmin("productos", new URLSearchParams(), token);
  const estadoInicial = resolverEstadoRenderListadoAdmin(resultado, {
    mensajeVacio: "No hay productos registrados todavía en esta colección.",
    mensajeDenegado: "No pudimos cargar productos porque tu sesión administrativa no es válida o no tiene permisos.",
    mensajeError: "No pudimos cargar productos por un error del backoffice.",
  });

  return <ModuloProductosAdmin token={token} itemsIniciales={estadoInicial.items} estadoListadoInicial={estadoInicial.estado} />;
}
