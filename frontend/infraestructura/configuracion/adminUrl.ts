const ORIGEN_ADMIN_LOCAL_POR_DEFECTO = "http://127.0.0.1:8000";

type VariablesEntornoPublicas = Record<string, string | undefined>;

function normalizarOrigen(origen: string | undefined): string {
  if (!origen || origen.trim().length === 0) {
    return ORIGEN_ADMIN_LOCAL_POR_DEFECTO;
  }

  return origen.replace(/\/+$/, "");
}

export function resolverBaseAdmin(variables: VariablesEntornoPublicas = process.env): string {
  return normalizarOrigen(variables.NEXT_PUBLIC_ADMIN_BASE_URL ?? variables.NEXT_PUBLIC_API_BASE_URL);
}

export function construirUrlAdmin(
  rutaAdmin: string = "/admin/",
  variables: VariablesEntornoPublicas = process.env,
): string {
  const rutaNormalizada = rutaAdmin.startsWith("/") ? rutaAdmin : `/${rutaAdmin}`;

  return new URL(rutaNormalizada, `${resolverBaseAdmin(variables)}/`).toString();
}
