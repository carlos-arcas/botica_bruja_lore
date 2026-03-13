import { construirUrlAdmin } from "./adminUrl";

export function construirRutaAdminDesdeSegmentos(segmentos: string[] | undefined): string {
  const rutaAnidada = (segmentos ?? []).join("/");

  return rutaAnidada.length > 0 ? `/admin/${rutaAnidada}` : "/admin/";
}

export function resolverDestinoAdmin(rutaBusqueda: string, segmentos?: string[]): string {
  const rutaAdmin = construirRutaAdminDesdeSegmentos(segmentos);

  return construirUrlAdmin(`${rutaAdmin}${rutaBusqueda}`);
}
