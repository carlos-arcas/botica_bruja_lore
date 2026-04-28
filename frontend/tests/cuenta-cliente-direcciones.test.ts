import * as assert from "node:assert/strict";
import { test } from "node:test";

import { construirFormularioDireccionVacio, descripcionEstadoVacioDirecciones, resumenDireccion } from "../contenido/cuenta_cliente/direccionesCuentaCliente";
import { RUTAS_CUENTA_CLIENTE, resumenCuentaRealV1 } from "../contenido/cuenta_cliente/rutasCuentaCliente";
import { crearDireccionCuentaCliente, actualizarDireccionCuentaCliente, eliminarDireccionCuentaCliente, marcarDireccionPredeterminadaCuentaCliente } from "../infraestructura/api/cuentasCliente";

test("rutas de cuenta incluyen vista dedicada de direcciones", () => {
  assert.equal(RUTAS_CUENTA_CLIENTE.direcciones, "/mi-cuenta/direcciones");
  assert.match(resumenCuentaRealV1().join(" ").toLowerCase(), /libreta de direcciones/);
});

test("estado vacio y resumen de direccion son sobrios y utiles", () => {
  const vacio = construirFormularioDireccionVacio();
  assert.equal(vacio.pais_iso, "ES");
  assert.match(descripcionEstadoVacioDirecciones().toLowerCase(), /checkout/);
  assert.equal(
    resumenDireccion({ linea_1: "Calle Luna 13", linea_2: "Portal 2", codigo_postal: "28013", ciudad: "Madrid", provincia: "Madrid", pais_iso: "ES" }),
    "Calle Luna 13 · Portal 2 · 28013 Madrid · Madrid · ES",
  );
});

test("api libreta crea, actualiza, borra y marca predeterminada", async () => {
  const llamadas: Array<{ url: string; method: string }> = [];
  globalThis.fetch = (async (url: string, init?: RequestInit) => {
    llamadas.push({ url, method: init?.method ?? "GET" });
    return new Response(JSON.stringify({ direccion: { id_direccion: "1", alias: "Casa" }, eliminada: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  }) as typeof fetch;

  const payload = { alias: "Casa", nombre_destinatario: "Lore", telefono_contacto: "600", linea_1: "Calle", linea_2: "", codigo_postal: "28013", ciudad: "Madrid", provincia: "Madrid", pais_iso: "ES" };
  assert.equal((await crearDireccionCuentaCliente(payload)).estado, "ok");
  assert.equal((await actualizarDireccionCuentaCliente("1", payload)).estado, "ok");
  assert.equal((await eliminarDireccionCuentaCliente("1")).estado, "ok");
  assert.equal((await marcarDireccionPredeterminadaCuentaCliente("1")).estado, "ok");
  assert.deepEqual(llamadas.map((item) => `${item.method} ${item.url}`), [
    "POST /api/cuenta/direcciones",
    "PUT /api/cuenta/direcciones/1",
    "DELETE /api/cuenta/direcciones/1",
    "POST /api/cuenta/direcciones/1/predeterminada",
  ]);
});

test("api libreta propaga error estable", async () => {
  globalThis.fetch = (async () => new Response(JSON.stringify({ detalle: "fallo" }), { status: 400, headers: { "Content-Type": "application/json" } })) as typeof fetch;
  const resultado = await crearDireccionCuentaCliente({ alias: "", nombre_destinatario: "", telefono_contacto: "", linea_1: "", linea_2: "", codigo_postal: "", ciudad: "", provincia: "", pais_iso: "ES" });
  assert.equal(resultado.estado, "error");
  if (resultado.estado === "error") assert.equal(resultado.mensaje, "fallo");
});
