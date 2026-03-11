import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  ARCANOS_TAROT,
  METADATA_TAROT,
  obtenerArcanoPorSlug,
  resolverSlugInicialTarot,
} from "../contenido/tarot/arcanosTarot";

test("contenido tarot define estructura mínima reusable", () => {
  assert.equal(ARCANOS_TAROT.length >= 18, true);

  for (const arcano of ARCANOS_TAROT) {
    assert.equal(typeof arcano.slug, "string");
    assert.equal(arcano.slug.length > 0, true);
    assert.equal(typeof arcano.nombre, "string");
    assert.equal(arcano.numero > 0, true);
    assert.equal(arcano.imagen.startsWith("/fondos/"), true);
    assert.equal(arcano.palabrasClave.length, 3);
    assert.equal(arcano.significadoBreve.length > 20, true);
    assert.equal(arcano.descripcionEditorial.length > 40, true);
  }
});

test("helpers de selección resuelven arcano y fallback estable", () => {
  assert.equal(obtenerArcanoPorSlug("elmago")?.nombre, "El Mago");
  assert.equal(obtenerArcanoPorSlug("inexistente"), null);
  assert.equal(resolverSlugInicialTarot(), ARCANOS_TAROT[0]?.slug ?? "");
  assert.equal(resolverSlugInicialTarot("elmundo"), "elmundo");
  assert.equal(resolverSlugInicialTarot("otro"), ARCANOS_TAROT[0]?.slug ?? "");
});

test("metadata tarot mantiene título y descripción de sección", () => {
  assert.match(METADATA_TAROT.title, /Tarot/);
  assert.match(METADATA_TAROT.description, /arcanos mayores/i);
});
