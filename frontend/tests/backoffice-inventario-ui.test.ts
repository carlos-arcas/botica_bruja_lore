import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { ajustarInventarioManual, obtenerDetalleInventario, obtenerListadoAdmin } from "../infraestructura/api/backoffice";

test("la navegación admin y la page de inventario quedan visibles en backoffice", () => {
  const modulos = readFileSync("infraestructura/configuracion/modulosAdmin.ts", "utf8");
  const page = readFileSync("app/admin/(panel)/inventario/page.tsx", "utf8");
  const moduloInventario = readFileSync("componentes/admin/ModuloInventarioAdmin.tsx", "utf8");

  assert.match(modulos, /clave: "inventario"/);
  assert.match(page, /obtenerListadoAdmin\("inventario"/);
  assert.match(moduloInventario, /Listado de inventario/);
  assert.match(moduloInventario, /Unidad base/);
  assert.match(moduloInventario, /Bajo stock/);
  assert.match(moduloInventario, /Últimos movimientos \(ledger mínimo\)/);
});

test("la API de inventario consume endpoints privados para detalle y ajuste manual", async () => {
  const urls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    urls.push(String(input));
    return {
      ok: true,
      json: async () => ({ item: { id_producto: "prod-1", producto_nombre: "Melisa", unidad_base: "g", cantidad_disponible: 25, umbral_bajo_stock: 5, bajo_stock: false, fecha_actualizacion: null }, movimientos: [] }),
    } as Response;
  }) as unknown as typeof fetch;

  await obtenerDetalleInventario("prod-1", "token");
  await ajustarInventarioManual("prod-1", -2, "token");

  assert.match(urls[0], /\/api\/v1\/backoffice\/inventario\/prod-1\/$/);
  assert.match(urls[1], /\/api\/v1\/backoffice\/inventario\/prod-1\/ajustar\/$/);
});

test("listado de inventario devuelve estado denegado con operation_id propagado", async () => {
  globalThis.fetch = (async () => ({
    ok: false,
    status: 403,
    json: async () => ({ detalle: "Sin permisos.", operation_id: "inv-403" }),
  }) as Response) as unknown as typeof fetch;

  const resultado = await obtenerListadoAdmin("inventario", new URLSearchParams(), "token");

  assert.deepEqual(resultado, { estado: "denegado", detalle: "Sin permisos.", operation_id: "inv-403" });
});

test("el módulo de inventario expone flujo mínimo de ajuste exitoso y error inválido", () => {
  const moduloInventario = readFileSync("componentes/admin/ModuloInventarioAdmin.tsx", "utf8");

  assert.match(moduloInventario, /Ajuste manual aplicado y ledger actualizado\./);
  assert.match(moduloInventario, /El ajuste debe ser un número entero\./);
  assert.match(moduloInventario, /ajustarInventarioManual/);
});
