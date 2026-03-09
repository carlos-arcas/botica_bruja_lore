import * as assert from "node:assert/strict";
import { test } from "node:test";

import { PRODUCTOS_CATALOGO, ProductoCatalogo } from "../contenido/catalogo/catalogo";
import { obtenerProductoPorSlug, obtenerProductosRelacionados } from "../contenido/catalogo/detalleCatalogo";

test("obtenerProductoPorSlug devuelve producto para slug válido", () => {
  const producto = obtenerProductoPorSlug("infusion-bruma-lavanda", PRODUCTOS_CATALOGO);
  assert.equal(producto?.nombre, "Bruma de Lavanda Serena");
});

test("obtenerProductoPorSlug devuelve null para slug inexistente", () => {
  const producto = obtenerProductoPorSlug("slug-inventado", PRODUCTOS_CATALOGO);
  assert.equal(producto, null);
});

test("obtenerProductosRelacionados prioriza misma intención", () => {
  const base = PRODUCTOS_CATALOGO.find((producto) => producto.slug === "infusion-bruma-lavanda");
  assert.ok(base);

  const relacionados = obtenerProductosRelacionados(base, PRODUCTOS_CATALOGO, 4);
  assert.equal(relacionados[0]?.intencion, "calma");
  assert.equal(relacionados.length, 4);
});

test("obtenerProductosRelacionados usa fallback si no hay coincidencias directas", () => {
  const base = PRODUCTOS_CATALOGO[0];
  const catalogoMinimo: ProductoCatalogo[] = [
    base,
    {
      ...PRODUCTOS_CATALOGO[4],
      id: "rit-010",
      slug: "nuevo-pack-prueba",
      intencion: "abundancia",
      categoria: "pack-regalo",
      destacado: false,
    },
  ];

  const relacionados = obtenerProductosRelacionados(base, catalogoMinimo, 4);
  assert.equal(relacionados.length, 1);
  assert.equal(relacionados[0]?.slug, "nuevo-pack-prueba");
});
