import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

test("/botica-natural usa fetch real al endpoint de secciones y renderiza cards", () => {
  const pagina = readFileSync(join(process.cwd(), "app/botica-natural/page.tsx"), "utf8");
  const api = readFileSync(join(process.cwd(), "infraestructura/api/herbal.ts"), "utf8");

  assert.equal(pagina.includes('obtenerProductosPublicosPorSeccion("botica-natural")'), true);
  assert.equal(pagina.includes("<ListadoProductosBoticaNatural"), true);
  assert.equal(pagina.includes("HeroSeccionPrincipal"), false);
  assert.equal(api.includes('/api/v1/herbal/secciones/${slugSeccion}/productos/'), true);
});

test("la sección Botica Natural contempla estado vacío controlado", () => {
  const componente = readFileSync(
    join(process.cwd(), "componentes/botica-natural/ListadoProductosBoticaNatural.tsx"),
    "utf8",
  );

  assert.equal(componente.includes("if (productos.length === 0)"), true);
  assert.equal(componente.includes("Botica Natural en preparación"), true);
  assert.equal(componente.includes('aria-live="polite"'), true);
});

test("la card no rompe si falta imagen y usa fallback", () => {
  const componente = readFileSync(
    join(process.cwd(), "componentes/botica-natural/ListadoProductosBoticaNatural.tsx"),
    "utf8",
  );

  assert.equal(componente.includes("producto.imagen_url ?"), true);
  assert.equal(componente.includes("botica-natural__imagen--fallback"), true);
});
