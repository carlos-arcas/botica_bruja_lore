import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import {
  mapearRangoAPreciosBotica,
  OPCIONES_RANGO_PRECIO_BOTICA,
  resolverRangoPrecioBotica,
} from "../contenido/catalogo/precioRangosBoticaNatural";
import {
  debeMostrarControlMostrarMas,
  obtenerOpcionesVisibles,
  restaurarVisibilidadReducida,
} from "../componentes/botica-natural/filtros/estadoVisualFiltros";

test("/botica-natural usa fetch real al endpoint de secciones y renderiza cards", () => {
  const pagina = readFileSync(join(process.cwd(), "app/botica-natural/page.tsx"), "utf8");
  const api = readFileSync(join(process.cwd(), "infraestructura/api/herbal.ts"), "utf8");

  assert.equal(pagina.includes('obtenerProductosPublicosPorSeccion("botica-natural", filtros)'), true);
  assert.equal(pagina.includes("<ListadoProductosBoticaNatural"), true);
  assert.equal(api.includes('/api/v1/herbal/secciones/${slugSeccion}/productos/'), true);
});

test("todos los grupos de filtros arrancan colapsados con acordeones accesibles", () => {
  const panel = readFileSync(
    join(process.cwd(), "componentes/botica-natural/filtros/PanelFiltrosBoticaNatural.tsx"),
    "utf8",
  );
  const acordeon = readFileSync(join(process.cwd(), "componentes/botica-natural/filtros/AcordeonFiltro.tsx"), "utf8");

  assert.equal(panel.includes("beneficio: false"), true);
  assert.equal(panel.includes("formato: false"), true);
  assert.equal(panel.includes("modo_uso: false"), true);
  assert.equal(panel.includes("precio: false"), true);
  assert.equal(acordeon.includes("aria-expanded={expandido}"), true);
  assert.equal(acordeon.includes("aria-controls={panelId}"), true);
});

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

test("las selecciones persisten y se mantienen botones de Aplicar y Limpiar", () => {
  const panel = readFileSync(
    join(process.cwd(), "componentes/botica-natural/filtros/PanelFiltrosBoticaNatural.tsx"),
    "utf8",
  );

  assert.equal(panel.includes("useState({"), true);
  const toggle = readFileSync(join(process.cwd(), "componentes/botica-natural/filtros/ToggleFiltro.tsx"), "utf8");
  assert.equal(toggle.includes("checked={activo}"), true);
  assert.equal(panel.includes("Aplicar"), true);
  assert.equal(panel.includes("Limpiar"), true);
});

test("precio por rangos mapea a precio_min/precio_max sin romper compatibilidad", () => {
  assert.deepEqual(mapearRangoAPreciosBotica("todos"), { precio_min: "", precio_max: "" });
  assert.deepEqual(mapearRangoAPreciosBotica("10-20"), { precio_min: "10", precio_max: "20" });
  assert.deepEqual(mapearRangoAPreciosBotica("120+"), { precio_min: "120", precio_max: "" });
  assert.equal(resolverRangoPrecioBotica("30", "50"), "30-50");
  assert.equal(resolverRangoPrecioBotica("999", ""), "todos");
});

test("query params de filtros siguen vigentes y precio_rango se adapta a lógica actual", () => {
  const pagina = readFileSync(join(process.cwd(), "app/botica-natural/page.tsx"), "utf8");
  assert.equal(pagina.includes("resolverFiltrosDesdeSearchParams"), true);
  assert.equal(pagina.includes("params.precio_min"), true);
  assert.equal(pagina.includes("params.precio_max"), true);
  assert.equal(pagina.includes("params.precio_rango"), true);
});

test("estilos de toggles y acordeón conservan layout responsive de Botica Natural", () => {
  const estilos = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
  assert.equal(estilos.includes(".botica-natural__acordeon-boton"), true);
  assert.equal(estilos.includes(".botica-natural__toggle-etiqueta"), true);
  assert.equal(estilos.includes(".botica-natural__mostrar-mas"), true);
  assert.equal(estilos.includes("@media (max-width: 900px)"), true);
});
