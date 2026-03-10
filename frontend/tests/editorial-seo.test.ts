import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  METADATA_HUB_GUIAS,
  obtenerGuiaEditorialPorSlug,
  obtenerGuiasPublicadasIndexables,
  obtenerGuiasRelacionadasPorFicha,
  obtenerGuiasRelacionadasPorHub,
} from "../contenido/editorial/guiasEditoriales";
import { construirMetadataSeo } from "../infraestructura/seo/metadataSeo";
import {
  construirSchemasDetalleGuiaEditorial,
  construirSchemasHubEditorial,
} from "../infraestructura/seo/structuredData";

test("hub editorial mantiene metadata indexable y canonical", () => {
  const metadata = construirMetadataSeo({
    title: METADATA_HUB_GUIAS.title,
    description: METADATA_HUB_GUIAS.description,
    rutaCanonical: METADATA_HUB_GUIAS.rutaCanonical,
  });

  assert.equal((metadata.robots as { index?: boolean }).index, true);
  assert.equal(metadata.alternates?.canonical, "/guias");
  assert.equal(METADATA_HUB_GUIAS.title.includes("La Botica de la Bruja Lore"), true);
});

test("titles SEO de guías publicadas incluyen marca", () => {
  const guias = obtenerGuiasPublicadasIndexables();
  assert.equal(guias.every((guia) => guia.seo.title.includes("La Botica de la Bruja Lore")), true);
});

test("fuente editorial devuelve 3 guías publicadas/indexables", () => {
  const guias = obtenerGuiasPublicadasIndexables();
  assert.equal(guias.length, 3);
  assert.equal(guias.every((guia) => guia.publicada && guia.indexable), true);
});

test("relaciones editoriales por hub y ficha solo usan guías publicadas", () => {
  const porHub = obtenerGuiasRelacionadasPorHub("hierbas");
  const porFicha = obtenerGuiasRelacionadasPorFicha({ tipoFicha: "hierbas", slug: "melisa" });

  assert.equal(porHub.length > 0, true);
  assert.equal(porFicha.length > 0, true);
  assert.equal(porHub.every((guia) => !guia.slug.includes("borrador")), true);
  assert.equal(porFicha.every((guia) => guia.anchor.length >= 20), true);
});

test("detalle editorial emite Article y BreadcrumbList sin authors inventados", () => {
  const previo = process.env.PUBLIC_SITE_URL;
  process.env.PUBLIC_SITE_URL = "https://laboticabrujalore.com";

  const guia = obtenerGuiaEditorialPorSlug("hierbas-para-ritual-de-cierre-del-dia");
  assert.ok(guia);

  const schemas = construirSchemasDetalleGuiaEditorial(guia);

  process.env.PUBLIC_SITE_URL = previo;

  const article = schemas.find((schema) => schema["@type"] === "Article");
  const breadcrumb = schemas.find((schema) => schema["@type"] === "BreadcrumbList");

  assert.ok(article);
  assert.ok(breadcrumb);
  const articleData = article as Record<string, unknown>;
  assert.equal(articleData.author, undefined);
  assert.equal(articleData.aggregateRating, undefined);
  assert.equal(articleData.review, undefined);
});

test("hub editorial emite CollectionPage y breadcrumb", () => {
  const previo = process.env.PUBLIC_SITE_URL;
  process.env.PUBLIC_SITE_URL = "https://laboticabrujalore.com";

  const schemas = construirSchemasHubEditorial({
    ruta: "/guias",
    titulo: METADATA_HUB_GUIAS.title,
    descripcion: METADATA_HUB_GUIAS.description,
  });

  process.env.PUBLIC_SITE_URL = previo;

  assert.equal(schemas.some((schema) => schema["@type"] === "CollectionPage"), true);
  assert.equal(schemas.some((schema) => schema["@type"] === "BreadcrumbList"), true);
});

test("app router editorial integra bloque reutilizable y noindex en no publicados", () => {
  const sourceHub = readFileSync(join(process.cwd(), "app/guias/page.tsx"), "utf8");
  const sourceDetalle = readFileSync(join(process.cwd(), "app/guias/[slug]/page.tsx"), "utf8");

  assert.match(sourceHub, /JsonLd/);
  assert.match(sourceDetalle, /JsonLd/);
  assert.match(sourceDetalle, /indexable:\s*false/);
  assert.match(sourceDetalle, /obtenerEnlacesCatalogoParaGuia/);
  assert.match(sourceDetalle, /obtenerEnlacesFichaParaGuia/);
});
