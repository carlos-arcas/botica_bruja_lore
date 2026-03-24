import { cookies } from "next/headers";

import { ModuloInventarioAdmin } from "@/componentes/admin/ModuloInventarioAdmin";
import { resolverEstadoRenderListadoAdmin } from "@/componentes/admin/estadoListadoAdmin";
import { ItemInventario, obtenerListadoAdmin } from "@/infraestructura/api/backoffice";
import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";

function normalizarItemsInventario(items: Record<string, unknown>[]): ItemInventario[] {
  return items.map((item) => ({
    id_producto: String(item.id_producto ?? ""),
    producto_nombre: String(item.producto_nombre ?? ""),
    unidad_base: (item.unidad_base === "g" || item.unidad_base === "ml" ? item.unidad_base : "ud") as "ud" | "g" | "ml",
    cantidad_disponible: Number(item.cantidad_disponible ?? 0),
    umbral_bajo_stock: item.umbral_bajo_stock === null || typeof item.umbral_bajo_stock === "number" ? (item.umbral_bajo_stock as number | null) : null,
    bajo_stock: Boolean(item.bajo_stock),
    fecha_actualizacion: typeof item.fecha_actualizacion === "string" ? item.fecha_actualizacion : null,
    fecha_creacion: typeof item.fecha_creacion === "string" ? item.fecha_creacion : null,
  }));
}

export default async function AdminInventarioPage(): Promise<JSX.Element> {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  const resultado = await obtenerListadoAdmin("inventario", new URLSearchParams(), token);
  const estadoInicial = resolverEstadoRenderListadoAdmin(resultado, {
    mensajeVacio: "No hay inventarios registrados todavía.",
    mensajeDenegado: "No pudimos cargar inventario porque tu sesión administrativa no es válida o no tiene permisos.",
    mensajeError: "No pudimos cargar inventario por un error del backoffice.",
  });

  return <ModuloInventarioAdmin token={token} itemsIniciales={normalizarItemsInventario(estadoInicial.items)} estadoListadoInicial={estadoInicial.estado} />;
}
