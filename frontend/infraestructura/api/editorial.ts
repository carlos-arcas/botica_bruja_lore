import type { ProductoSeccionPublica } from "@/infraestructura/api/herbal";

export type ArticuloEditorialPublico = {
  slug: string;
  titulo: string;
  resumen: string;
  contenido: string;
  tema: string;
  hub: string;
  subhub: string;
  indexable: boolean;
  fecha_publicacion: string | null;
  productos_relacionados: ProductoSeccionPublica[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

export async function obtenerArticuloEditorialPublico(slug: string): Promise<ArticuloEditorialPublico | null> {
  const endpoint = `${API_BASE_URL}/api/v1/herbal/editorial/${slug}/`;
  try {
    const respuesta = await fetch(endpoint, { headers: { Accept: "application/json" }, next: { revalidate: 120 } });
    if (respuesta.status === 404 || !respuesta.ok) return null;
    const data = (await respuesta.json()) as { articulo?: ArticuloEditorialPublico };
    return data.articulo ?? null;
  } catch {
    return null;
  }
}
