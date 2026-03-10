import * as assert from "node:assert/strict";
import { test } from "node:test";

import { construirMetadataRaiz } from "../infraestructura/seo/metadataRaiz";
import {
  VARIABLE_VERIFICACION_GOOGLE,
  resolverTokenVerificacionGoogle,
} from "../infraestructura/seo/verificacionSearchConsole";

test("resolverTokenVerificacionGoogle devuelve token cuando la variable existe", () => {
  const token = resolverTokenVerificacionGoogle({
    [VARIABLE_VERIFICACION_GOOGLE]: "google-site-verification=abc123",
  } as unknown as NodeJS.ProcessEnv);

  assert.equal(token, "google-site-verification=abc123");
});

test("resolverTokenVerificacionGoogle devuelve null cuando la variable no existe", () => {
  const token = resolverTokenVerificacionGoogle({} as unknown as NodeJS.ProcessEnv);
  assert.equal(token, null);
});

test("construirMetadataRaiz emite verification.google solo cuando hay token", () => {
  const metadataConToken = construirMetadataRaiz({
    [VARIABLE_VERIFICACION_GOOGLE]: "abc123",
  } as unknown as NodeJS.ProcessEnv);
  const metadataSinToken = construirMetadataRaiz({} as unknown as NodeJS.ProcessEnv);

  assert.equal(metadataConToken.verification?.google, "abc123");
  assert.equal(metadataSinToken.verification, undefined);
});
