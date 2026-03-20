import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const vistaSeleccion = readFileSync(
  join(process.cwd(), "componentes/catalogo/cesta/VistaCestaRitual.tsx"),
  "utf8",
);
const flujoEncargo = readFileSync(
  join(process.cwd(), "componentes/catalogo/encargo/FlujoEncargoConsulta.tsx"),
  "utf8",
);

test("la página de selección usa naming coherente y empty state real", () => {
  assert.match(vistaSeleccion, /<h1[^>]*>Mi selección<\/h1>/);
  assert.match(vistaSeleccion, /No has guardado piezas todavía/);
  assert.match(vistaSeleccion, /Vaciar selección/);
});

test("la selección renderiza líneas ricas y CTA coherente hacia encargo", () => {
  assert.match(vistaSeleccion, /Línea de catálogo/);
  assert.match(vistaSeleccion, /Pieza fuera de catálogo/);
  assert.match(vistaSeleccion, /src=\{linea\.imagen_url\}/);
  assert.match(vistaSeleccion, /Referencia unitaria/);
  assert.match(vistaSeleccion, /Subtotal orientativo/);
  assert.match(vistaSeleccion, /Quitar línea/);
  assert.match(vistaSeleccion, /onCambiarCantidad\(linea\.id_linea/);
  assert.match(vistaSeleccion, /onEliminar\(linea\.id_linea/);
  assert.match(vistaSeleccion, /\/encargo\?origen=seleccion/);
});

test("el modo múltiple de encargo consume líneas ricas persistidas en lugar de un modelo mínimo", () => {
  assert.match(flujoEncargo, /Selección para encargo/);
  assert.match(
    flujoEncargo,
    /contexto\.itemsPreseleccionados\.map\(\(item\) => \(\{[\s\S]*actualizadoEn/,
  );
  assert.match(flujoEncargo, /convertirCestaALineasSeleccion/);
  assert.doesNotMatch(flujoEncargo, /Selección múltiple desde cesta/);
});

test("el formulario evita contaminar inputs con dumps crudos de cesta", () => {
  assert.doesNotMatch(flujoEncargo, /Selección múltiple desde cesta/);
  assert.doesNotMatch(
    flujoEncargo,
    /construirResumenItemsEncargo\(contextoPreseleccionado\.itemsPreseleccionados\)/,
  );
  assert.match(flujoEncargo, /Regresar a mi selección/);
});

test("la selección mantiene contexto honesto para líneas sin imagen o sin referencia", () => {
  assert.match(vistaSeleccion, /Sin referencia editorial/);
  assert.match(vistaSeleccion, /Se confirma en la solicitud/);
});
