import { cookies } from "next/headers";

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
  return (
    <ModuloCrudContextualAdmin
      modulo="secciones"
      titulo="Colecciones web"
      token={token}
      itemsIniciales={resultado.estado === "ok" ? resultado.items : []}
      campoEstado="publicada"
      entidadImportacion="secciones_publicas"
      camposComunes={CAMPOS}
      tipoPayload="secciones"
    />
  );
}
