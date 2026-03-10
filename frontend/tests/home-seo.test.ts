import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { ENLACES_INTERNOS_HOME, INTRO_HOME } from "../contenido/home/contenidoHome";
import { SEO_HOME } from "../contenido/home/seoHome";
import { construirMetadataSeo } from "../infraestructura/seo/metadataSeo";

function contarCoincidencias(texto: string, patron: RegExp): number {
  return [...texto.matchAll(patron)].length;
}

test("metadata SEO de home conserva marca exacta y señales indexables", () => {
  const previo = process.env.PUBLIC_SITE_URL;
  process.env.PUBLIC_SITE_URL = "https://laboticabrujalore.com";

  const metadata = construirMetadataSeo({
    title: SEO_HOME.title,
    description: SEO_HOME.description,
    rutaCanonical: "/",
  });

  process.env.PUBLIC_SITE_URL = previo;

  assert.equal(SEO_HOME.title.includes("La Botica de la Bruja Lore"), true);
  assert.equal(metadata.description?.includes("ecommerce editorial"), true);
  assert.equal(metadata.alternates?.canonical, "/");
  assert.equal((metadata.robots as { index?: boolean }).index, true);
  assert.equal((metadata.robots as { follow?: boolean }).follow, true);
});

test("home mantiene un solo h1 y está alineado a la marca", () => {
  const hero = readFileSync(join(process.cwd(), "componentes/home/HeroPortada.tsx"), "utf8");

  assert.equal(contarCoincidencias(hero, /<h1[\s>]/g), 1);
  assert.equal(SEO_HOME.h1.includes("La Botica de la Bruja Lore"), true);
});

test("home expone copy indexable y enlaces internos clave", () => {
  assert.equal(INTRO_HOME.parrafos.length >= 2, true);
  assert.equal(INTRO_HOME.parrafos.join(" ").includes("catálogo comercial"), true);
  assert.equal(ENLACES_INTERNOS_HOME.length >= 4, true);
  assert.deepEqual(
    ENLACES_INTERNOS_HOME.map((enlace) => enlace.href),
    ["/hierbas", "/rituales", "/colecciones", "/la-botica"],
  );
});
