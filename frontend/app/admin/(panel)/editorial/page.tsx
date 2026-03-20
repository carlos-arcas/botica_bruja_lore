import { cookies } from "next/headers";

import { resolverEstadoRenderListadoAdmin } from "@/componentes/admin/estadoListadoAdmin";
import { ModuloCrudContextualAdmin } from "@/componentes/admin/ModuloCrudContextualAdmin";
import { obtenerListadoAdmin } from "@/infraestructura/api/backoffice";
import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";

const CAMPOS = [
  { clave: "titulo", etiqueta: "Título" },
  { clave: "resumen", etiqueta: "Resumen", tipo: "textarea" as const },
  { clave: "contenido", etiqueta: "Contenido", tipo: "textarea" as const },
  { clave: "tema", etiqueta: "Tema" },
  { clave: "hub", etiqueta: "Hub" },
  { clave: "subhub", etiqueta: "Subhub" },
  { clave: "seccion_publica", etiqueta: "Dónde se mostrará" },
  { clave: "imagen_url", etiqueta: "Imagen", tipo: "imagen" as const },
  { clave: "productos_relacionados", etiqueta: "Productos relacionados", tipo: "selector_productos" as const },
  { clave: "indexable", etiqueta: "Indexable", tipo: "checkbox" as const },
  { clave: "publicado", etiqueta: "Publicado", tipo: "checkbox" as const },
];

export default async function AdminEditorialPage(): Promise<JSX.Element> {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  const [resultado, productos] = await Promise.all([
    obtenerListadoAdmin("editorial", new URLSearchParams(), token),
    obtenerListadoAdmin("productos", new URLSearchParams(), token),
  ]);
  const estadoInicial = resolverEstadoRenderListadoAdmin(resultado, {
    mensajeVacio: "Todavía no hay artículos editoriales creados.",
    mensajeDenegado: "No pudimos cargar editorial porque tu sesión administrativa no es válida o no tiene permisos.",
    mensajeError: "No pudimos cargar editorial por un error del backoffice.",
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
      modulo="editorial"
      titulo="Artículos"
      token={token}
      itemsIniciales={estadoInicial.items}
      estadoListadoInicial={estadoInicial.estado}
      campoEstado="publicado"
      entidadImportacion="articulos_editoriales"
      camposComunes={CAMPOS.map((campo) => campo.clave === "productos_relacionados" ? { ...campo, opciones: opcionesProductos } : campo)}
      tipoPayload="editorial"
    />
  );
}
