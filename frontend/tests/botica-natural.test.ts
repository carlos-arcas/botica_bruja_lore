import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  construirQueryFiltrosBotica,
  contarFiltroActivo,
  resolverFiltrosBoticaDesdeSearchParams,
} from "../contenido/catalogo/filtrosBoticaNatural";
import {
  mapearRangoAPreciosBotica,
  OPCIONES_RANGO_PRECIO_BOTICA,
  resolverRangoPrecioBotica,
} from "../contenido/catalogo/precioRangosBoticaNatural";
import { debeMostrarControlMostrarMas, obtenerOpcionesVisibles, restaurarVisibilidadReducida } from "../componentes/botica-natural/filtros/estadoVisualFiltros";
test("grupos con <=6 opciones muestran todo y no requieren Mostrar más", () => {
  const opcionesBreves = OPCIONES_RANGO_PRECIO_BOTICA.slice(0, 6);
  assert.equal(debeMostrarControlMostrarMas(opcionesBreves), false);
  assert.equal(obtenerOpcionesVisibles(opcionesBreves, false).length, 6);
});

test("grupos con >6 opciones arrancan en 6 visibles y soportan Mostrar más/menos", () => {
  assert.equal(OPCIONES_RANGO_PRECIO_BOTICA.length > 6, true);
  assert.equal(obtenerOpcionesVisibles(OPCIONES_RANGO_PRECIO_BOTICA, false).length, 6);
  assert.equal(obtenerOpcionesVisibles(OPCIONES_RANGO_PRECIO_BOTICA, true).length, OPCIONES_RANGO_PRECIO_BOTICA.length);
  assert.equal(restaurarVisibilidadReducida(), false);
});

test("Todos no incrementa contador y valor real sí incrementa", () => {
  assert.equal(contarFiltroActivo("todos"), 0);
  assert.equal(contarFiltroActivo(""), 0);
  assert.equal(contarFiltroActivo("digestivo"), 1);
});

test("Limpiar deja contador a cero para filtros y precio", () => {
  const filtros = resolverFiltrosBoticaDesdeSearchParams({
    beneficio: "todos",
    formato: "todos",
    modo_uso: "todos",
    precio_rango: "todos",
  });

  assert.equal(contarFiltroActivo(filtros.beneficio), 0);
  assert.equal(contarFiltroActivo(filtros.formato), 0);
  assert.equal(contarFiltroActivo(filtros.modo_uso), 0);
  assert.equal(contarFiltroActivo(filtros.precio_rango), 0);
});

test("no se generan query params basura cuando filtro efectivo es Todos", () => {
  const filtros = resolverFiltrosBoticaDesdeSearchParams({
    beneficio: "todos",
    formato: "todos",
    modo_uso: "todos",
    precio_rango: "todos",
  });

  const query = construirQueryFiltrosBotica(filtros);
  assert.equal(query.has("beneficio"), false);
  assert.equal(query.has("formato"), false);
  assert.equal(query.has("modo_uso"), false);
  assert.equal(query.has("precio_rango"), false);
  assert.equal(query.has("precio_min"), false);
  assert.equal(query.has("precio_max"), false);
});

test("precio_rango mapea a precio_min/precio_max", () => {
  assert.deepEqual(mapearRangoAPreciosBotica("todos"), { precio_min: "", precio_max: "" });
  assert.deepEqual(mapearRangoAPreciosBotica("10-20"), { precio_min: "10", precio_max: "20" });
  assert.deepEqual(mapearRangoAPreciosBotica("120+"), { precio_min: "120", precio_max: "" });
  assert.equal(resolverRangoPrecioBotica("30", "50"), "30-50");
  assert.equal(resolverRangoPrecioBotica("999", ""), "todos");
});

test("compatibilidad con enlaces antiguos precio_min/precio_max", () => {
  const filtros = resolverFiltrosBoticaDesdeSearchParams({ precio_min: "20", precio_max: "30" });

  assert.equal(filtros.precio_rango, "todos");
  assert.equal(filtros.precio_min, "20");
  assert.equal(filtros.precio_max, "30");
});

test("si llegan rango y min/max simultáneamente, precio_rango tiene precedencia", () => {
  const filtros = resolverFiltrosBoticaDesdeSearchParams({
    precio_rango: "50-80",
    precio_min: "10",
    precio_max: "20",
  });

  assert.equal(filtros.precio_rango, "50-80");
  assert.equal(filtros.precio_min, "50");
  assert.equal(filtros.precio_max, "80");
});

test("accesibilidad del acordeón se mantiene estable tras re-render", () => {
  const acordeon = readFileSync(join(process.cwd(), "componentes/botica-natural/filtros/AcordeonFiltro.tsx"), "utf8");

  assert.equal(acordeon.includes("aria-expanded={expandido}"), true);
  assert.equal(acordeon.includes("aria-controls={panelId}"), true);
  assert.equal(acordeon.includes("role=\"region\""), true);
});
