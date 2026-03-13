import { cookies } from "next/headers";

import { ModuloImportacionAdmin } from "@/componentes/admin/ModuloImportacionAdmin";
import { NOMBRE_COOKIE_BACKOFFICE } from "@/infraestructura/auth/configuracion";

export default function AdminImportacionPage(): JSX.Element {
  const token = cookies().get(NOMBRE_COOKIE_BACKOFFICE)?.value;
  return <ModuloImportacionAdmin token={token} />;
}
