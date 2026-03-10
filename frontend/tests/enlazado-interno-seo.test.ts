import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

import { BLOQUES_ENLAZADO_CATALOGO } from "../contenido/catalogo/enlazadoInterno";

test("bloques de enlazado contextual tienen destinos indexables y anchors descriptivos", () => {
  const claves = Object.keys(BLOQUES_ENLAZADO_CATALOGO) as Array<keyof typeof BLOQUES_ENLAZADO_CATALOGO>;

  for (const clave of claves) {
    const bloque = BLOQUES_ENLAZADO_CATALOGO[clave];

    assert.equal(bloque.enlaces.length >= 3, true);
    assert.equal(bloque.enlaces.some((enlace) => enlace.href === "/encargo"), false);
    assert.equal(bloque.enlaces.some((enlace) => enlace.href === "/cesta"), false);

    for (const enlace of bloque.enlaces) {
      assert.equal(enlace.anchor.length >= 20, true);
      assert.equal(enlace.anchor.toLowerCase().includes("haz clic aquí"), false);
      assert.equal(enlace.anchor.toLowerCase().includes("ver más"), false);
    }
  }
});

test("landings usan el bloque reutilizable de enlazado contextual", () => {
  const paginaHierbas = readFileSync(join(process.cwd(), "app/hierbas/page.tsx"), "utf8");
  const paginaRituales = readFileSync(join(process.cwd(), "app/rituales/page.tsx"), "utf8");
  const paginaColecciones = readFileSync(join(process.cwd(), "app/colecciones/page.tsx"), "utf8");

  assert.match(paginaHierbas, /BloqueEnlazadoContextual/);
  assert.match(paginaRituales, /BloqueEnlazadoContextual/);
  assert.match(paginaColecciones, /BloqueEnlazadoContextual/);
});
