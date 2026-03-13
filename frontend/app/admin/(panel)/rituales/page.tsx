import { cookies } from "next/headers";

import { ModuloCrudContextualAdmin } from "@/componentes/admin/ModuloCrudContextualAdmin";
import { obtenerListadoAdmin } from "@/infraestructura/api/backoffice";
import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";

const CAMPOS = [
  { clave: "nombre", etiqueta: "Nombre" },
  { clave: "contexto_breve", etiqueta: "Contexto breve", tipo: "textarea" as const },
  { clave: "contenido", etiqueta: "Contenido", tipo: "textarea" as const },
  { clave: "imagen_url", etiqueta: "Imagen" },
  { clave: "intenciones_relacionadas", etiqueta: "Intenciones (csv)" },
  { clave: "publicado", etiqueta: "Publicado", tipo: "checkbox" as const },
];

export default async function AdminRitualesPage(): Promise<JSX.Element> {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  const resultado = await obtenerListadoAdmin("rituales", new URLSearchParams(), token);
  return (
    <ModuloCrudContextualAdmin
      modulo="rituales"
      titulo="Rituales"
      token={token}
      itemsIniciales={resultado.estado === "ok" ? resultado.items : []}
      campoEstado="publicado"
      entidadImportacion="rituales"
      camposComunes={CAMPOS}
      construirPayload={(form) => form}
    />
  );
}
