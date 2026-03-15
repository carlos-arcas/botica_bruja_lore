import { cookies } from "next/headers";

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
  const opcionesProductos =
    productos.estado === "ok"
      ? productos.items.map((item) => ({
          valor: String(item.id ?? ""),
          etiqueta: `${String(item.nombre ?? "")} · ${String(item.sku ?? "")}`.trim(),
        }))
      : [];
  const errorInicial = resultado.estado === "error" ? "No se pudieron cargar los rituales en este momento." : "";
  const itemsIniciales = resultado.estado === "ok" ? normalizarItemsRituales(resultado.items) : [];
  return (
    <ModuloCrudContextualAdmin
      modulo="rituales"
      titulo="Rituales"
      token={token}
      itemsIniciales={itemsIniciales}
      campoEstado="publicado"
      entidadImportacion="rituales"
      camposComunes={CAMPOS.map((campo) => campo.clave === "productos_relacionados" ? { ...campo, opciones: opcionesProductos } : campo)}
      tipoPayload="rituales"
      errorInicial={errorInicial}
    />
  );
}
