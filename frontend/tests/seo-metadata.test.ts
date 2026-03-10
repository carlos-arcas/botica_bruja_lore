import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  construirMetadataSeo,
  resolverBaseSitioPublico,
} from "../infraestructura/seo/metadataSeo";

test("resolverBaseSitioPublico prioriza PUBLIC_SITE_URL válida", () => {
  const base = resolverBaseSitioPublico({
    PUBLIC_SITE_URL: "https://laboticabrujalore.com/",
    NEXT_PUBLIC_SITE_URL: "https://frontend.example.com",
  } as unknown as NodeJS.ProcessEnv);

  assert.equal(base, "https://laboticabrujalore.com");
});

test("resolverBaseSitioPublico usa NEXT_PUBLIC_SITE_URL si no hay PUBLIC_SITE_URL", () => {
  const base = resolverBaseSitioPublico({
    NEXT_PUBLIC_SITE_URL: "https://frontend.example.com/",
  } as unknown as NodeJS.ProcessEnv);

  assert.equal(base, "https://frontend.example.com");
});

test("construirMetadataSeo crea canonical normalizado para página indexable", () => {
  const previo = process.env.PUBLIC_SITE_URL;
  process.env.PUBLIC_SITE_URL = "https://laboticabrujalore.com";

  const metadata = construirMetadataSeo({
    title: "Colecciones",
    description: "Catálogo",
    rutaCanonical: "/colecciones?q=calma&utm_source=test",
  });

  process.env.PUBLIC_SITE_URL = previo;

  assert.equal(metadata.alternates?.canonical, "/colecciones");
  assert.equal((metadata.robots as { index?: boolean }).index, true);
  assert.equal((metadata.robots as { follow?: boolean }).follow, true);
  assert.equal(metadata.metadataBase?.toString(), "https://laboticabrujalore.com/");
});

test("construirMetadataSeo evita canonical en páginas no indexables", () => {
  const metadata = construirMetadataSeo({
    title: "Cesta",
    description: "Resumen",
    rutaCanonical: "/cesta",
    indexable: false,
  });

  assert.equal(metadata.alternates, undefined);
  assert.equal((metadata.robots as { index?: boolean }).index, false);
  assert.equal((metadata.robots as { follow?: boolean }).follow, true);
});
