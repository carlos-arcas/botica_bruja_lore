import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const vistaSeleccion = readFileSync(join(process.cwd(), "componentes/catalogo/cesta/VistaCestaRitual.tsx"), "utf8");
const flujoEncargo = readFileSync(join(process.cwd(), "componentes/catalogo/encargo/FlujoEncargoConsulta.tsx"), "utf8");

test("la página de selección usa naming coherente y empty state real", () => {
  assert.match(vistaSeleccion, /<h1[^>]*>Mi selección<\/h1>/);
  assert.match(vistaSeleccion, /No has guardado piezas todavía/);
  assert.match(vistaSeleccion, /Vaciar selección/);
});

test("la selección renderiza líneas reales y CTA coherente hacia encargo", () => {
  assert.match(vistaSeleccion, /Línea de catálogo/);
  assert.match(vistaSeleccion, /Pieza fuera de catálogo/);
  assert.match(vistaSeleccion, /Quitar línea/);
  assert.match(vistaSeleccion, /\/encargo\?origen=seleccion/);
});

test("el modo múltiple de encargo no depende de un selector único como fuente de verdad", () => {
  assert.match(flujoEncargo, /Selección para encargo/);
  assert.match(flujoEncargo, /contexto\.modo === "producto" &&/);
  assert.doesNotMatch(flujoEncargo, /Selección múltiple desde cesta/);
});

test("el formulario evita contaminar inputs con dumps crudos de cesta", () => {
  assert.doesNotMatch(flujoEncargo, /Selección múltiple desde cesta/);
  assert.doesNotMatch(flujoEncargo, /construirResumenItemsEncargo\(contextoPreseleccionado\.itemsPreseleccionados\)/);
  assert.match(flujoEncargo, /Regresar a mi selección/);
});
