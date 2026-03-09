import * as assert from "node:assert/strict";
import { test } from "node:test";

import { PRODUCTOS_CATALOGO } from "../contenido/catalogo/catalogo";
import { buscarProductosPorTexto, normalizarTextoBusqueda } from "../contenido/catalogo/busquedaCatalogo";
import { deserializarEstadoCatalogo, deserializarEstadoCatalogoDesdeObjeto, serializarEstadoCatalogo } from "../contenido/catalogo/estadoCatalogoUrl";
import { resolverCatalogo } from "../contenido/catalogo/filtrosCatalogo";

test("normalizarTextoBusqueda elimina tildes y espacios extra", () => {
  assert.equal(normalizarTextoBusqueda("  Círculo   de   CÁLMA  "), "circulo de calma");
});

test("buscarProductosPorTexto encuentra por nombre", () => {
  const resultado = buscarProductosPorTexto(PRODUCTOS_CATALOGO, "bruma lavanda");
  assert.equal(resultado[0]?.slug, "infusion-bruma-lavanda");
});

test("buscarProductosPorTexto encuentra por etiquetas e intención", () => {
  const porEtiqueta = buscarProductosPorTexto(PRODUCTOS_CATALOGO, "artesanal");
  const porIntencion = buscarProductosPorTexto(PRODUCTOS_CATALOGO, "proteccion");

  assert.equal(porEtiqueta.some((producto) => producto.slug === "cuenco-laton-ritual"), true);
  assert.equal(porIntencion.some((producto) => producto.intencion === "proteccion"), true);
});

test("resolverCatalogo combina búsqueda y filtros", () => {
  const resultado = resolverCatalogo(PRODUCTOS_CATALOGO, "calma", "mezcla-herbal", "nombre-asc", "lavanda");
  assert.equal(resultado.length, 1);
  assert.equal(resultado[0]?.slug, "infusion-bruma-lavanda");
});

test("serializarEstadoCatalogo genera query params limpios", () => {
  const query = serializarEstadoCatalogo({
    busqueda: "lavanda serena",
    intencion: "calma",
    categoria: "mezcla-herbal",
    orden: "precio-asc",
  });

  assert.equal(query, "q=lavanda+serena&in=calma&cat=mezcla-herbal&ord=precio-asc");
});

test("deserializarEstadoCatalogo aplica fallback seguro", () => {
  const estado = deserializarEstadoCatalogo(new URLSearchParams("q=  bosque  &in=invalido&cat=pack-regalo&ord=foo"));

  assert.equal(estado.busqueda, "bosque");
  assert.equal(estado.intencion, "todas");
  assert.equal(estado.categoria, "pack-regalo");
  assert.equal(estado.orden, "destacados");
});

test("resolverCatalogo devuelve vacío sin coincidencias", () => {
  const resultado = resolverCatalogo(PRODUCTOS_CATALOGO, "todas", "todas", "destacados", "xyz sin match");
  assert.equal(resultado.length, 0);
});


test("deserializarEstadoCatalogoDesdeObjeto soporta carga inicial de /colecciones", () => {
  const estado = deserializarEstadoCatalogoDesdeObjeto({ q: "lavanda", in: "calma", cat: "mezcla-herbal", ord: "nombre-asc" });
  assert.equal(estado.busqueda, "lavanda");
  assert.equal(estado.intencion, "calma");
  assert.equal(estado.categoria, "mezcla-herbal");
  assert.equal(estado.orden, "nombre-asc");
});
