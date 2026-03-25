import { test } from "node:test";
import * as assert from "node:assert/strict";

import { resolverTrackingVisibleCliente } from "../contenido/pedidos/trackingVisible";

test("tracking visible cuando existe código", () => {
  const estado = resolverTrackingVisibleCliente("enviado", {
    transportista: "Correos",
    codigo_seguimiento: "TRK-1",
    envio_sin_seguimiento: false,
  });

  assert.equal(estado.titulo, "Tracking disponible");
  assert.equal(estado.mostrarTracking, true);
  assert.match(estado.descripcion, /TRK-1/);
});

test("tracking honesto cuando envío sin seguimiento", () => {
  const estado = resolverTrackingVisibleCliente("enviado", {
    transportista: "Mensajería local",
    codigo_seguimiento: "",
    envio_sin_seguimiento: true,
  });

  assert.equal(estado.titulo, "Envío sin tracking público");
  assert.equal(estado.mostrarTracking, true);
});

test("sin tracking visible antes de expedición", () => {
  const estado = resolverTrackingVisibleCliente("preparando", {
    transportista: "Correos",
    codigo_seguimiento: "TRK-2",
    envio_sin_seguimiento: false,
  });

  assert.equal(estado.titulo, "Tracking pendiente");
  assert.equal(estado.mostrarTracking, false);
});
