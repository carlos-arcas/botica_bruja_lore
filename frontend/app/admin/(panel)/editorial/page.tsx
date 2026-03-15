import { cookies } from "next/headers";

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
  { clave: "indexable", etiqueta: "Indexable", tipo: "checkbox" as const },
  { clave: "publicado", etiqueta: "Publicado", tipo: "checkbox" as const },
];

export default async function AdminEditorialPage(): Promise<JSX.Element> {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  const resultado = await obtenerListadoAdmin("editorial", new URLSearchParams(), token);
  return (
    <ModuloCrudContextualAdmin
      modulo="editorial"
      titulo="Artículos"
      token={token}
      itemsIniciales={resultado.estado === "ok" ? resultado.items : []}
      campoEstado="publicado"
      entidadImportacion="articulos_editoriales"
      camposComunes={CAMPOS}
      tipoPayload="editorial"
    />
  );
}
