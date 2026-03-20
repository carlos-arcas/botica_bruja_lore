import { cookies } from "next/headers";

import { resolverEstadoRenderListadoAdmin } from "@/componentes/admin/estadoListadoAdmin";
import { ModuloCrudContextualAdmin } from "@/componentes/admin/ModuloCrudContextualAdmin";
import { obtenerListadoAdmin } from "@/infraestructura/api/backoffice";
import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";
import { normalizarItemsRituales } from "@/infraestructura/configuracion/adminRituales";

const CAMPOS = [
  { clave: "nombre", etiqueta: "Nombre" },
  { clave: "contexto_breve", etiqueta: "Contexto breve", tipo: "textarea" as const },
  { clave: "contenido", etiqueta: "Contenido", tipo: "textarea" as const },
  { clave: "imagen_url", etiqueta: "Imagen", tipo: "imagen" as const },
  { clave: "intenciones_relacionadas", etiqueta: "Intenciones (csv)" },
  { clave: "productos_relacionados", etiqueta: "Productos recomendados para este ritual", tipo: "selector_productos" as const },
  { clave: "publicado", etiqueta: "Publicado", tipo: "checkbox" as const },
];

export default async function AdminRitualesPage(): Promise<JSX.Element> {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  const [resultado, productos] = await Promise.all([
    obtenerListadoAdmin("rituales", new URLSearchParams(), token),
    obtenerListadoAdmin("productos", new URLSearchParams(), token),
  ]);
  const estadoInicial = resolverEstadoRenderListadoAdmin(resultado, {
    mensajeVacio: "Todavía no hay rituales creados en el backoffice.",
    mensajeDenegado: "No pudimos cargar rituales porque tu sesión administrativa no es válida o no tiene permisos.",
    mensajeError: "No pudimos cargar rituales por un error del backoffice.",
  });
  const opcionesProductos =
    productos.estado === "ok"
      ? productos.items.map((item) => ({
          valor: String(item.id ?? ""),
          etiqueta: `${String(item.nombre ?? "")} · ${String(item.sku ?? "")}`.trim(),
        }))
      : [];

  return (
    <ModuloCrudContextualAdmin
      modulo="rituales"
      titulo="Rituales"
      token={token}
      itemsIniciales={normalizarItemsRituales(estadoInicial.items)}
      estadoListadoInicial={estadoInicial.estado}
      campoEstado="publicado"
      entidadImportacion="rituales"
      camposComunes={CAMPOS.map((campo) => campo.clave === "productos_relacionados" ? { ...campo, opciones: opcionesProductos } : campo)}
      tipoPayload="rituales"
    />
  );
}
