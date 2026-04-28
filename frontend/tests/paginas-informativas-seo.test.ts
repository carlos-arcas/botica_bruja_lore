import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { PAGINAS_LEGALES_COMERCIALES } from "../contenido/legal/paginasLegalesComerciales";

test("política secundaria SEO clasifica páginas informativas legales de forma explícita", () => {
  const envios = PAGINAS_LEGALES_COMERCIALES.find((pagina) => pagina.ruta === "/envios-y-preparacion");
  const privacidad = PAGINAS_LEGALES_COMERCIALES.find((pagina) => pagina.ruta === "/privacidad");
  const condiciones = PAGINAS_LEGALES_COMERCIALES.find((pagina) => pagina.ruta === "/condiciones-encargo");
  const devoluciones = PAGINAS_LEGALES_COMERCIALES.find((pagina) => pagina.ruta === "/devoluciones");
  const contacto = PAGINAS_LEGALES_COMERCIALES.find((pagina) => pagina.ruta === "/contacto");

  assert.equal(envios?.seo.indexable, true);
  assert.equal(envios?.seo.incluirEnSitemap, true);
  assert.equal(envios?.seo.esEstrategica, true);

  assert.equal(privacidad?.seo.indexable, false);
  assert.equal(privacidad?.seo.incluirEnSitemap, false);
  assert.equal(condiciones?.seo.indexable, false);
  assert.equal(condiciones?.seo.incluirEnSitemap, false);
  assert.equal(devoluciones?.seo.indexable, false);
  assert.equal(devoluciones?.seo.incluirEnSitemap, false);
  assert.equal(contacto?.seo.indexable, false);
  assert.equal(contacto?.seo.incluirEnSitemap, false);
});

test("rutas informativas aplican metadata coherente con su clasificación SEO", () => {
  const envios = readFileSync(join(process.cwd(), "app/envios-y-preparacion/page.tsx"), "utf8");
  const privacidad = readFileSync(join(process.cwd(), "app/privacidad/page.tsx"), "utf8");
  const condiciones = readFileSync(join(process.cwd(), "app/condiciones-encargo/page.tsx"), "utf8");
  const devoluciones = readFileSync(join(process.cwd(), "app/devoluciones/page.tsx"), "utf8");
  const contacto = readFileSync(join(process.cwd(), "app/contacto/page.tsx"), "utf8");

  assert.match(envios, /indexable:\s*CONTENIDO\.seo\.indexable/);
  assert.match(privacidad, /indexable:\s*CONTENIDO\.seo\.indexable/);
  assert.match(condiciones, /indexable:\s*CONTENIDO\.seo\.indexable/);
  assert.match(devoluciones, /indexable:\s*CONTENIDO\.seo\.indexable/);
  assert.match(contacto, /indexable:\s*CONTENIDO\.seo\.indexable/);
});

test("solo páginas informativas estratégicas emiten JsonLd de tipo WebPage", () => {
  const laBotica = readFileSync(join(process.cwd(), "app/la-botica/page.tsx"), "utf8");
  const envios = readFileSync(join(process.cwd(), "app/envios-y-preparacion/page.tsx"), "utf8");
  const privacidad = readFileSync(join(process.cwd(), "app/privacidad/page.tsx"), "utf8");

  assert.match(laBotica, /construirSchemasPaginaInformativa/);
  assert.match(envios, /construirSchemasPaginaInformativa/);
  assert.equal(privacidad.includes("construirSchemasPaginaInformativa"), false);
});
