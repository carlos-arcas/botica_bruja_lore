import { test } from "node:test";
import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const archivoFlujo = readFileSync(join(process.cwd(), "componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx"), "utf8");
const archivoPagina = readFileSync(join(process.cwd(), "app/checkout/page.tsx"), "utf8");
const archivoRecibo = readFileSync(join(process.cwd(), "componentes/catalogo/checkout-real/ReciboPedidoReal.tsx"), "utf8");
const archivoReciboHelper = readFileSync(join(process.cwd(), "contenido/pedidos/reciboPedidoReal.ts"), "utf8");
const archivoCompartido = readFileSync(join(process.cwd(), "componentes/catalogo/seleccion/ListaLineasSeleccion.tsx"), "utf8");
const archivoAdaptador = readFileSync(join(process.cwd(), "componentes/catalogo/checkout-real/adaptadoresLineasCheckoutReal.ts"), "utf8");
const archivoBloqueSeleccion = readFileSync(join(process.cwd(), "componentes/catalogo/checkout-real/BloquePedidoSeleccionMultiple.tsx"), "utf8");
const archivoSelectorDireccion = readFileSync(join(process.cwd(), "componentes/catalogo/checkout-real/SelectorDireccionCheckoutReal.tsx"), "utf8");
const archivoDireccionesCheckout = readFileSync(join(process.cwd(), "contenido/catalogo/checkoutRealDirecciones.ts"), "utf8");
const archivoNavegacion = readFileSync(join(process.cwd(), "contenido/catalogo/checkoutRealNavegacion.ts"), "utf8");
const archivoCesta = readFileSync(join(process.cwd(), "componentes/catalogo/cesta/VistaCestaRitual.tsx"), "utf8");
const paginaEncargo = readFileSync(join(process.cwd(), "app/encargo/page.tsx"), "utf8");


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
  assert.equal(archivoReciboHelper.includes("Pagar ahora"), true);
  assert.equal(archivoRecibo.includes("iniciarPagoPedido"), true);
  assert.equal(archivoReciboHelper.includes("Pendiente de iniciar"), true);
});

test("recibo real permite confirmar pago de prueba local sin mostrarlo para Stripe", () => {
  assert.equal(archivoRecibo.includes("confirmarPagoSimuladoPedido"), true);
  assert.equal(archivoRecibo.includes("resolverEsPagoSimuladoLocal"), true);
  assert.equal(archivoRecibo.includes("Pago de prueba en entorno local"), true);
  assert.equal(archivoRecibo.includes("Confirmar pago de prueba"), true);
  assert.equal(archivoRecibo.includes("pasarela real"), true);
  assert.equal(archivoRecibo.includes("!pagoSimuladoLocal"), true);
});

test("recibo real no usa lenguaje de pedido demo y expone CTAs comerciales", () => {
  assert.equal(archivoRecibo.toLowerCase().includes("pedido demo"), false);
  assert.equal(archivoRecibo.toLowerCase().includes("legacy"), false);
  assert.equal(archivoRecibo.includes("Ver mi cuenta"), true);
  assert.equal(archivoRecibo.includes("Seguir comprando"), true);
  assert.equal(archivoRecibo.includes("Descargar documento fiscal"), true);
});

test("recibo real redirige tras confirmar pago de prueba al retorno success del pedido", () => {
  assert.equal(archivoRecibo.includes("confirmarPagoLocal"), true);
  assert.equal(archivoRecibo.includes("construirUrlRetornoPedido(resultado.pedido.id_pedido, \"success\")"), true);
  assert.equal(archivoRecibo.includes("setPedido(resultado.pedido)"), true);
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

test("cesta dirige la compra normal al checkout y conserva encargo como orientación secundaria", () => {
  assert.equal(archivoCesta.includes("href={hrefCheckout}"), true);
  assert.equal(archivoCesta.includes("convertirCestaAItemsCheckoutReal(cesta)"), true);
  assert.equal(archivoCesta.includes("resumenCestaReal.puedeFinalizarCompra"), true);
  assert.equal(archivoCesta.includes("Finalizar compra"), true);
  assert.equal(archivoCesta.includes('href="/encargo?origen=seleccion"'), true);
  assert.equal(archivoCesta.includes("Pedir orientacion artesanal"), true);
});

test("cesta separa lineas de consulta y no las envia al checkout real", () => {
  assert.equal(archivoCesta.includes("resolverResumenCestaReal(cesta)"), true);
  assert.equal(archivoCesta.includes("hayLineasNoComprables(resumenCestaReal)"), true);
  assert.equal(archivoCesta.includes("Consulta personalizada"), true);
  assert.equal(archivoCesta.includes("Revisa la seleccion para continuar"), true);
});

test("/encargo se presenta como consulta personalizada y enlaza al checkout principal", () => {
  assert.equal(paginaEncargo.includes("Canal de consulta personalizada"), true);
  assert.equal(paginaEncargo.includes('href="/checkout"'), true);
  assert.equal(paginaEncargo.includes("Para una compra normal"), true);
});

test("checkout real desactiva el CTA engañoso de pedido real cuando el flujo está bloqueado", () => {
  assert.equal(archivoFlujo.includes("disabled={enviando || checkoutBloqueado || checkoutSinTarifaEnvio}"), true);
  assert.equal(archivoFlujo.includes("Ajusta la seleccion para continuar"), true);
  assert.equal(archivoFlujo.includes("ayuda-checkout-bloqueado"), true);
  assert.equal(archivoFlujo.includes("ayuda-checkout-envio"), true);
  assert.equal(archivoFlujo.includes("obtenerTarifaEnvioEstandar"), true);
});

test("checkout real asocia labels, errores y foco de error principal", () => {
  assert.equal(archivoFlujo.includes("label htmlFor={id}"), true);
  assert.equal(archivoFlujo.includes("aria-invalid={Boolean(error)}"), true);
  assert.equal(archivoFlujo.includes("aria-describedby={error ? idError : undefined}"), true);
  assert.equal(archivoFlujo.includes('role="alert" tabIndex={-1} ref={referenciaError}'), true);
  assert.equal(archivoFlujo.includes("referenciaError.current?.focus()"), true);
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
  assert.equal(archivoFlujo.includes("Compra como invitada"), true);
});

test("checkout real muestra detalle limpio cuando la API rechaza por stock", () => {
  assert.equal(archivoFlujo.includes('resultado.codigo === "stock_no_disponible" ? resultado.lineas ?? [] : []'), true);
  assert.equal(archivoFlujo.includes("traducirLineaStock(linea)"), true);
  assert.equal(archivoFlujo.includes("Revisar disponibilidad"), true);
  assert.equal(archivoFlujo.includes("Volver a cesta"), true);
  assert.equal(archivoFlujo.includes("linea.detalle"), false);
});

test("recibo real no muestra codigos tecnicos y ofrece salidas cuando el pedido no carga", () => {
  assert.equal(archivoRecibo.includes("resolverEstadoPedidoNoCargado"), true);
  assert.equal(archivoRecibo.includes("traducirMensajeErrorPedido"), true);
  assert.equal(archivoRecibo.includes("traducirLineaStock(linea)"), true);
  assert.equal(archivoRecibo.includes("Pedido no encontrado"), false);
  assert.equal(archivoRecibo.includes("linea.detalle"), false);
});


test("checkout real deja claro que la disponibilidad frontend es informativa y no reserva stock", () => {
  const archivoAviso = readFileSync(join(process.cwd(), "componentes/catalogo/checkout-real/AvisoDisponibilidadCheckoutReal.tsx"), "utf8");

  assert.equal(archivoFlujo.includes("La disponibilidad es orientativa"), true);
  assert.equal(archivoFlujo.includes("AvisoDisponibilidadCheckoutReal"), true);
  assert.equal(archivoAviso.includes("Este aviso es informativo y no reserva unidades"), true);
  assert.equal(archivoAviso.includes("La confirmaremos al preparar el pedido"), true);
  assert.equal(archivoAviso.includes("Comprobando disponibilidad"), true);
  assert.equal(archivoAviso.includes("sin_cobertura"), true);
});

test("checkout real muestra subtotal, envío estándar, impuestos y total antes de pagar", () => {
  assert.equal(archivoFlujo.includes("Subtotal:"), true);
  assert.equal(archivoFlujo.includes("Envío estándar:"), true);
  assert.equal(archivoFlujo.includes("Base imponible:"), true);
  assert.equal(archivoFlujo.includes("Impuestos por línea"), true);
  assert.equal(archivoFlujo.includes("Total:"), true);
});

test("checkout real enlaza condiciones, privacidad, envios y devoluciones", () => {
  assert.equal(archivoFlujo.includes('href="/condiciones-encargo"'), true);
  assert.equal(archivoFlujo.includes('href="/privacidad"'), true);
  assert.equal(archivoFlujo.includes('href="/envios-y-preparacion"'), true);
  assert.equal(archivoFlujo.includes('href="/devoluciones"'), true);
});

test("checkout real expone cantidad comercial y unidad cuando prepara compra a granel", () => {
  assert.equal(archivoFlujo.includes("Cantidad comercial ("), true);
  assert.equal(archivoFlujo.includes("Mínimo de compra:"), true);
  assert.equal(archivoFlujo.includes("Incremento mínimo:"), true);
});

test("recibo real muestra subtotal, base, impuestos, envío y total del pedido", () => {
  assert.equal(archivoRecibo.includes("Subtotal:"), true);
  assert.equal(archivoRecibo.includes("Envio ("), true);
  assert.equal(archivoRecibo.includes("Base imponible:"), true);
  assert.equal(archivoRecibo.includes("Impuestos (tipo"), true);
  assert.equal(archivoRecibo.includes("Total:"), true);
  assert.equal(archivoRecibo.includes("Descargar documento fiscal"), true);
  assert.equal(archivoRecibo.includes("construirUrlDocumentoPedido"), true);
});

test("recibo real anuncia carga, mensajes y pago simulado de forma accesible", () => {
  assert.equal(archivoRecibo.includes('role="status"'), true);
  assert.equal(archivoRecibo.includes('aria-live="polite"'), true);
  assert.equal(archivoRecibo.includes('role="region" aria-labelledby="titulo-pago-simulado-local"'), true);
  assert.equal(archivoRecibo.includes("aria-busy={confirmando}"), true);
});
