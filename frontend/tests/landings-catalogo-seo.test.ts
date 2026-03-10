import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { SEO_HOME } from "../contenido/home/seoHome";
import {
  INTRO_LISTADO_COLECCIONES,
  INTRO_LISTADO_HIERBAS,
  INTRO_LISTADO_RITUALES,
  METADATA_LISTADO_COLECCIONES,
  METADATA_LISTADO_HIERBAS,
  METADATA_LISTADO_RITUALES,
} from "../contenido/catalogo/seoLandingsCatalogo";
import { construirMetadataSeo } from "../infraestructura/seo/metadataSeo";

function contarCoincidencias(texto: string, patron: RegExp): number {
  return [...texto.matchAll(patron)].length;
}

test("metadata SEO de landings de catálogo usa title y description únicos", () => {
  const previo = process.env.PUBLIC_SITE_URL;
  process.env.PUBLIC_SITE_URL = "https://laboticabrujalore.com";

  const metadataHierbas = construirMetadataSeo(METADATA_LISTADO_HIERBAS);
  const metadataRituales = construirMetadataSeo(METADATA_LISTADO_RITUALES);
  const metadataColecciones = construirMetadataSeo(METADATA_LISTADO_COLECCIONES);

  process.env.PUBLIC_SITE_URL = previo;

  assert.notEqual(METADATA_LISTADO_HIERBAS.title, METADATA_LISTADO_RITUALES.title);
  assert.notEqual(METADATA_LISTADO_HIERBAS.title, METADATA_LISTADO_COLECCIONES.title);
  assert.notEqual(METADATA_LISTADO_RITUALES.description, METADATA_LISTADO_COLECCIONES.description);
  assert.notEqual(METADATA_LISTADO_HIERBAS.description, SEO_HOME.description);

  assert.equal(metadataHierbas.alternates?.canonical, "/hierbas");
  assert.equal(metadataRituales.alternates?.canonical, "/rituales");
  assert.equal(metadataColecciones.alternates?.canonical, "/colecciones");

  assert.equal((metadataHierbas.robots as { index?: boolean }).index, true);
  assert.equal((metadataRituales.robots as { follow?: boolean }).follow, true);
  assert.equal((metadataColecciones.robots as { index?: boolean }).index, true);
});

test("cada landing mantiene un único H1 y copy indexable mínimo", () => {
  const paginaHierbas = readFileSync(join(process.cwd(), "app/hierbas/page.tsx"), "utf8");
  const paginaRituales = readFileSync(join(process.cwd(), "app/rituales/page.tsx"), "utf8");
  const componenteColecciones = readFileSync(
    join(process.cwd(), "componentes/catalogo/CatalogoColecciones.tsx"),
    "utf8",
  );

  assert.equal(contarCoincidencias(paginaHierbas, /<h1[\s>]/g), 1);
  assert.equal(contarCoincidencias(paginaRituales, /<h1[\s>]/g), 1);
  assert.equal(contarCoincidencias(componenteColecciones, /<h1[\s>]/g), 1);

  assert.equal(INTRO_LISTADO_HIERBAS.parrafos.length >= 2, true);
  assert.equal(INTRO_LISTADO_RITUALES.parrafos.length >= 2, true);
  assert.equal(INTRO_LISTADO_COLECCIONES.parrafos.length >= 2, true);

  assert.equal(INTRO_LISTADO_HIERBAS.enlacesInternos.length >= 3, true);
  assert.equal(INTRO_LISTADO_RITUALES.enlacesInternos.length >= 3, true);
  assert.equal(INTRO_LISTADO_COLECCIONES.enlacesInternos.length >= 3, true);
});
