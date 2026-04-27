import * as assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const archivoFlujo = readFileSync(
  join(process.cwd(), "componentes/catalogo/encargo/FlujoEncargoConsulta.tsx"),
  "utf8",
);

const archivoBloque = readFileSync(
  join(
    process.cwd(),
    "componentes/catalogo/encargo/BloqueIdentificacionCheckoutDemo.tsx",
  ),
  "utf8",
);

const archivoRecibo = readFileSync(
  join(process.cwd(), "componentes/catalogo/encargo/ReciboPedidoDemo.tsx"),
  "utf8",
);

const archivoResumen = readFileSync(
  join(process.cwd(), "componentes/catalogo/encargo/ResumenEnvioEncargoDemo.tsx"),
  "utf8",
);

test("checkout demo elimina el input manual de id_usuario", () => {
  assert.equal(archivoFlujo.includes('name="idUsuarioDemo"'), false);
  assert.equal(archivoFlujo.includes("ID de usuario demo"), false);
});

test("checkout demo muestra estado claro de cuenta autenticada y mantiene CTA invitado", () => {
  assert.equal(archivoBloque.includes("Estás comprando como"), true);
  assert.equal(archivoBloque.includes("Continuar como invitado"), true);
  assert.equal(archivoFlujo.includes("guardarBorradorCheckoutDemo"), true);
  assert.equal(archivoFlujo.includes("limpiarBorradorCheckoutDemo"), true);
  assert.equal(
    archivoFlujo.includes("construirRutaCuentaDemoConRetornoSeguro"),
    true,
  );
});

test("checkout demo mantiene continuidad con retorno seguro y sin recuperar consentimiento marcado", () => {
  assert.equal(archivoFlujo.includes("returnTo=%2Fencargo"), false);
  assert.match(archivoFlujo, /consentimiento:\s*false/);
  assert.match(
    archivoFlujo,
    /router\.push\(\s*construirRutaCuentaDemoConRetornoSeguro/,
  );
  assert.match(
    archivoFlujo,
    /guardarBorradorCheckoutDemo\(datos,\s*false\);/,
  );
});

test("el recibo demo muestra CTA contextual hacia cuenta demo con sesión activa", () => {
  assert.equal(
    archivoRecibo.includes("Ver este pedido en mi cuenta demo"),
    true,
  );
  assert.equal(archivoRecibo.includes("pedidoRecientePerteneceASesion"), true);
  assert.equal(archivoRecibo.includes(`href="/cuenta-demo"`), true);
});

test("el checkout demo guarda continuidad post-checkout sin tocar el contrato de PedidoDemo", () => {
  assert.match(
    archivoFlujo,
    /guardarPedidoRecienteDemo\([\s\S]*resultado\.pedido\.id_pedido/,
  );
  assert.match(archivoFlujo, /router\.push\(\s*construirRutaReciboPedidoDemo/);
});

test("el recibo público sigue contemplando uso sin sesión demo", () => {
  assert.equal(
    archivoRecibo.includes("!mostrarCtaCuenta && haySesionDemo"),
    true,
  );
  assert.equal(archivoRecibo.includes("EstadoVacio"), true);
  assert.equal(archivoRecibo.includes("EstadoError"), true);
});


test("checkout demo hace visible el bloqueo honesto de líneas no convertibles", () => {
  assert.equal(archivoFlujo.includes("Esta selección no se enviará como pedido demo completo"), true);
  assert.equal(archivoFlujo.includes("Mantén estas piezas como consulta artesanal"), true);
});

test("checkout demo desacopla el resumen manual del bloqueo de líneas no convertibles", () => {
  assert.match(
    archivoFlujo,
    /const erroresConsulta = validarSolicitudConsulta[\s\S]*const erroresCheckout = validarCheckoutDemo[\s\S]*const resumenConsulta = construirResumenConsulta/,
  );
  assert.match(
    archivoFlujo,
    /setResumen\(resumenConsulta\);\s*if \(Object\.keys\(erroresCheckout\)\.length > 0\)/,
  );
  assert.equal(
    archivoFlujo.includes(
      "No podemos crear el pedido demo con esta selección, pero sí puedes enviarla como consulta artesanal usando el resumen y los canales disponibles aquí mismo.",
    ),
    true,
  );
});

test("el resumen final mantiene CTAs manuales disponibles cuando existe salida artesanal", () => {
  assert.equal(archivoFlujo.includes("mensajeConsultaManual={mensajeConsultaManual}"), true);
  assert.equal(archivoResumen.includes("mensajeConsultaManual"), true);
  assert.equal(archivoResumen.includes("props.canales.map"), true);
  assert.equal(archivoResumen.includes("props.onCopiarResumen"), true);
});
