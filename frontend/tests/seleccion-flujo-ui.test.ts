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
const componenteCompartido = readFileSync(
  join(
    process.cwd(),
    "componentes/catalogo/seleccion/ListaLineasSeleccion.tsx",
  ),
  "utf8",
);

test("la página de selección usa naming coherente y empty state real", () => {
  assert.match(vistaSeleccion, /<h1[^>]*>Mi selección<\/h1>/);
  assert.match(vistaSeleccion, /No has guardado piezas todavía/);
  assert.match(vistaSeleccion, /Vaciar selección/);
});

test("la UI reutiliza un componente compartido para las líneas ricas", () => {
  assert.match(vistaSeleccion, /ListaLineasSeleccion/);
  assert.match(flujoEncargo, /ListaLineasSeleccion/);
  assert.match(componenteCompartido, /Referencia unitaria/);
  assert.match(componenteCompartido, /Subtotal orientativo/);
  assert.match(componenteCompartido, /Sin imagen editorial/);
  assert.match(componenteCompartido, /Quitar línea/);
});

test("el modo múltiple de encargo conserva una revisión rica en lugar de una lista textual mínima", () => {
  assert.match(flujoEncargo, /Selección para encargo/);
  assert.match(
    flujoEncargo,
    /Mantienes la revisión rica de cada línea antes de enviar el encargo/,
  );
  assert.match(flujoEncargo, /Línea bloqueada para pedido demo/);
  assert.match(flujoEncargo, /Lista para revisión de encargo/);
  assert.doesNotMatch(flujoEncargo, /<li key=\{linea\.id_linea\}>\s*\{linea\.cantidad\} ·/);
});

test("la selección mantiene contexto honesto para líneas sin imagen o sin referencia", () => {
  assert.match(componenteCompartido, /Sin imagen editorial/);
  assert.match(componenteCompartido, /Sin referencia editorial/);
  assert.match(componenteCompartido, /Se confirma en la solicitud/);
});
