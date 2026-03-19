import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const archivoFlujo = readFileSync(
  join(process.cwd(), "componentes/catalogo/encargo/FlujoEncargoConsulta.tsx"),
  "utf8",
);

const archivoBloque = readFileSync(
  join(process.cwd(), "componentes/catalogo/encargo/BloqueIdentificacionCheckoutDemo.tsx"),
  "utf8",
);

test("checkout demo elimina el input manual de id_usuario", () => {
  assert.equal(archivoFlujo.includes("name=\"idUsuarioDemo\""), false);
  assert.equal(archivoFlujo.includes("ID de usuario demo"), false);
});

test("checkout demo muestra estado claro de cuenta autenticada y mantiene CTA invitado", () => {
  assert.equal(archivoBloque.includes("Estás comprando como"), true);
  assert.equal(archivoBloque.includes("Continuar como invitado"), true);
  assert.equal(archivoFlujo.includes("guardarBorradorCheckoutDemo"), true);
  assert.equal(archivoFlujo.includes("limpiarBorradorCheckoutDemo"), true);
  assert.equal(archivoFlujo.includes("construirRutaCuentaDemoConRetornoSeguro"), true);
});

test("checkout demo mantiene continuidad con retorno seguro y sin recuperar consentimiento marcado", () => {
  assert.equal(archivoFlujo.includes("returnTo=%2Fencargo"), false);
  assert.equal(archivoFlujo.includes("consentimiento: false"), true);
  assert.equal(archivoFlujo.includes("router.push(construirRutaCuentaDemoConRetornoSeguro"), true);
});
