import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("productos inicia con selector comercial y opciones humanas", () => {
  const modulo = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");
  assert.match(modulo, /Colección principal/);
  assert.match(modulo, /Colección/);
  assert.match(modulo, /Botica Natural/);
  assert.match(modulo, /Velas e Incienso/);
  assert.match(modulo, /Minerales y Energía/);
  assert.match(modulo, /Herramientas Esotéricas/);
  assert.match(modulo, /contextoFormulario/);
  assert.match(modulo, /tipoPayload="productos"/);
});

test("alta manual usa layout vertical con labels arriba", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  assert.match(componente, /className="admin-formulario-amplio admin-formulario-vertical"/);
  assert.match(componente, /admin-campos-grid admin-campos-grid--vertical/);
});

test("precio visible es numérico y muestra símbolo euro en UI", () => {
  const modulo = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");
  const camposFormulario = readFileSync("componentes/admin/CamposFormularioAdmin.tsx", "utf8");
  assert.match(modulo, /precio_visible", etiqueta: "Precio visible", tipo: "precio"/);
  assert.match(modulo, /Precio visible solo acepta números con decimal opcional\./);
  assert.match(camposFormulario, /className="admin-input-precio"/);
  assert.match(camposFormulario, />€<\/span>/);
  assert.match(camposFormulario, /pattern="\^\[0-9\]\+\(\[\.,\]\[0-9\]\{1,2\}\)\?\$"/);
});

test("Velas e Incienso obliga tipo por combo/select", () => {
  const modulo = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");
  assert.match(modulo, /"velas-e-incienso"/);
  assert.match(modulo, /tipo: "select"/);
  assert.match(modulo, /OPCIONES_TIPO_VELAS/);
});

test("registros siguen debajo del formulario y herramientas en lateral", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  const indiceAlta = componente.indexOf("Alta manual");
  const indiceListado = componente.indexOf("Registros existentes");
  const indiceHerramientas = componente.indexOf("Herramientas");

  assert.ok(indiceAlta >= 0);
  assert.ok(indiceListado > indiceAlta);
  assert.ok(indiceHerramientas >= 0);
  assert.match(componente, /admin-columna-principal/);
  assert.match(componente, /admin-columna-herramientas/);
  assert.doesNotMatch(componente, /<section className="admin-bloque">\s*<h3>Importación<\/h3>/);
});

test("flujo normal no expone campos id y slug editables", () => {
  const modulo = readFileSync("componentes/admin/ModuloProductosAdmin.tsx", "utf8");
  assert.doesNotMatch(modulo, /clave:\s*"slug"/);
  assert.doesNotMatch(modulo, /clave:\s*"id"/);
});
