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

test("formulario renderiza grupos visuales y evita pila plana de campos", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  assert.match(componente, /Información básica/);
  assert.match(componente, /Presentación en la web/);
  assert.match(componente, /Estado y publicación/);
  assert.match(componente, /admin-subseccion-formulario/);
  assert.match(componente, /className="admin-formulario-amplio admin-formulario-vertical"/);
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
  const indiceAlta = componente.indexOf("Formulario principal");
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


test("botones mantienen jerarquía primaria, secundaria y peligro", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  assert.match(componente, /admin-boton admin-boton--primario">Guardar/);
  assert.match(componente, /admin-boton admin-boton--secundario/);
  assert.match(componente, />Editar<\/button>/);
  assert.match(componente, /admin-boton admin-boton--peligro/);
});

test("registros existentes se mantiene debajo del formulario principal", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  const indiceFormulario = componente.indexOf("Formulario principal");
  const indiceListado = componente.indexOf("Registros existentes");
  assert.ok(indiceFormulario >= 0);
  assert.ok(indiceListado > indiceFormulario);
});

test("dialogo de edición conserva apertura y render de bloques", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  assert.match(componente, /setRegistroEdicion\(\{ \.\.\.item \}\)/);
  assert.match(componente, /role="dialog"/);
  assert.match(componente, /Editar registro/);
  assert.match(componente, /admin-modal-cabecera/);
});
