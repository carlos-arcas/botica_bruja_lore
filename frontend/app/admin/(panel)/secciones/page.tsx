import { cookies } from "next/headers";

import { resolverEstadoRenderListadoAdmin } from "@/componentes/admin/estadoListadoAdmin";
import { ModuloCrudContextualAdmin } from "@/componentes/admin/ModuloCrudContextualAdmin";
import { obtenerListadoAdmin } from "@/infraestructura/api/backoffice";
import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";

const CAMPOS = [
  { clave: "nombre", etiqueta: "Nombre" },
  { clave: "descripcion", etiqueta: "Descripción", tipo: "textarea" as const },
  { clave: "orden", etiqueta: "Orden" },
  { clave: "publicada", etiqueta: "Publicada", tipo: "checkbox" as const },
];

export default async function AdminSeccionesPage(): Promise<JSX.Element> {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  const resultado = await obtenerListadoAdmin("secciones", new URLSearchParams(), token);
  const estadoInicial = resolverEstadoRenderListadoAdmin(resultado, {
    mensajeVacio: "Todavía no hay categorías de catálogo creadas.",
    mensajeDenegado: "No pudimos cargar secciones porque tu sesión administrativa no es válida o no tiene permisos.",
    mensajeError: "No pudimos cargar secciones por un error del backoffice.",
  });

  return (
    <ModuloCrudContextualAdmin
      modulo="secciones"
      titulo="Categorías de catálogo"
      token={token}
      itemsIniciales={estadoInicial.items}
      estadoListadoInicial={estadoInicial.estado}
      campoEstado="publicada"
      entidadImportacion="secciones_publicas"
      camposComunes={CAMPOS}
      tipoPayload="secciones"
    />
  );
}
