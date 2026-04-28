import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  RUTAS_CUENTA_CLIENTE,
  resumenCuentaRealV1,
} from "../contenido/cuenta_cliente/rutasCuentaCliente";

test("rutas canonicas de cuenta real separan acceso real y legado", () => {
  assert.equal(RUTAS_CUENTA_CLIENTE.registro, "/registro");
  assert.equal(RUTAS_CUENTA_CLIENTE.acceso, "/acceso");
  assert.equal(RUTAS_CUENTA_CLIENTE.cuenta, "/mi-cuenta");
  assert.equal(RUTAS_CUENTA_CLIENTE.recuperarPassword, "/recuperar-password");
  assert.equal(RUTAS_CUENTA_CLIENTE.pedidos, "/mi-cuenta/pedidos");
  assert.equal(RUTAS_CUENTA_CLIENTE.direcciones, "/mi-cuenta/direcciones");
  assert.equal(RUTAS_CUENTA_CLIENTE.legadoDemo, "/cuenta-demo");
});

test("resumenCuentaRealV1 documenta mi cuenta sin promocion publica del legado", () => {
  const resumen = resumenCuentaRealV1().join(" ").toLowerCase();

  assert.match(resumen, /cuenta de cliente|mi cuenta/);
  assert.match(resumen, /pedidos asociados/);
  assert.match(resumen, /mi cuenta/);
  assert.doesNotMatch(resumen, /cuentademo|cuenta demo/);
});

test("mi cuenta visible no ofrece CTA hacia cuenta-demo", () => {
  const panel = readFileSync(
    "componentes/cuenta_cliente/PanelCuentaCliente.tsx",
    "utf8",
  );

  assert.equal(panel.includes("RUTAS_CUENTA_CLIENTE.legadoDemo"), false);
  assert.equal(panel.includes("Legado demo"), false);
  assert.equal(panel.includes("Mis direcciones guardadas"), true);
  assert.equal(panel.includes("Descargar documento fiscal"), true);
});
