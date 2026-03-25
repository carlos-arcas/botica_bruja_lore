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
const archivoSelectorDireccion = readFileSync(join(process.cwd(), "componentes/catalogo/checkout-real/SelectorDireccionCheckoutReal.tsx"), "utf8");
const archivoDireccionesCheckout = readFileSync(join(process.cwd(), "contenido/catalogo/checkoutRealDirecciones.ts"), "utf8");
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
  assert.equal(archivoFlujo.includes("disabled={enviando || checkoutBloqueado || importeEnvioApi === null}"), true);
  assert.equal(archivoFlujo.includes("Pedido real bloqueado por líneas no convertibles"), true);
  assert.equal(archivoFlujo.includes("ayuda-checkout-bloqueado"), true);
  assert.equal(archivoFlujo.includes("obtenerTarifaEnvioEstandar"), true);
});

test("checkout real separa el modo múltiple del selector único heredado", () => {
  assert.equal(archivoFlujo.includes('modoCheckout === "producto_unico" ? <BloquePedidoProductoUnico'), true);
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


test("checkout real autenticado muestra selector de direcciones guardadas y fallback manual", () => {
  assert.equal(archivoFlujo.includes("SelectorDireccionCheckoutReal"), true);
  assert.equal(archivoFlujo.includes("obtenerSesionCuentaCliente"), true);
  assert.equal(archivoFlujo.includes("obtenerDireccionesCuentaCliente"), true);
  assert.equal(archivoSelectorDireccion.includes("Usar dirección guardada"), true);
  assert.equal(archivoSelectorDireccion.includes("Introducir dirección manual"), true);
  assert.equal(archivoSelectorDireccion.includes("/mi-cuenta/direcciones"), true);
});

test("checkout real precarga la dirección predeterminada cuando existe", () => {
  assert.equal(archivoFlujo.includes("resolverDireccionPredeterminadaCheckoutReal"), true);
  assert.equal(archivoDireccionesCheckout.includes("direccion.predeterminada"), true);
  assert.equal(archivoDireccionesCheckout.includes("aplicarDireccionGuardadaADatosCheckoutReal"), true);
});

test("checkout real no expone bloque de libreta al invitado y mantiene modo manual", () => {
  assert.equal(archivoFlujo.includes('datos.canal_checkout === "web_autenticado"'), true);
  assert.equal(archivoFlujo.includes('modo_direccion: "manual"'), true);
  assert.equal(archivoFlujo.includes("Checkout como invitada"), true);
});

test("checkout real muestra detalle limpio cuando la API rechaza por stock", () => {
  assert.equal(archivoFlujo.includes('resultado.codigo === "stock_no_disponible" ? resultado.lineas ?? [] : []'), true);
  assert.equal(archivoFlujo.includes("Stock disponible:"), true);
  assert.equal(archivoFlujo.includes("linea.detalle"), true);
});


test("checkout real deja claro que la disponibilidad frontend es informativa y no reserva stock", () => {
  const archivoAviso = readFileSync(join(process.cwd(), "componentes/catalogo/checkout-real/AvisoDisponibilidadCheckoutReal.tsx"), "utf8");

  assert.equal(archivoFlujo.includes("La disponibilidad visible en frontend es orientativa"), true);
  assert.equal(archivoFlujo.includes("AvisoDisponibilidadCheckoutReal"), true);
  assert.equal(archivoAviso.includes("backend sigue siendo la última línea de defensa"), true);
  assert.equal(archivoAviso.includes("no existe reserva temporal"), true);
  assert.equal(archivoAviso.includes("Comprobando disponibilidad pública mínima"), true);
  assert.equal(archivoAviso.includes("sin_cobertura"), true);
});

test("checkout real muestra subtotal, envío estándar, impuestos y total antes de pagar", () => {
  assert.equal(archivoFlujo.includes("Subtotal:"), true);
  assert.equal(archivoFlujo.includes("Envío estándar:"), true);
  assert.equal(archivoFlujo.includes("Base imponible:"), true);
  assert.equal(archivoFlujo.includes("Impuestos por línea"), true);
  assert.equal(archivoFlujo.includes("Total:"), true);
});

test("checkout real expone cantidad comercial y unidad cuando prepara compra a granel", () => {
  assert.equal(archivoFlujo.includes("Cantidad comercial ("), true);
  assert.equal(archivoFlujo.includes("Mínimo de compra:"), true);
  assert.equal(archivoFlujo.includes("Incremento mínimo:"), true);
});

test("recibo real muestra subtotal, base, impuestos, envío y total del pedido", () => {
  assert.equal(archivoRecibo.includes("Subtotal:"), true);
  assert.equal(archivoRecibo.includes("Envío ("), true);
  assert.equal(archivoRecibo.includes("Base imponible:"), true);
  assert.equal(archivoRecibo.includes("Impuestos (tipo"), true);
  assert.equal(archivoRecibo.includes("Total:"), true);
  assert.equal(archivoRecibo.includes("Descargar documento fiscal HTML"), true);
  assert.equal(archivoRecibo.includes("construirUrlDocumentoPedido"), true);
});
