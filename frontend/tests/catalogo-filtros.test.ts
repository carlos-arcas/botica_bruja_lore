import * as assert from "node:assert/strict";
import { test } from "node:test";

import { PRODUCTOS_CATALOGO } from "../contenido/catalogo/catalogo";
import { filtrarPorCategoria, filtrarPorIntencion, ordenarCatalogo, resolverCatalogo } from "../contenido/catalogo/filtrosCatalogo";

test("filtrarPorIntencion devuelve solo productos de calma", () => {
  const resultado = filtrarPorIntencion(PRODUCTOS_CATALOGO, "calma");
  assert.equal(resultado.every((producto) => producto.intencion === "calma"), true);
});

test("filtrarPorCategoria devuelve solo rituales guiados", () => {
  const resultado = filtrarPorCategoria(PRODUCTOS_CATALOGO, "ritual-guiado");
  assert.equal(resultado.every((producto) => producto.categoria === "ritual-guiado"), true);
});

test("ordenarCatalogo por precio usa orden ascendente", () => {
  const [primero, segundo] = ordenarCatalogo(PRODUCTOS_CATALOGO, "precio-asc");
  assert.equal(primero.precioVisible, "€12,50");
  assert.equal(segundo.precioVisible, "€13,20");
});

test("resolverCatalogo permite estado vacío cuando no hay combinación", () => {
  const resultado = resolverCatalogo(PRODUCTOS_CATALOGO, "abundancia", "herramienta", "destacados");
  assert.equal(resultado.length, 0);
});
