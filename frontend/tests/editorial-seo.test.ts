import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  obtenerOpcionesFiltroHub,
  obtenerOpcionesFiltroTema,
  resolverEstadoIndiceGuias,
} from "../contenido/editorial/indiceGuias";
import {
  METADATA_HUB_GUIAS,
  obtenerGuiaEditorialPorSlug,
  obtenerGuiasPublicadasIndexables,
  obtenerGuiasRelacionadasPorFicha,
  obtenerGuiasRelacionadasPorHub,
  obtenerSubhubEditorialParaGuia,
  obtenerSubhubsEditorialesIndexables,
} from "../contenido/editorial/guiasEditoriales";
import { construirMetadataSeo } from "../infraestructura/seo/metadataSeo";
import {
  construirSchemasDetalleGuiaEditorial,
  construirSchemasHubEditorial,
  construirSchemasSubhubEditorial,
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

test("subhubs editoriales válidos solo se publican con masa mínima", () => {
  const subhubs = obtenerSubhubsEditorialesIndexables();

  assert.equal(subhubs.length, 3);
  assert.equal(subhubs.every((subhub) => subhub.indexable && subhub.publicada), true);
  assert.equal(subhubs.every((subhub) => subhub.seo.title.includes("La Botica de la Bruja Lore")), true);
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

test("subhub editorial emite CollectionPage y breadcrumb", () => {
  const previo = process.env.PUBLIC_SITE_URL;
  process.env.PUBLIC_SITE_URL = "https://laboticabrujalore.com";

  const subhub = obtenerSubhubsEditorialesIndexables()[0];
  const schemas = construirSchemasSubhubEditorial(subhub);

  process.env.PUBLIC_SITE_URL = previo;

  assert.equal(schemas.some((schema) => schema["@type"] === "CollectionPage"), true);
  assert.equal(schemas.some((schema) => schema["@type"] === "BreadcrumbList"), true);
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

test("app router editorial integra subhubs y relación guía -> subhub", () => {
  const sourceHub = readFileSync(join(process.cwd(), "app/guias/page.tsx"), "utf8");
  const sourceDetalle = readFileSync(join(process.cwd(), "app/guias/[slug]/page.tsx"), "utf8");
  const sourceSubhub = readFileSync(join(process.cwd(), "app/guias/temas/[slug]/page.tsx"), "utf8");

  assert.match(sourceHub, /\/guias\/temas\//);
  assert.match(sourceDetalle, /obtenerSubhubEditorialParaGuia/);
  assert.match(sourceSubhub, /construirSchemasSubhubEditorial/);
  assert.match(sourceSubhub, /rutaCanonical: `\/guias\/temas\/\$\{subhub\.slug\}`/);
});

test("cada guía publicada enlaza a un subhub temático indexable", () => {
  const guias = obtenerGuiasPublicadasIndexables();

  assert.equal(guias.every((guia) => Boolean(obtenerSubhubEditorialParaGuia(guia))), true);
});

test("índice editorial filtra por tema y excluye borradores/no indexables", () => {
  const estado = resolverEstadoIndiceGuias({ tema: "hierbas" });

  assert.equal(estado.resultados.length, 1);
  assert.equal(estado.resultados[0]?.slug, "hierbas-para-ritual-de-cierre-del-dia");
  assert.equal(estado.resultados.every((guia) => guia.publicada && guia.indexable), true);
});

test("índice editorial permite segmentar por hub relacionado", () => {
  const estado = resolverEstadoIndiceGuias({ hub: "la-botica" });

  assert.equal(estado.resultados.length, 2);
  assert.equal(
    estado.resultados.every((guia) => guia.relaciones.hubs_relacionados.some((enlace) => enlace.href === "/la-botica")),
    true,
  );
});

test("índice editorial devuelve estado vacío limpio para combinación sin resultados", () => {
  const estado = resolverEstadoIndiceGuias({ tema: "hierbas", hub: "la-botica" });

  assert.equal(estado.resultados.length, 0);
});

test("opciones de filtro exponen conteos por tema y hub", () => {
  const temas = obtenerOpcionesFiltroTema();
  const hubs = obtenerOpcionesFiltroHub();

  assert.equal(temas[0]?.valor, "todas");
  assert.equal(temas[0]?.cantidad, 3);
  assert.equal(hubs.some((hub) => hub.valor === "la-botica" && hub.cantidad === 2), true);
});
