import { test } from "node:test";
import * as assert from "node:assert/strict";

import {
  construirEstadoInicialCheckoutReal,
  construirLineasPedidoReal,
  construirPayloadPedidoReal,
  construirResultadoLineasPedidoReal,
  resolverModoCheckoutReal,
  validarCheckoutReal,
} from "../contenido/catalogo/checkoutReal";
import {
  construirRutaConsultaManualCheckoutReal,
  construirRutaRevisionSeleccionCheckoutReal,
} from "../contenido/catalogo/checkoutRealNavegacion";
import { construirLineasVisualesCheckoutReal } from "../componentes/catalogo/checkout-real/adaptadoresLineasCheckoutReal";
import {
  resolverLineasSeleccionEncargo,
  resolverResumenEconomicoSeleccion,
} from "../contenido/catalogo/seleccionEncargo";
import {
  construirUrlRetornoPedido,
  crearPedidoPublico,
  iniciarPagoPedido,
} from "../infraestructura/api/pedidos";

function construirDatosBaseCheckoutReal() {
  return {
    ...construirEstadoInicialCheckoutReal(),
    email_contacto: "real@test.dev",
    nombre_contacto: "Lore",
    telefono_contacto: "600000000",
    nombre_destinatario: "Lore",
    linea_1: "Calle Luna 1",
    codigo_postal: "28001",
    ciudad: "Madrid",
    provincia: "Madrid",
  };
}

test("checkout real usa un payload propio y separado del demo", () => {
  const inicial = construirEstadoInicialCheckoutReal("tarot-bosque-interior");
  const lineas = construirLineasPedidoReal([], "tarot-bosque-interior", "2");
  const payload = construirPayloadPedidoReal(
    {
      ...inicial,
      email_contacto: "real@test.dev",
      nombre_contacto: "Lore",
      telefono_contacto: "600000000",
      nombre_destinatario: "Lore",
      linea_1: "Calle Luna 1",
      codigo_postal: "28001",
      ciudad: "Madrid",
      provincia: "Madrid",
    },
    lineas,
  );

  assert.equal("email" in payload, false);
  assert.equal("canal" in payload, false);
  assert.equal(payload.canal_checkout, "web_invitado");
  assert.equal(payload.direccion_entrega.ciudad, "Madrid");
});

test("checkout real valida dirección obligatoria y modo invitado por defecto", () => {
  const inicial = construirEstadoInicialCheckoutReal();
  const errores = validarCheckoutReal(inicial, []);
  assert.equal(inicial.canal_checkout, "web_invitado");
  assert.equal(Boolean(errores.nombre_destinatario), true);
  assert.equal(Boolean(errores.lineas), true);
});

test("checkout real puede operar como invitado sin id_usuario", () => {
  const datos = {
    ...construirEstadoInicialCheckoutReal("vela-intencion-clara"),
    email_contacto: "guest@test.dev",
    nombre_contacto: "Invitada",
    telefono_contacto: "611111111",
    nombre_destinatario: "Invitada",
    linea_1: "Calle Sol 3",
    codigo_postal: "41001",
    ciudad: "Sevilla",
    provincia: "Sevilla",
  };
  const lineas = construirLineasPedidoReal([], "vela-intencion-clara", "1");
  const payload = construirPayloadPedidoReal(datos, lineas);
  assert.equal(payload.id_usuario, undefined);
  assert.equal(payload.canal_checkout, "web_invitado");
});

test("checkout real en modo múltiple no exige producto_slug y construye el payload desde la selección", () => {
  const itemsPreseleccionados = [
    {
      id_linea: "rit-004",
      tipo_linea: "catalogo" as const,
      slug: "vela-intencion-clara",
      id_producto: null,
      nombre: "Vela Intención Clara",
      cantidad: 2,
      formato: null,
      imagen_url: null,
      referencia_economica: { etiqueta: "Disponible", valor: 16 },
      notas_origen: null,
    },
    {
      id_linea: "rit-005",
      tipo_linea: "catalogo" as const,
      slug: "pack-bosque-dorado",
      id_producto: null,
      nombre: "Pack Bosque Dorado",
      cantidad: 1,
      formato: null,
      imagen_url: null,
      referencia_economica: { etiqueta: "Disponible", valor: 34 },
      notas_origen: null,
    },
  ];
  const modo = resolverModoCheckoutReal(itemsPreseleccionados);
  const resultado = construirResultadoLineasPedidoReal(itemsPreseleccionados, "", "1");
  const datos = {
    ...construirDatosBaseCheckoutReal(),
    producto_slug: "",
  };

  const errores = validarCheckoutReal(datos, resultado, modo);
  const payload = construirPayloadPedidoReal(datos, resultado.lineasConvertibles);

  assert.equal(modo, "seleccion_multiple");
  assert.equal(errores.producto_slug, undefined);
  assert.equal(resultado.lineasNoConvertibles.length, 0);
  assert.deepEqual(
    payload.lineas.map((linea) => ({ slug: linea.slug_producto, cantidad: linea.cantidad })),
    [
      { slug: "vela-intencion-clara", cantidad: 2 },
      { slug: "pack-bosque-dorado", cantidad: 1 },
    ],
  );
});

test("checkout real bloquea selección mixta y evita enviar menos líneas de las visibles", () => {
  const itemsPreseleccionados = [
    {
      id_linea: "rit-001",
      tipo_linea: "catalogo" as const,
      slug: "vela-intencion-clara",
      id_producto: null,
      nombre: "Vela Intención Clara",
      cantidad: 1,
      formato: null,
      imagen_url: null,
      referencia_economica: { etiqueta: "Referencia editorial disponible", valor: 9.9 },
      notas_origen: null,
    },
    {
      id_linea: "libre-001",
      tipo_linea: "fuera_catalogo" as const,
      slug: null,
      id_producto: null,
      nombre: "Atado herbal a medida",
      cantidad: 1,
      formato: "ramillete artesanal",
      imagen_url: null,
      referencia_economica: { etiqueta: "Sin referencia económica", valor: null },
      notas_origen: "Petición manual.",
    },
  ];
  const resultado = construirResultadoLineasPedidoReal(itemsPreseleccionados, "", "1");

  assert.equal(resultado.lineasConvertibles.length, 1);
  assert.equal(resultado.lineasNoConvertibles.length, 1);
  const errores = validarCheckoutReal(
    {
      ...construirDatosBaseCheckoutReal(),
      producto_slug: "",
    },
    resultado,
    resolverModoCheckoutReal(itemsPreseleccionados),
  );
  assert.match(errores.lineas ?? "", /No podemos crear el pedido real/);
});

test("checkout real no crea pedido vacío cuando toda la selección es no catalogable", () => {
  const itemsPreseleccionados = [
    {
      id_linea: "libre-001",
      tipo_linea: "fuera_catalogo" as const,
      slug: null,
      id_producto: null,
      nombre: "Atado herbal a medida",
      cantidad: 1,
      formato: "ramillete artesanal",
      imagen_url: null,
      referencia_economica: { etiqueta: "Sin referencia económica", valor: null },
      notas_origen: "Petición manual.",
    },
  ];
  const resultado = construirResultadoLineasPedidoReal(itemsPreseleccionados, "", "1");

  const errores = validarCheckoutReal(
    {
      ...construirDatosBaseCheckoutReal(),
      producto_slug: "",
    },
    resultado,
    resolverModoCheckoutReal(itemsPreseleccionados),
  );

  assert.equal(resultado.lineasConvertibles.length, 0);
  assert.equal(resultado.lineasNoConvertibles.length, 1);
  assert.match(errores.lineas ?? "", /Atado herbal a medida/);
});



test("checkout real conserva contexto rico por línea en selección mixta sin degradarse a cantidad por nombre", () => {
  const itemsPreseleccionados = [
    {
      id_linea: "rit-001",
      tipo_linea: "catalogo" as const,
      slug: "vela-intencion-clara",
      id_producto: null,
      nombre: "Vela Intención Clara",
      cantidad: 1,
      formato: null,
      imagen_url: null,
      referencia_economica: { etiqueta: "Referencia editorial disponible", valor: 9.9 },
      notas_origen: null,
    },
    {
      id_linea: "libre-001",
      tipo_linea: "fuera_catalogo" as const,
      slug: null,
      id_producto: null,
      nombre: "Atado herbal a medida",
      cantidad: 1,
      formato: "ramillete artesanal",
      imagen_url: null,
      referencia_economica: { etiqueta: "Sin referencia económica", valor: null },
      notas_origen: "Petición manual.",
    },
  ];
  const resultado = construirResultadoLineasPedidoReal(itemsPreseleccionados, "", "1");
  const visuales = construirLineasVisualesCheckoutReal(itemsPreseleccionados, resultado);

  assert.equal(visuales.lineasConvertibles.length, 1);
  assert.equal(visuales.lineasBloqueadas.length, 1);
  assert.equal(visuales.lineasConvertibles[0]?.linea.nombre, "Vela Intención Clara");
  assert.ok((visuales.lineasConvertibles[0]?.linea.imagen_url ?? "").length > 0);
  assert.ok(Boolean(visuales.lineasConvertibles[0]?.linea.formato));
  assert.equal(
    visuales.lineasConvertibles[0]?.estado?.etiqueta,
    "Línea convertible al pedido real",
  );
  assert.equal(visuales.lineasBloqueadas[0]?.linea.nombre, "Atado herbal a medida");
  assert.equal(visuales.lineasBloqueadas[0]?.linea.formato, "ramillete artesanal");
  assert.match(
    visuales.lineasBloqueadas[0]?.estado?.descripcion ?? "",
    /no se puede convertir en una línea pagable/,
  );
});

test("checkout real construye la vista múltiple desde el adaptador compartido de líneas ricas", () => {
  const itemsPreseleccionados = [
    {
      id_linea: "rit-010",
      tipo_linea: "catalogo" as const,
      slug: "pack-bosque-dorado",
      id_producto: null,
      nombre: "Pack Bosque Dorado",
      cantidad: 2,
      formato: null,
      imagen_url: null,
      referencia_economica: { etiqueta: "Referencia editorial disponible", valor: 34 },
      notas_origen: null,
    },
  ];
  const resultado = construirResultadoLineasPedidoReal(itemsPreseleccionados, "", "1");
  const visuales = construirLineasVisualesCheckoutReal(itemsPreseleccionados, resultado);

  assert.equal(visuales.lineasBloqueadas.length, 0);
  assert.equal(visuales.lineasConvertibles.length, 1);
  assert.equal(visuales.lineasConvertibles[0]?.linea.cantidad, 2);
  assert.ok(Boolean(visuales.lineasConvertibles[0]?.linea.id_producto));
  assert.equal(visuales.lineasConvertibles[0]?.linea.slug, "pack-bosque-dorado");
});

test("checkout real resume el pedido real convertible cuando toda la selección múltiple entra en pedido", () => {
  const itemsPreseleccionados = [
    {
      id_linea: "rit-020",
      tipo_linea: "catalogo" as const,
      slug: "vela-intencion-clara",
      id_producto: null,
      nombre: "Vela Intención Clara",
      cantidad: 1,
      formato: null,
      imagen_url: null,
      referencia_economica: { etiqueta: "Referencia editorial disponible", valor: 9.9 },
      notas_origen: null,
    },
    {
      id_linea: "rit-021",
      tipo_linea: "catalogo" as const,
      slug: "pack-bosque-dorado",
      id_producto: null,
      nombre: "Pack Bosque Dorado",
      cantidad: 1,
      formato: null,
      imagen_url: null,
      referencia_economica: { etiqueta: "Referencia editorial disponible", valor: 34 },
      notas_origen: null,
    },
  ];
  const resultado = construirResultadoLineasPedidoReal(itemsPreseleccionados, "", "1");
  const visuales = construirLineasVisualesCheckoutReal(itemsPreseleccionados, resultado);
  const resumenPedidoReal = resolverResumenEconomicoSeleccion(
    visuales.lineasConvertibles.map(({ linea }) => linea),
    "pedido_real",
  );

  assert.equal(resultado.lineasNoConvertibles.length, 0);
  assert.equal(resumenPedidoReal.etiqueta, "Total orientativo del pedido real");
  assert.equal(resumenPedidoReal.totalVisible, "50,00 €");
  assert.match(resumenPedidoReal.detalle, /solo con las líneas convertibles/);
});

test("regresión: una línea bloqueada sin referencia no contamina el resumen principal del pedido real", () => {
  const itemsPreseleccionados = [
    {
      id_linea: "rit-030",
      tipo_linea: "catalogo" as const,
      slug: "vela-intencion-clara",
      id_producto: null,
      nombre: "Vela Intención Clara",
      cantidad: 2,
      formato: null,
      imagen_url: null,
      referencia_economica: { etiqueta: "Referencia editorial disponible", valor: 9.9 },
      notas_origen: null,
    },
    {
      id_linea: "libre-030",
      tipo_linea: "fuera_catalogo" as const,
      slug: null,
      id_producto: null,
      nombre: "Atado herbal a medida",
      cantidad: 1,
      formato: "ramillete artesanal",
      imagen_url: null,
      referencia_economica: { etiqueta: "Sin referencia económica", valor: null },
      notas_origen: "Petición manual.",
    },
  ];
  const resultado = construirResultadoLineasPedidoReal(itemsPreseleccionados, "", "1");
  const visuales = construirLineasVisualesCheckoutReal(itemsPreseleccionados, resultado);
  const resumenPedidoReal = resolverResumenEconomicoSeleccion(
    visuales.lineasConvertibles.map(({ linea }) => linea),
    "pedido_real",
  );
  const resumenBloqueado = resolverResumenEconomicoSeleccion(
    visuales.lineasBloqueadas.map(({ linea }) => linea),
    "fuera_pedido_real",
  );

  assert.equal(resultado.lineasConvertibles.length, 1);
  assert.equal(resultado.lineasNoConvertibles.length, 1);
  assert.equal(resumenPedidoReal.totalVisible, "32,00 €");
  assert.equal(
    resumenBloqueado.etiqueta,
    "Fuera del pedido real sin referencia económica",
  );
  assert.equal(resumenBloqueado.totalVisible, null);
});

test("checkout real puede separar resumen principal y contexto visible sin degradar el modo producto único", () => {
  const lineasSeleccion = resolverLineasSeleccionEncargo([
    {
      id_linea: "rit-040",
      tipo_linea: "catalogo",
      slug: "vela-intencion-clara",
      id_producto: null,
      nombre: "Vela Intención Clara",
      cantidad: 2,
      formato: null,
      imagen_url: null,
      referencia_economica: { etiqueta: "Referencia editorial disponible", valor: 9.9 },
      notas_origen: null,
      actualizadoEn: "2026-03-21T00:00:00.000Z",
    },
    {
      id_linea: "rit-041",
      tipo_linea: "catalogo",
      slug: "pack-bosque-dorado",
      id_producto: null,
      nombre: "Pack Bosque Dorado",
      cantidad: 1,
      formato: null,
      imagen_url: null,
      referencia_economica: { etiqueta: "Referencia editorial disponible", valor: 34 },
      notas_origen: null,
      actualizadoEn: "2026-03-21T00:00:00.000Z",
    },
  ]);
  const resumenPedidoReal = resolverResumenEconomicoSeleccion(
    lineasSeleccion,
    "pedido_real",
  );
  const erroresModoUnico = validarCheckoutReal(
    construirDatosBaseCheckoutReal(),
    construirResultadoLineasPedidoReal([], "", "1"),
    resolverModoCheckoutReal([]),
  );

  assert.equal(resumenPedidoReal.totalVisible, "66,00 €");
  assert.equal(erroresModoUnico.producto_slug, "Campo obligatorio.");
});

test("checkout real mantiene el modo único con producto_slug obligatorio", () => {
  const errores = validarCheckoutReal(
    construirDatosBaseCheckoutReal(),
    construirResultadoLineasPedidoReal([], "", "1"),
    resolverModoCheckoutReal([]),
  );

  assert.equal(errores.producto_slug, "Campo obligatorio.");
});

test("cliente API de pedidos reales usa la ruta nueva /api/v1/pedidos/", async () => {
  const llamadas: string[] = [];
  globalThis.fetch = (async (url: string) => {
    llamadas.push(url);
    return {
      ok: true,
      json: async () => ({ pedido: { id_pedido: "PED-1", estado: "pendiente_pago", estado_pago: "pendiente", canal_checkout: "web_invitado", moneda: "EUR", subtotal: "9.90", requiere_revision_manual: false, email_post_pago_enviado: false, cliente: { email_contacto: "real@test.dev", nombre_contacto: "Lore", telefono_contacto: "600", es_invitado: true }, direccion_entrega: { nombre_destinatario: "Lore", linea_1: "Calle", linea_2: "", codigo_postal: "28001", ciudad: "Madrid", provincia: "Madrid", pais_iso: "ES", observaciones: "" }, resumen: { cantidad_total_items: 1, subtotal: "9.90" }, lineas: [], notas_cliente: "", pago: {}, expedicion: { transportista: "", codigo_seguimiento: "", envio_sin_seguimiento: false, fecha_preparacion: null, fecha_envio: null, fecha_entrega: null, observaciones_operativas: "", email_envio_enviado: false } } }),
    } as Response;
  }) as typeof fetch;

  const resultado = await crearPedidoPublico({
    email_contacto: "real@test.dev",
    nombre_contacto: "Lore",
    telefono_contacto: "600",
    canal_checkout: "web_invitado",
    direccion_entrega: { nombre_destinatario: "Lore", linea_1: "Calle", codigo_postal: "28001", ciudad: "Madrid", provincia: "Madrid", pais_iso: "ES" },
    lineas: [{ id_producto: "p1", slug_producto: "vela", nombre_producto: "Vela", cantidad: 1, precio_unitario: "9.90", moneda: "EUR" }],
    moneda: "EUR",
  });

  assert.equal(resultado.estado, "ok");
  assert.equal(llamadas[0].endsWith("/api/pedidos"), true);
});

test("frontend real consume la nueva API de pago", async () => {
  const llamadas: string[] = [];
  globalThis.fetch = (async (url: string) => {
    llamadas.push(url);
    return {
      ok: true,
      json: async () => ({ pago: { id_pedido: "PED-1", proveedor_pago: "stripe", id_externo_pago: "cs_test_123", estado_pago: "requiere_accion", moneda: "EUR", importe: "9.90", url_pago: "https://checkout.stripe.test/cs_test_123" } }),
    } as Response;
  }) as typeof fetch;

  const resultado = await iniciarPagoPedido("PED-1");

  assert.equal(resultado.estado, "ok");
  if (resultado.estado === "ok") {
    assert.equal(resultado.pago.proveedor_pago, "stripe");
  }
  assert.equal(llamadas[0].endsWith("/api/pedidos/PED-1/iniciar-pago"), true);
});

test("frontend construye retornos success y cancel para la pantalla de pedido", () => {
  assert.equal(construirUrlRetornoPedido("PED-1", "success", "cs_123"), "/pedido/PED-1?retorno_pago=success&session_id=cs_123");
  assert.equal(construirUrlRetornoPedido("PED-1", "cancel"), "/pedido/PED-1?retorno_pago=cancel");
});


test("regresión: checkout real bloqueado ofrece salida artesanal preservando selección mixta", () => {
  const itemsPreseleccionados = [
    {
      id_linea: "rit-050",
      tipo_linea: "catalogo" as const,
      slug: "vela-intencion-clara",
      id_producto: null,
      nombre: "Vela Intención Clara",
      cantidad: 1,
      formato: null,
      imagen_url: null,
      referencia_economica: { etiqueta: "Referencia editorial disponible", valor: 9.9 },
      notas_origen: null,
    },
    {
      id_linea: "libre-050",
      tipo_linea: "fuera_catalogo" as const,
      slug: null,
      id_producto: null,
      nombre: "Mezcla fuera de catálogo",
      cantidad: 1,
      formato: "preparación artesanal",
      imagen_url: null,
      referencia_economica: { etiqueta: "Sin referencia económica", valor: null },
      notas_origen: "Hay que revisarla manualmente.",
    },
  ];

  const resultado = construirResultadoLineasPedidoReal(itemsPreseleccionados, "", "1");
  const rutaConsulta = construirRutaConsultaManualCheckoutReal(itemsPreseleccionados);

  assert.equal(resultado.lineasConvertibles.length, 1);
  assert.equal(resultado.lineasNoConvertibles.length, 1);
  assert.match(rutaConsulta, /^\/encargo\?/);
  assert.match(rutaConsulta, /origen=seleccion/);
  assert.match(rutaConsulta, /cesta=/);
  const cestaSerializada = new URL(`https://botica.test${rutaConsulta}`).searchParams.get("cesta");

  assert.ok(cestaSerializada);
  assert.match(decodeURIComponent(cestaSerializada), /vela-intencion-clara/);
  assert.match(decodeURIComponent(cestaSerializada), /Mezcla fuera de catálogo/);
});

test("regresión: selección totalmente convertible mantiene el CTA real como salida principal", () => {
  const itemsPreseleccionados = [
    {
      id_linea: "rit-060",
      tipo_linea: "catalogo" as const,
      slug: "vela-intencion-clara",
      id_producto: null,
      nombre: "Vela Intención Clara",
      cantidad: 1,
      formato: null,
      imagen_url: null,
      referencia_economica: { etiqueta: "Referencia editorial disponible", valor: 9.9 },
      notas_origen: null,
    },
    {
      id_linea: "rit-061",
      tipo_linea: "catalogo" as const,
      slug: "pack-bosque-dorado",
      id_producto: null,
      nombre: "Pack Bosque Dorado",
      cantidad: 1,
      formato: null,
      imagen_url: null,
      referencia_economica: { etiqueta: "Referencia editorial disponible", valor: 34 },
      notas_origen: null,
    },
  ];

  const resultado = construirResultadoLineasPedidoReal(itemsPreseleccionados, "", "1");
  const errores = validarCheckoutReal(
    {
      ...construirDatosBaseCheckoutReal(),
      producto_slug: "",
    },
    resultado,
    resolverModoCheckoutReal(itemsPreseleccionados),
  );

  assert.equal(resultado.lineasNoConvertibles.length, 0);
  assert.equal(errores.lineas, undefined);
});

test("volver a Mi selección desde checkout real usa la ruta visible de la selección", () => {
  assert.equal(construirRutaRevisionSeleccionCheckoutReal([]), "/cesta");
});
