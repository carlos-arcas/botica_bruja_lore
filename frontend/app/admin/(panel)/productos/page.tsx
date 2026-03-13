// Admin / Productos
import { cookies } from "next/headers";

import { ModuloCrudAdmin } from "@/componentes/admin/ModuloCrudAdmin";
import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";
import { obtenerListadoAdmin } from "@/infraestructura/api/backoffice";

export default async function AdminProductosPage(): Promise<JSX.Element> {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  const resultado = await obtenerListadoAdmin("productos", new URLSearchParams(), token);
  const items = resultado.estado === "ok" ? resultado.items : [];

  return <ModuloCrudAdmin modulo="productos" titulo="Productos" token={token} itemsIniciales={items} campoEstado="publicado" plantilla={{ id: "", sku: "", slug: "", nombre: "", tipo_producto: "", categoria_comercial: "", seccion_publica: "", descripcion_corta: "", precio_visible: "", imagen_url: "", orden_publicacion: 100, publicado: false }} />;
}
