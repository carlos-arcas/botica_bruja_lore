import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

test("/botica-natural usa fetch real al endpoint de secciones y renderiza cards", () => {
  const pagina = readFileSync(join(process.cwd(), "app/botica-natural/page.tsx"), "utf8");
  const api = readFileSync(join(process.cwd(), "infraestructura/api/herbal.ts"), "utf8");

  assert.equal(pagina.includes('obtenerProductosPublicosPorSeccion("botica-natural")'), true);
  assert.equal(pagina.includes("<ListadoProductosBoticaNatural"), true);
  assert.equal(api.includes('/api/v1/herbal/secciones/${slugSeccion}/productos/'), true);
  assert.equal(api.includes("NEXT_PUBLIC_API_BASE_URL"), true);
});

test("la sección Botica Natural contempla vacío real separado de estados de error", () => {
  const componente = readFileSync(
    join(process.cwd(), "componentes/botica-natural/ListadoProductosBoticaNatural.tsx"),
    "utf8",
  );
  const pagina = readFileSync(join(process.cwd(), "app/botica-natural/page.tsx"), "utf8");

  assert.equal(componente.includes("if (productos.length === 0)"), true);
  assert.equal(componente.includes("sin productos publicados"), true);
  assert.equal(pagina.includes("No pudimos cargar Botica Natural"), true);
  assert.equal(pagina.includes("resolverMensajeError"), true);
});

test("el cliente API registra diagnóstico de endpoint y tipo de error", () => {
  const api = readFileSync(join(process.cwd(), "infraestructura/api/herbal.ts"), "utf8");

  assert.equal(api.includes("diagnostico"), true);
  assert.equal(api.includes('tipoError: "http_error"'), true);
  assert.equal(api.includes("[botica-natural]"), true);
  assert.equal(api.includes("respuesta_invalida"), true);
});
