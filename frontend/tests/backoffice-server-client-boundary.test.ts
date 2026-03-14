import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const PAGINAS_ADMIN_SERVER = [
  "app/admin/(panel)/rituales/page.tsx",
  "app/admin/(panel)/editorial/page.tsx",
  "app/admin/(panel)/secciones/page.tsx",
] as const;

test("pages server de admin pasan solo props serializables al módulo CRUD", () => {
  const paginas = PAGINAS_ADMIN_SERVER.map((ruta) => [ruta, readFileSync(ruta, "utf8")] as const);

  paginas.forEach(([, contenido]) => {
    assert.match(contenido, /ModuloCrudContextualAdmin/);
    assert.match(contenido, /tipoPayload="(rituales|editorial|secciones)"/);
    assert.doesNotMatch(contenido, /construirPayload=\{/);
    assert.doesNotMatch(contenido, /\(form\)\s*=>/);
  });
});

test("módulo CRUD resuelve payload dentro del client component", () => {
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");

  assert.match(componente, /type TipoPayloadAdmin = "rituales" \| "editorial" \| "secciones" \| "productos"/);
  assert.match(componente, /construirPayloadSegunTipo/);
  assert.match(componente, /tipoPayload === "rituales"/);
  assert.match(componente, /tipoPayload === "productos"/);
});
