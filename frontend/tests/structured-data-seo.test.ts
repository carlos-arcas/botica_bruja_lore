import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { PRODUCTOS_CATALOGO } from "../contenido/catalogo/catalogo";
import { resolverUrlCanonicalAbsoluta } from "../infraestructura/seo/metadataSeo";
import {
  construirSchemasFichaColeccion,
  construirSchemasFichaHerbal,
  construirSchemasFichaRitual,
  construirSchemasHome,
  construirSchemasLandingCatalogo,
  construirSchemasPaginaInformativa,
} from "../infraestructura/seo/structuredData";

test("resolverUrlCanonicalAbsoluta limpia query y hash", () => {
  const url = resolverUrlCanonicalAbsoluta("/hierbas?utm=abc#frag", {
    PUBLIC_SITE_URL: "https://laboticabrujalore.com/",
  } as unknown as NodeJS.ProcessEnv);

  assert.equal(url, "https://laboticabrujalore.com/hierbas");
});

test("home emite Organization y WebSite con nombre real", () => {
  const previo = process.env.PUBLIC_SITE_URL;
  process.env.PUBLIC_SITE_URL = "https://laboticabrujalore.com";

  const schemas = construirSchemasHome("Inicio", "Demo");

  process.env.PUBLIC_SITE_URL = previo;

  assert.equal(schemas.some((schema) => schema["@type"] === "Organization"), true);
  assert.equal(schemas.some((schema) => schema["@type"] === "WebSite"), true);
  assert.equal(schemas.some((schema) => schema.name === "La Botica de la Bruja Lore"), true);
});

test("landing de catálogo emite CollectionPage y BreadcrumbList", () => {
  const previo = process.env.PUBLIC_SITE_URL;
  process.env.PUBLIC_SITE_URL = "https://laboticabrujalore.com";

  const schemas = construirSchemasLandingCatalogo({
    ruta: "/hierbas",
    titulo: "Hierbas a granel",
    descripcion: "Listado",
    nombreListado: "Hierbas",
  });

  process.env.PUBLIC_SITE_URL = previo;

  const collection = schemas.find((schema) => schema["@type"] === "CollectionPage");
  const breadcrumb = schemas.find((schema) => schema["@type"] === "BreadcrumbList");

  assert.equal(Boolean(collection), true);
  assert.equal(Boolean(breadcrumb), true);
  assert.equal((breadcrumb?.itemListElement as unknown[]).length, 2);
});

test("ficha de colección usa Product con Offer real sin ratings ni reviews", () => {
  const previo = process.env.PUBLIC_SITE_URL;
  process.env.PUBLIC_SITE_URL = "https://laboticabrujalore.com";

  const schemas = construirSchemasFichaColeccion(PRODUCTOS_CATALOGO[0]);

  process.env.PUBLIC_SITE_URL = previo;

  const product = schemas.find((schema) => schema["@type"] === "Product");

  assert.equal(Boolean(product), true);
  assert.equal(typeof product?.offers, "object");
  assert.equal(product?.aggregateRating, undefined);
  assert.equal(product?.review, undefined);
  assert.equal(product?.brand, undefined);
});

test("fichas herbal y ritual emiten ItemPage con breadcrumbs jerárquicos", () => {
  const previo = process.env.PUBLIC_SITE_URL;
  process.env.PUBLIC_SITE_URL = "https://laboticabrujalore.com";

  const schemasHerbal = construirSchemasFichaHerbal({
    slug: "melisa",
    nombre: "Melisa",
    descripcion_breve: "Calma suave",
    intenciones: [],
    urlDetalle: "/hierbas/melisa",
  });

  const schemasRitual = construirSchemasFichaRitual({
    slug: "luna-serena",
    nombre: "Luna Serena",
    contexto_breve: "Cierre del día",
    intenciones: [],
    ids_plantas_relacionadas: [],
    ids_productos_relacionados: [],
  });

  process.env.PUBLIC_SITE_URL = previo;

  const breadcrumbHerbal = schemasHerbal.find((schema) => schema["@type"] === "BreadcrumbList");
  const breadcrumbRitual = schemasRitual.find((schema) => schema["@type"] === "BreadcrumbList");

  assert.equal(schemasHerbal.some((schema) => schema["@type"] === "ItemPage"), true);
  assert.equal(schemasRitual.some((schema) => schema["@type"] === "ItemPage"), true);
  assert.equal((breadcrumbHerbal?.itemListElement as unknown[]).length, 3);
  assert.equal((breadcrumbRitual?.itemListElement as unknown[]).length, 3);
});

test("páginas clave renderizan componente JsonLd", () => {
  const home = readFileSync(join(process.cwd(), "app/page.tsx"), "utf8");
  const landingHierbas = readFileSync(join(process.cwd(), "app/hierbas/page.tsx"), "utf8");
  const detalleColeccion = readFileSync(join(process.cwd(), "app/colecciones/[slug]/page.tsx"), "utf8");

  assert.equal(home.includes("<JsonLd"), true);
  assert.equal(landingHierbas.includes("<JsonLd"), true);
  assert.equal(detalleColeccion.includes("<JsonLd"), true);
});


test("página informativa estratégica emite WebPage y breadcrumb opcional", () => {
  const previo = process.env.PUBLIC_SITE_URL;
  process.env.PUBLIC_SITE_URL = "https://laboticabrujalore.com";

  const schemas = construirSchemasPaginaInformativa({
    ruta: "/envios-y-preparacion",
    titulo: "Envíos y preparación",
    descripcion: "Detalle operativo",
    incluirBreadcrumb: true,
  });

  process.env.PUBLIC_SITE_URL = previo;

  assert.equal(schemas.some((schema) => schema["@type"] === "WebPage"), true);
  assert.equal(schemas.some((schema) => schema["@type"] === "BreadcrumbList"), true);
});
