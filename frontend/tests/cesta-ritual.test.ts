import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  actualizarCantidad,
  agregarProducto,
  construirResumenItemsEncargo,
  convertirCestaAItemsEncargo,
  convertirCestaALineasSeleccion,
  crearCestaVacia,
  deserializarCesta,
  deserializarItemsEncargo,
  quitarProducto,
  resolverSubtotalVisible,
  serializarCesta,
  serializarItemsEncargo,
  vaciarCesta,
} from "../contenido/catalogo/cestaRitual";
import { resolverReferenciaEconomicaVisualLinea, resolverResumenEconomicoSeleccion } from "../contenido/catalogo/seleccionEncargo";

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

test("una selección con una línea se resuelve como línea real de catálogo", () => {
  const cesta = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 1);
  const lineas = convertirCestaALineasSeleccion(cesta);

  assert.equal(lineas.length, 1);
  assert.equal(lineas[0]?.nombre, "Bruma de Lavanda Serena");
  assert.equal(lineas[0]?.tipo_linea, "catalogo");
});

test("la referencia económica no comunica 0,00 € cuando ninguna línea tiene referencia", () => {
  const cesta = agregarProducto(crearCestaVacia(), "lavanda-flores-40g", 1);
  const lineas = convertirCestaALineasSeleccion(cesta);
  const resumen = resolverResumenEconomicoSeleccion(lineas);

  assert.equal(resumen.etiqueta, "Sin referencia económica");
  assert.equal(resumen.totalVisible, null);
  assert.equal(resolverSubtotalVisible(cesta), "0,00 €");
});

test("la referencia parcial se comunica como parcial cuando hay mezcla de catálogo y fuera de catálogo", () => {
  let cesta = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 1);
  cesta = agregarProducto(cesta, "lavanda-flores-40g", 1);
  const resumen = resolverResumenEconomicoSeleccion(convertirCestaALineasSeleccion(cesta));

  assert.equal(resumen.estado, "parcial");
  assert.equal(resumen.etiqueta, "Referencia parcial");
  assert.match(resumen.totalVisible ?? "", /14,90/);
});


test("una línea de catálogo rellena imagen_url cuando existe información visual", () => {
  const cesta = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 1);
  const lineas = convertirCestaALineasSeleccion(cesta);

  assert.match(lineas[0]?.imagen_url ?? "", /^data:image\/svg\+xml/);
});

test("una línea con referencia válida expone referencia unitaria y subtotal orientativo honestos", () => {
  const cesta = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 2);
  const lineas = convertirCestaALineasSeleccion(cesta);
  const referencia = resolverReferenciaEconomicaVisualLinea(lineas[0]!);

  assert.equal(referencia.referenciaUnitaria, "14,90 €");
  assert.equal(referencia.subtotal, "29,80 €");
  assert.equal(referencia.mensaje, "Referencia editorial disponible");
});

test("una línea sin referencia mantiene mensaje honesto y no inventa subtotal", () => {
  const cesta = agregarProducto(crearCestaVacia(), "lavanda-flores-40g", 2);
  const lineas = convertirCestaALineasSeleccion(cesta);
  const referencia = resolverReferenciaEconomicaVisualLinea(lineas[0]!);

  assert.equal(referencia.referenciaUnitaria, null);
  assert.equal(referencia.subtotal, null);
  assert.match(referencia.mensaje, /revisión artesanal/);
});

test("las líneas fuera de catálogo siguen funcionando sin imagen obligatoria", () => {
  const cesta = agregarProducto(crearCestaVacia(), "lavanda-flores-40g", 1);
  const lineas = convertirCestaALineasSeleccion(cesta);

  assert.equal(lineas[0]?.tipo_linea, "fuera_catalogo");
  assert.equal(lineas[0]?.imagen_url, null);
});

test("regresión: mezcla catálogo y fuera de catálogo mantiene riqueza visual y honestidad económica por línea", () => {
  let cesta = agregarProducto(crearCestaVacia(), "infusion-bruma-lavanda", 2);
  cesta = agregarProducto(cesta, "lavanda-flores-40g", 1);
  const lineas = convertirCestaALineasSeleccion(cesta);

  assert.equal(lineas.length, 2);
  assert.match(lineas[0]?.imagen_url ?? "", /^data:image\/svg\+xml/);
  assert.equal(resolverReferenciaEconomicaVisualLinea(lineas[0]!).subtotal, "29,80 €");
  assert.equal(lineas[1]?.imagen_url, null);
  assert.equal(resolverReferenciaEconomicaVisualLinea(lineas[1]!).subtotal, null);
});
