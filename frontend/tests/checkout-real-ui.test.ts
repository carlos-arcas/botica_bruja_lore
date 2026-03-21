import { test } from "node:test";
import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const archivoFlujo = readFileSync(join(process.cwd(), "componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx"), "utf8");
const archivoPagina = readFileSync(join(process.cwd(), "app/checkout/page.tsx"), "utf8");
const archivoRecibo = readFileSync(join(process.cwd(), "componentes/catalogo/checkout-real/ReciboPedidoReal.tsx"), "utf8");
const archivoCompartido = readFileSync(join(process.cwd(), "componentes/catalogo/seleccion/ListaLineasSeleccion.tsx"), "utf8");
const archivoAdaptador = readFileSync(join(process.cwd(), "componentes/catalogo/checkout-real/adaptadoresLineasCheckoutReal.ts"), "utf8");
const archivoBloqueSeleccion = readFileSync(join(process.cwd(), "componentes/catalogo/checkout-real/BloquePedidoSeleccionMultiple.tsx"), "utf8");
const archivoNavegacion = readFileSync(join(process.cwd(), "contenido/catalogo/checkoutRealNavegacion.ts"), "utf8");


test("checkout real no depende de PayloadPedidoDemo ni de CuentaDemo", () => {
  assert.equal(archivoFlujo.includes("PayloadPedidoDemo"), false);
  assert.equal(archivoFlujo.includes("CuentaDemo"), false);
  assert.equal(archivoFlujo.includes("pedidosDemo"), false);
});

test("checkout real expone una ruta dedicada y recibo real propio", () => {
  assert.equal(archivoPagina.includes("FlujoCheckoutReal"), true);
  assert.equal(archivoFlujo.includes("/pedido/"), true);
});

test("recibo real permite iniciar o continuar el pago real sin tocar el flujo demo", () => {
  assert.equal(archivoRecibo.includes("Pagar ahora"), true);
  assert.equal(archivoRecibo.includes("iniciarPagoPedido"), true);
  assert.equal(archivoRecibo.includes("Stripe preparado para iniciar"), true);
});

test("checkout real muestra bloqueo explícito cuando hay líneas visibles no comprables", () => {
  assert.equal(archivoBloqueSeleccion.includes("El pedido real queda bloqueado porque tu selección visible incluye líneas no comprables."), true);
  assert.equal(archivoBloqueSeleccion.includes("Separa esas piezas como consulta manual antes de continuar con el pago."), true);
  assert.equal(archivoBloqueSeleccion.includes("Contexto de toda la selección visible"), true);
  assert.equal(archivoBloqueSeleccion.includes("Llevar esta selección a consulta artesanal"), true);
  assert.equal(archivoBloqueSeleccion.includes("Volver a Mi selección"), true);
  assert.equal(archivoAdaptador.includes("Línea bloqueada fuera del pedido real"), true);
});

test("checkout real deriva a /encargo preservando la selección rica cuando está bloqueado", () => {
  assert.equal(archivoFlujo.includes("construirRutaConsultaManualCheckoutReal"), true);
  assert.equal(archivoFlujo.includes("guardarPreseleccionEncargoLocal(contexto.itemsPreseleccionados)"), true);
  assert.equal(archivoNavegacion.includes('origen: "seleccion"'), true);
  assert.equal(archivoNavegacion.includes("serializarItemsEncargo(items)"), false);
  assert.equal(archivoNavegacion.includes('return `/encargo?${params.toString()}`;'), true);
});

test("checkout real desactiva el CTA engañoso de pedido real cuando el flujo está bloqueado", () => {
  assert.equal(archivoFlujo.includes("disabled={enviando || checkoutBloqueado}"), true);
  assert.equal(archivoFlujo.includes("Pedido real bloqueado por líneas no convertibles"), true);
  assert.equal(archivoFlujo.includes("ayuda-checkout-bloqueado"), true);
});

test("checkout real separa el modo múltiple del selector único heredado", () => {
  assert.equal(archivoFlujo.includes('modoCheckout === "producto_unico" ? ('), true);
  assert.equal(archivoFlujo.includes("BloquePedidoSeleccionMultiple"), true);
  assert.equal(archivoBloqueSeleccion.includes("este modo no usa un selector único heredado"), true);
});

test("checkout real en modo múltiple muestra convertibles con contexto rico y las bloqueadas por separado", () => {
  assert.equal(archivoBloqueSeleccion.includes("Selección real que entra en el pedido"), true);
  assert.equal(archivoBloqueSeleccion.includes("resumenEconomico.etiqueta"), true);
  assert.equal(archivoBloqueSeleccion.includes("ListaLineasSeleccion items={lineasConvertiblesVisuales}"), true);
  assert.equal(archivoBloqueSeleccion.includes("ListaLineasSeleccion items={lineasBloqueadasVisuales}"), true);
  assert.equal(archivoAdaptador.includes("Línea convertible al pedido real"), true);
  assert.equal(archivoCompartido.includes("Referencia unitaria"), true);
  assert.equal(archivoCompartido.includes("Subtotal orientativo"), true);
});

test("checkout real no reutiliza el resumen global de la selección visible como total principal del pedido", () => {
  assert.match(
    archivoFlujo,
    /lineasConvertibles\.map\(\(\{ linea \}\) => linea\),\s+"pedido_real"/,
  );
  assert.equal(archivoFlujo.includes('resolverResumenEconomicoSeleccion(lineasSeleccion)'), true);
  assert.equal(archivoFlujo.includes('"pedido_real"'), true);
  assert.equal(archivoFlujo.includes('"fuera_pedido_real"'), true);
});


test("checkout real reutiliza el patrón compartido mediante un adaptador fino en lugar de duplicar markup textual", () => {
  assert.equal(archivoFlujo.includes("construirLineasVisualesCheckoutReal"), true);
  assert.equal(archivoAdaptador.includes("resolverLineasSeleccionEncargo"), true);
  assert.equal(archivoAdaptador.includes("Línea convertible al pedido real"), true);
  assert.equal(archivoAdaptador.includes("Línea bloqueada fuera del pedido real"), true);
  assert.equal(/<ul>\s*\{lineasConvertibles/.test(archivoFlujo), false);
  assert.equal(/<li[^>]*>\s*\{linea\.cantidad\}/.test(archivoFlujo), false);
});
