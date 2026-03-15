import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("backoffice de rituales y artículos incluye selector de productos relacionados", () => {
  const rituales = readFileSync("app/admin/(panel)/rituales/page.tsx", "utf8");
  const editorial = readFileSync("app/admin/(panel)/editorial/page.tsx", "utf8");

  assert.match(rituales, /productos_relacionados/);
  assert.match(rituales, /Productos recomendados para este ritual/);
  assert.match(editorial, /productos_relacionados/);
  assert.match(editorial, /Productos relacionados/);
});

test("detalle de ritual y guía usan bloque comercial con CTA de carrito", () => {
  const ritual = readFileSync("app/rituales/[slug]/page.tsx", "utf8");
  const guia = readFileSync("app/guias/[slug]/page.tsx", "utf8");
  const bloque = readFileSync("componentes/catalogo/relacionados/BloqueProductosRelacionados.tsx", "utf8");

  assert.match(ritual, /BloqueProductosRelacionados/);
  assert.match(guia, /BloqueProductosRelacionados/);
  assert.match(bloque, /BotonAgregarCarrito/);
  assert.match(bloque, /productos.length === 0/);
});

test("el CTA comercial genérico usa terminología de carrito sin restos de ritual ni cesta", () => {
  const boton = readFileSync("componentes/catalogo/cesta/BotonAgregarCarrito.tsx", "utf8");

  assert.match(boton, /Agregar al carrito/);
  assert.match(boton, /Producto agregado al carrito\./);
  assert.doesNotMatch(boton, /Añadir a la cesta ritual/);
  assert.doesNotMatch(boton, /Pieza añadida a tu selección ritual/);
});

test("api pública editorial consume productos relacionados", () => {
  const api = readFileSync("infraestructura/api/editorial.ts", "utf8");
  assert.match(api, /productos_relacionados/);
  assert.match(api, /\/api\/v1\/herbal\/editorial\//);
});
