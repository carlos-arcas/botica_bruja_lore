import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("/admin/rituales usa módulo contextual con contrato correcto", () => {
  const pagina = readFileSync("app/admin/(panel)/rituales/page.tsx", "utf8");

  assert.match(pagina, /modulo="rituales"/);
  assert.match(pagina, /campoEstado="publicado"/);
  assert.match(pagina, /entidadImportacion="rituales"/);
  assert.match(pagina, /errorInicial/);
});

test("módulo contextual protege acciones de rituales con estado de error controlado", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");

  assert.match(componente, /const ejecutarAccion = async/);
  assert.match(componente, /No se pudo actualizar la publicación\./);
  assert.match(componente, /No se pudo guardar el registro\./);
  assert.match(componente, /No se pudo guardar la edición\./);
  assert.match(componente, /No se pudo cargar el lote de importación\./);
  assert.match(componente, /No se pudo revalidar el lote\./);
  assert.match(componente, /No se pudo confirmar el lote\./);
});

test("sin JSX inválido ni cierres duplicados en tabla de registros", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  assert.doesNotMatch(componente, /<\/td>\s*<\/td>/);
});
