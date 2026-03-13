import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

test("/admin/rituales usa módulo contextual y no rompe por JSX inválido", () => {
  const pagina = readFileSync("app/admin/(panel)/rituales/page.tsx", "utf8");
  const componente = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");

  assert.match(pagina, /modulo="rituales"/);
  assert.doesNotMatch(componente, /<\/td>\s*<\/td>/);
});
