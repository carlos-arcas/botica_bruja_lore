import * as assert from "node:assert/strict";
import { test } from "node:test";

import { construirUrlAdmin, resolverBaseAdmin } from "../infraestructura/configuracion/adminUrl";
import { resolverDestinoAdmin } from "../infraestructura/configuracion/adminRedirect";

test("resuelve admin con variable dedicada cuando existe", () => {
  const destino = construirUrlAdmin("/admin/login/", {
    NEXT_PUBLIC_ADMIN_BASE_URL: "https://admin.botica.example",
    NEXT_PUBLIC_API_BASE_URL: "https://api.botica.example",
  });

  assert.equal(destino, "https://admin.botica.example/admin/login/");
});

test("deriva admin desde API base URL cuando no hay variable dedicada", () => {
  const base = resolverBaseAdmin({ NEXT_PUBLIC_API_BASE_URL: "https://api.botica.example/" });
  const destino = construirUrlAdmin("/admin/", { NEXT_PUBLIC_API_BASE_URL: "https://api.botica.example/" });

  assert.equal(base, "https://api.botica.example");
  assert.equal(destino, "https://api.botica.example/admin/");
});

test("aplica fallback local cuando faltan variables públicas", () => {
  const destino = construirUrlAdmin("/admin/");

  assert.equal(destino, "http://127.0.0.1:8000/admin/");
});

test("redirección admin preserva subruta y querystring", () => {
  const destino = resolverDestinoAdmin("?next=%2Fadmin%2Fauth%2Fuser%2F", ["auth", "user"]);

  assert.equal(destino, "http://127.0.0.1:8000/admin/auth/user?next=%2Fadmin%2Fauth%2Fuser%2F");
});
