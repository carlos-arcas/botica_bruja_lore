import { resolverUrlCanonicalAbsoluta } from "./metadataSeo";
import { ProductoCatalogo } from "../../contenido/catalogo/catalogo";
import { PlantaPublica } from "../api/herbal";
import { RitualDetallePublico } from "../api/rituales";

type ObjetoJsonLd = Record<string, unknown>;

type ItemBreadcrumb = {
  nombre: string;
  ruta: string;
};

const NOMBRE_SITIO = "La Botica de la Bruja Lore";

function construirObjetoBase(tipo: string, propiedades: Record<string, unknown>): ObjetoJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": tipo,
    ...propiedades,
  };
}

function construirSchemaOrganization(urlSitio: string): ObjetoJsonLd {
  return construirObjetoBase("Organization", {
    name: NOMBRE_SITIO,
    url: urlSitio,
  });
}

function construirSchemaWebSite(urlSitio: string): ObjetoJsonLd {
  return construirObjetoBase("WebSite", {
    name: NOMBRE_SITIO,
    url: urlSitio,
  });
}

function construirSchemaPagina(
  tipo: "WebPage" | "CollectionPage" | "ItemPage",
  url: string,
  nombre: string,
  descripcion: string,
): ObjetoJsonLd {
  return construirObjetoBase(tipo, {
    name: nombre,
    description: descripcion,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: NOMBRE_SITIO,
      url: resolverUrlCanonicalAbsoluta("/") ?? undefined,
    },
  });
}

function construirSchemaBreadcrumb(items: ItemBreadcrumb[]): ObjetoJsonLd | null {
  const elementos = items
    .map((item, indice) => {
      const url = resolverUrlCanonicalAbsoluta(item.ruta);
      if (!url) {
        return null;
      }

      return {
        "@type": "ListItem",
        position: indice + 1,
        name: item.nombre,
        item: url,
      };
    })
    .filter(Boolean);

  if (elementos.length === 0) {
    return null;
  }

  return construirObjetoBase("BreadcrumbList", {
    itemListElement: elementos,
  });
}

function construirOffersProducto(producto: ProductoCatalogo): ObjetoJsonLd | null {
  const precioNormalizado = producto.precioVisible
    .replace("€", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  if (!/^\d+(\.\d{1,2})?$/.test(precioNormalizado)) {
    return null;
  }

  return {
    "@type": "Offer",
    price: precioNormalizado,
    priceCurrency: "EUR",
    availability: producto.disponible
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    url: resolverUrlCanonicalAbsoluta(`/colecciones/${producto.slug}`) ?? undefined,
  };
}

export function construirSchemasHome(titulo: string, descripcion: string): ObjetoJsonLd[] {
  const urlHome = resolverUrlCanonicalAbsoluta("/");
  if (!urlHome) {
    return [];
  }

  return [
    construirSchemaOrganization(urlHome),
    construirSchemaWebSite(urlHome),
    construirSchemaPagina("WebPage", urlHome, titulo, descripcion),
  ];
}

export function construirSchemasLandingCatalogo(args: {
  ruta: string;
  titulo: string;
  descripcion: string;
  nombreListado: string;
}): ObjetoJsonLd[] {
  const url = resolverUrlCanonicalAbsoluta(args.ruta);
  if (!url) {
    return [];
  }

  const breadcrumb = construirSchemaBreadcrumb([
    { nombre: "Inicio", ruta: "/" },
    { nombre: args.nombreListado, ruta: args.ruta },
  ]);

  return [
    construirSchemaPagina("CollectionPage", url, args.titulo, args.descripcion),
    ...(breadcrumb ? [breadcrumb] : []),
  ];
}

export function construirSchemasFichaHerbal(planta: PlantaPublica): ObjetoJsonLd[] {
  const ruta = `/hierbas/${planta.slug}`;
  const url = resolverUrlCanonicalAbsoluta(ruta);
  if (!url) {
    return [];
  }

  const breadcrumb = construirSchemaBreadcrumb([
    { nombre: "Inicio", ruta: "/" },
    { nombre: "Hierbas", ruta: "/hierbas" },
    { nombre: planta.nombre, ruta },
  ]);

  const pagina = construirSchemaPagina("ItemPage", url, planta.nombre, planta.descripcion_breve);

  return [pagina, ...(breadcrumb ? [breadcrumb] : [])];
}

export function construirSchemasFichaRitual(ritual: RitualDetallePublico): ObjetoJsonLd[] {
  const ruta = `/rituales/${ritual.slug}`;
  const url = resolverUrlCanonicalAbsoluta(ruta);
  if (!url) {
    return [];
  }

  const breadcrumb = construirSchemaBreadcrumb([
    { nombre: "Inicio", ruta: "/" },
    { nombre: "Rituales", ruta: "/rituales" },
    { nombre: ritual.nombre, ruta },
  ]);

  const pagina = construirSchemaPagina("ItemPage", url, ritual.nombre, ritual.contexto_breve);

  return [pagina, ...(breadcrumb ? [breadcrumb] : [])];
}

export function construirSchemasFichaColeccion(producto: ProductoCatalogo): ObjetoJsonLd[] {
  const ruta = `/colecciones/${producto.slug}`;
  const url = resolverUrlCanonicalAbsoluta(ruta);
  if (!url) {
    return [];
  }

  const breadcrumb = construirSchemaBreadcrumb([
    { nombre: "Inicio", ruta: "/" },
    { nombre: "Colecciones", ruta: "/colecciones" },
    { nombre: producto.nombre, ruta },
  ]);

  const productSchema = construirObjetoBase("Product", {
    name: producto.nombre,
    description: producto.descripcion,
    category: producto.categoria,
    url,
    offers: construirOffersProducto(producto) ?? undefined,
  });

  return [productSchema, ...(breadcrumb ? [breadcrumb] : [])];
}


export function construirSchemasPaginaInformativa(args: {
  ruta: string;
  titulo: string;
  descripcion: string;
  incluirBreadcrumb: boolean;
}): ObjetoJsonLd[] {
  const url = resolverUrlCanonicalAbsoluta(args.ruta);
  if (!url) {
    return [];
  }

  const pagina = construirSchemaPagina("WebPage", url, args.titulo, args.descripcion);

  if (!args.incluirBreadcrumb) {
    return [pagina];
  }

  const breadcrumb = construirSchemaBreadcrumb([
    { nombre: "Inicio", ruta: "/" },
    { nombre: args.titulo, ruta: args.ruta },
  ]);

  return [pagina, ...(breadcrumb ? [breadcrumb] : [])];
}
