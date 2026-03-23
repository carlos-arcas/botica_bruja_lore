import * as assert from "node:assert/strict";
import { test } from "node:test";

import { RUTAS_CUENTA_CLIENTE, resumenCuentaRealV1 } from "../contenido/cuenta_cliente/rutasCuentaCliente";

test("rutas canónicas de cuenta real separan acceso real y legado demo", () => {
  assert.equal(RUTAS_CUENTA_CLIENTE.registro, "/registro");
  assert.equal(RUTAS_CUENTA_CLIENTE.acceso, "/acceso");
  assert.equal(RUTAS_CUENTA_CLIENTE.cuenta, "/mi-cuenta");
  assert.equal(RUTAS_CUENTA_CLIENTE.recuperarPassword, "/recuperar-password");
  assert.equal(RUTAS_CUENTA_CLIENTE.pedidos, "/mi-cuenta/pedidos");
  assert.equal(RUTAS_CUENTA_CLIENTE.legadoDemo, "/cuenta-demo");
});

test("resumenCuentaRealV1 documenta sesión real y convivencia legacy", () => {
  const resumen = resumenCuentaRealV1().join(" ").toLowerCase();
  assert.match(resumen, /sesión segura/);
  assert.match(resumen, /pedidos reales/);
  assert.match(resumen, /cuentademo|cuenta demo/);
});
