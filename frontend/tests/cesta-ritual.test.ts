import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  actualizarCantidad,
  agregarProducto,
  construirResumenItemsEncargo,
  convertirCestaAItemsEncargo,
  crearCestaVacia,
  deserializarCesta,
  deserializarItemsEncargo,
  quitarProducto,
  serializarCesta,
  serializarItemsEncargo,
  vaciarCesta,
} from "../contenido/catalogo/cestaRitual";

test("agregarProducto suma unidades cuando el slug ya existe", () => {
  const inicial = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda");
  const actualizada = agregarProducto(inicial, "infusion-bruma-lavanda", 2);

  assert.equal(actualizada.lineas[0]?.cantidad, 3);
});

test("actualizarCantidad normaliza estados inválidos", () => {
  const inicial = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 2);
  const actualizada = actualizarCantidad(inicial, "infusion-bruma-lavanda", 0);

  assert.equal(actualizada.lineas[0]?.cantidad, 1);
});

test("quitarProducto elimina la línea indicada", () => {
  const inicial = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 2);
  const actualizada = quitarProducto(inicial, "infusion-bruma-lavanda");

  assert.equal(actualizada.lineas.length, 0);
});

test("vaciarCesta devuelve una estructura limpia", () => {
  const inicial = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 2);
  const actualizada = vaciarCesta();

  assert.equal(inicial.lineas.length, 1);
  assert.equal(actualizada.lineas.length, 0);
});

test("serialización y deserialización recupera fallback ante datos corruptos", () => {
  const cesta = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 2);
  const serializada = serializarCesta(cesta);

  assert.equal(deserializarCesta(serializada).lineas[0]?.cantidad, 2);
  assert.equal(deserializarCesta("{json-invalido").lineas.length, 0);
});

test("convertir cesta a resumen de encargo soporta serialización de query", () => {
  const cesta = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 2);
  const items = convertirCestaAItemsEncargo(cesta);
  const serializado = serializarItemsEncargo(items);
  const recuperado = deserializarItemsEncargo(serializado);
  const resumen = construirResumenItemsEncargo(recuperado);

  assert.match(resumen, /2 x Bruma de Lavanda Serena/);
});
