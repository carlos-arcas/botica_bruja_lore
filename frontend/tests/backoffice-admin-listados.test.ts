import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { resolverEstadoRenderListadoAdmin } from "../componentes/admin/estadoListadoAdmin";

test("resolverEstadoRenderListadoAdmin distingue datos, vacío, denegado y error preservando detalle y operation_id", () => {
  const vacio = resolverEstadoRenderListadoAdmin(
    { estado: "ok", items: [] },
    { mensajeVacio: "Sin registros reales.", mensajeDenegado: "Sin sesión.", mensajeError: "Backend caído." },
  );
  const denegado = resolverEstadoRenderListadoAdmin(
    { estado: "denegado", detalle: "Sesión expirada.", operation_id: "auth-401" },
    { mensajeVacio: "Sin registros reales.", mensajeDenegado: "Sin sesión.", mensajeError: "Backend caído." },
  );
  const error = resolverEstadoRenderListadoAdmin(
    { estado: "error", detalle: "Servicio editorial no disponible.", operation_id: "srv-503" },
    { mensajeVacio: "Sin registros reales.", mensajeDenegado: "Sin sesión.", mensajeError: "Backend caído." },
  );
  const ok = resolverEstadoRenderListadoAdmin(
    { estado: "ok", items: [{ id: 1, nombre: "Rosa" }] },
    { mensajeVacio: "Sin registros reales.", mensajeDenegado: "Sin sesión.", mensajeError: "Backend caído." },
  );

  assert.deepEqual(vacio, { items: [], estado: { tipo: "vacio", mensaje: "Sin registros reales." } });
  assert.deepEqual(denegado, {
    items: [],
    estado: { tipo: "denegado", mensaje: "Sin sesión.", detalle: "Sesión expirada. · operation_id: auth-401", operationId: "auth-401" },
  });
  assert.deepEqual(error, {
    items: [],
    estado: { tipo: "error", mensaje: "Backend caído.", detalle: "Servicio editorial no disponible. · operation_id: srv-503", operationId: "srv-503" },
  });
  assert.deepEqual(ok, { items: [{ id: 1, nombre: "Rosa" }], estado: { tipo: "datos", mensaje: "Datos cargados." } });
});

test("pages server del admin ya no degradan errores a arrays vacíos silenciosos", () => {
  const productos = readFileSync("app/admin/(panel)/productos/page.tsx", "utf8");
  const pedidos = readFileSync("app/admin/(panel)/pedidos/page.tsx", "utf8");
  const rituales = readFileSync("app/admin/(panel)/rituales/page.tsx", "utf8");

  assert.match(productos, /resolverEstadoRenderListadoAdmin/);
  assert.match(pedidos, /resolverEstadoRenderListadoAdmin/);
  assert.match(rituales, /resolverEstadoRenderListadoAdmin/);
  assert.doesNotMatch(productos, /resultado\.estado === "ok" \? resultado\.items : \[\]/);
  assert.doesNotMatch(pedidos, /resultado\.estado === "ok" \? resultado\.items : \[\]/);
  assert.doesNotMatch(rituales, /resultado\.estado === "ok" \? normalizarItemsRituales\(resultado\.items\) : \[\]/);
});

test("módulos administrativos muestran estado visible en lugar de simular lista vacía", () => {
  const moduloPedidos = readFileSync("componentes/admin/ModuloPedidosAdmin.tsx", "utf8");
  const moduloCrud = readFileSync("componentes/admin/ModuloCrudContextualAdmin.tsx", "utf8");
  const panelEstado = readFileSync("componentes/admin/PanelEstadoListadoAdmin.tsx", "utf8");

  assert.match(moduloPedidos, /estadoListadoInicial/);
  assert.match(moduloPedidos, /PanelEstadoListadoAdmin/);
  assert.match(moduloCrud, /estadoListadoInicial/);
  assert.match(moduloCrud, /resolverMensajeTablaVacia/);
  assert.match(moduloCrud, /PanelEstadoListadoAdmin/);
  assert.match(panelEstado, /estado\.detalle/);
  assert.match(panelEstado, /role=\{rol\}/);
});
