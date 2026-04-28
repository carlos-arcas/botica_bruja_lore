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
import { calcularDesgloseFiscalVisible } from "../contenido/catalogo/fiscalidadCheckout";
import {
  aplicarDireccionGuardadaADatosCheckoutReal,
  resolverDireccionPredeterminadaCheckoutReal,
} from "../contenido/catalogo/checkoutRealDirecciones";
import {
  construirRutaConsultaManualCheckoutReal,
  construirRutaRevisionSeleccionCheckoutReal,
} from "../contenido/catalogo/checkoutRealNavegacion";
import { resolverEsPagoSimuladoLocal } from "../contenido/pedidos/pagoSimuladoLocal";
import {
  traducirLineaStock,
  traducirMensajeErrorPedido,
} from "../contenido/pedidos/estadosComercialesPedido";
import { construirLineasVisualesCheckoutReal } from "../componentes/catalogo/checkout-real/adaptadoresLineasCheckoutReal";
import {
  resolverLineasSeleccionEncargo,
  resolverResumenEconomicoSeleccion,
} from "../contenido/catalogo/seleccionEncargo";
import {
  construirUrlRetornoPedido,
  crearPedidoPublico,
  confirmarPagoSimuladoPedido,
  iniciarPagoPedido,
  obtenerTarifaEnvioEstandar,
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

test("checkout real calcula desglose fiscal visible con redondeo estable", () => {
  const desglose = calcularDesgloseFiscalVisible(9.995, 4.9);
  assert.equal(desglose.subtotal, 9.99);
  assert.equal(desglose.envio, 4.9);
  assert.equal(desglose.baseImponible, 14.89);
  assert.equal(desglose.impuestos, 3.13);
  assert.equal(desglose.total, 18.02);
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

test("checkout real muestra error por incremento mínimo cuando la cantidad no cuadra", () => {
  const datos = {
    ...construirDatosBaseCheckoutReal(),
    producto_slug: "infusion-bruma-lavanda",
    cantidad: "125",
  };
  const resultado = construirResultadoLineasPedidoReal([], "infusion-bruma-lavanda", "125");
  const errores = validarCheckoutReal(
    datos,
    resultado,
    "producto_unico",
    {
      id: "prod-granel",
      slug: "infusion-bruma-lavanda",
      nombre: "Infusión",
      subtitulo: "",
      descripcion: "",
      precioVisible: "€1,00",
      categoria: "mezcla-herbal",
      intencion: "calma",
      etiquetas: [],
      destacado: false,
      disponible: true,
      notasSensoriales: "",
      imagen_url: "",
      imagen_alt: "",
      unidad_comercial: "g",
      incremento_minimo_venta: 50,
      cantidad_minima_compra: 100,
      tipo_fiscal: "iva_general",
    },
  );

  assert.match(errores.cantidad ?? "", /incrementos de 50 g/i);
});

test("checkout real muestra error por cantidad mínima de compra", () => {
  const datos = {
    ...construirDatosBaseCheckoutReal(),
    producto_slug: "infusion-bruma-lavanda",
    cantidad: "50",
  };
  const resultado = construirResultadoLineasPedidoReal([], "infusion-bruma-lavanda", "50");
  const errores = validarCheckoutReal(
    datos,
    resultado,
    "producto_unico",
    {
      id: "prod-granel",
      slug: "infusion-bruma-lavanda",
      nombre: "Infusión",
      subtitulo: "",
      descripcion: "",
      precioVisible: "€1,00",
      categoria: "mezcla-herbal",
      intencion: "calma",
      etiquetas: [],
      destacado: false,
      disponible: true,
      notasSensoriales: "",
      imagen_url: "",
      imagen_alt: "",
      unidad_comercial: "g",
      incremento_minimo_venta: 50,
      cantidad_minima_compra: 100,
      tipo_fiscal: "iva_general",
    },
  );

  assert.match(errores.cantidad ?? "", /mínima.*100 g/i);
});

test("checkout real bloquea producto sin stock antes de crear pedido", () => {
  const datos = {
    ...construirDatosBaseCheckoutReal(),
    producto_slug: "cuenco-laton-ritual",
    cantidad: "1",
  };
  const resultado = construirResultadoLineasPedidoReal([], "cuenco-laton-ritual", "1");
  const errores = validarCheckoutReal(
    datos,
    resultado,
    "producto_unico",
    {
      slug: "cuenco-laton-ritual",
      nombre: "Cuenco de Laton Ritual",
      disponible: false,
      disponible_compra: false,
      mensaje_disponibilidad: "Sin stock disponible en este momento.",
    },
  );

  assert.match(errores.lineas ?? "", /Sin stock disponible/i);
});

test("checkout real bloquea cantidad superior a disponibilidad visible", () => {
  const datos = {
    ...construirDatosBaseCheckoutReal(),
    producto_slug: "infusion-bruma-lavanda",
    cantidad: "3",
  };
  const resultado = construirResultadoLineasPedidoReal([], "infusion-bruma-lavanda", "3");
  const errores = validarCheckoutReal(
    datos,
    resultado,
    "producto_unico",
    {
      slug: "infusion-bruma-lavanda",
      nombre: "Bruma",
      disponible: true,
      disponible_compra: true,
      cantidad_disponible: 1,
    },
  );

  assert.match(errores.lineas ?? "", /Solo hay 1 disponible/i);
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
    payload.lineas.map((linea) => ({ slug: linea.slug_producto, cantidad: linea.cantidad_comercial })),
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
  assert.match(errores.lineas ?? "", /No podemos preparar el pedido/);
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
    /requiere consulta personalizada/,
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
    lineas: [{ id_producto: "p1", slug_producto: "vela", nombre_producto: "Vela", cantidad_comercial: 1, unidad_comercial: "ud", precio_unitario: "9.90", moneda: "EUR" }],
    moneda: "EUR",
  });

  assert.equal(resultado.estado, "ok");
  assert.equal(llamadas[0].endsWith("/api/pedidos"), true);
});

test("checkout real conserva codigo y detalle por línea cuando la API rechaza por stock", async () => {
  globalThis.fetch = (async () =>
    ({
      ok: false,
      json: async () => ({
        detalle: "No pudimos crear el pedido porque una o más líneas no tienen stock disponible.",
        codigo: "stock_no_disponible",
        lineas: [
          {
            id_producto: "prod-1",
            slug_producto: "vela",
            nombre_producto: "Vela",
            cantidad_solicitada: 2,
            codigo: "stock_insuficiente",
            detalle: "La cantidad solicitada supera el stock disponible en este momento.",
            cantidad_disponible: 1,
          },
        ],
      }),
    }) as Response) as typeof fetch;

  const resultado = await crearPedidoPublico({
    email_contacto: "real@test.dev",
    nombre_contacto: "Lore",
    telefono_contacto: "600",
    canal_checkout: "web_invitado",
    direccion_entrega: { nombre_destinatario: "Lore", linea_1: "Calle", codigo_postal: "28001", ciudad: "Madrid", provincia: "Madrid", pais_iso: "ES" },
    lineas: [{ id_producto: "p1", slug_producto: "vela", nombre_producto: "Vela", cantidad_comercial: 1, unidad_comercial: "ud", precio_unitario: "9.90", moneda: "EUR" }],
    moneda: "EUR",
  });

  assert.equal(resultado.estado, "error");
  if (resultado.estado === "error") {
    assert.equal(resultado.codigo, "stock_no_disponible");
    assert.equal(resultado.lineas?.[0]?.codigo, "stock_insuficiente");
    assert.equal(resultado.lineas?.[0]?.cantidad_disponible, 1);
  }
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

test("frontend consulta la tarifa de envío estándar desde backend proxy", async () => {
  const llamadas: string[] = [];
  globalThis.fetch = (async (url: string) => {
    llamadas.push(url);
    return {
      ok: true,
      json: async () => ({ envio_estandar: { metodo_envio: "envio_estandar", moneda: "EUR", importe_envio: "4.90" } }),
    } as Response;
  }) as typeof fetch;

  const resultado = await obtenerTarifaEnvioEstandar();
  assert.equal(resultado.estado, "ok");
  if (resultado.estado === "ok") {
    assert.equal(resultado.envio.metodo_envio, "envio_estandar");
    assert.equal(resultado.envio.importe_envio, "4.90");
  }
  assert.equal(llamadas[0].endsWith("/api/pedidos/envio-estandar"), true);
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
  assert.equal(rutaConsulta.includes("cesta="), false);
  assert.equal(rutaConsulta.includes("data:image/svg+xml"), false);
  assert.equal(rutaConsulta.length < 80, true);
});

test("regresión: la salida manual no serializa payloads ricos ni data URI inline en la URL", () => {
  const itemsPreseleccionados = [
    {
      id_linea: "rit-070",
      tipo_linea: "catalogo" as const,
      slug: "infusion-bruma-lavanda",
      id_producto: "rit-001",
      nombre: "Bruma de Lavanda Serena",
      cantidad: 2,
      formato: "bolsa 40 g",
      imagen_url:
        "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3C/svg%3E",
      referencia_economica: { etiqueta: "Referencia editorial disponible", valor: 14.9 },
      notas_origen: "Mantener la nota editorial al desviar a encargo.",
    },
    {
      id_linea: "libre-070",
      tipo_linea: "fuera_catalogo" as const,
      slug: null,
      id_producto: null,
      nombre: "Atado herbal con sello lunar",
      cantidad: 1,
      formato: "pieza artesanal",
      imagen_url:
        "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3C/svg%3E",
      referencia_economica: { etiqueta: "Sin referencia económica", valor: null },
      notas_origen: "Línea bloqueada que debe viajar por persistencia local.",
    },
  ];

  const rutaConsulta = construirRutaConsultaManualCheckoutReal(itemsPreseleccionados);

  assert.equal(rutaConsulta, "/encargo?origen=seleccion");
  assert.equal(rutaConsulta.includes("Bruma%20de%20Lavanda"), false);
  assert.equal(rutaConsulta.includes("Atado%20herbal"), false);
  assert.equal(rutaConsulta.includes("data:image/svg+xml"), false);
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


test("checkout real autenticado prioriza id_direccion_guardada cuando la selección usa libreta", () => {
  const lineas = construirLineasPedidoReal([], "vela-intencion-clara", "1");
  const payload = construirPayloadPedidoReal(
    {
      ...construirDatosBaseCheckoutReal(),
      canal_checkout: "web_autenticado",
      id_usuario: "usr-1",
      modo_direccion: "guardada",
      id_direccion_guardada: "dir-123",
    },
    lineas,
  );

  assert.equal(payload.id_direccion_guardada, "dir-123");
  assert.equal(payload.direccion_entrega, undefined);
  assert.equal(payload.id_usuario, "usr-1");
});

test("checkout real permite fallback a dirección manual en cuenta autenticada", () => {
  const lineas = construirLineasPedidoReal([], "vela-intencion-clara", "1");
  const payload = construirPayloadPedidoReal(
    {
      ...construirDatosBaseCheckoutReal(),
      canal_checkout: "web_autenticado",
      id_usuario: "usr-1",
      modo_direccion: "manual",
      id_direccion_guardada: "",
    },
    lineas,
  );

  assert.equal(payload.id_direccion_guardada, undefined);
  assert.equal(payload.direccion_entrega?.linea_1, "Calle Luna 1");
});

test("checkout real exige seleccionar dirección guardada cuando ese modo está activo", () => {
  const errores = validarCheckoutReal(
    {
      ...construirDatosBaseCheckoutReal(),
      canal_checkout: "web_autenticado",
      id_usuario: "usr-1",
      modo_direccion: "guardada",
      id_direccion_guardada: "",
    },
    construirLineasPedidoReal([], "vela-intencion-clara", "1"),
  );

  assert.equal(errores.id_direccion_guardada, "Selecciona una dirección guardada.");
  assert.equal(errores.nombre_destinatario, undefined);
});

test("checkout real resuelve y aplica la dirección predeterminada de la libreta", () => {
  const predeterminada = resolverDireccionPredeterminadaCheckoutReal([
    { id_direccion: "dir-1", alias: "Trabajo", nombre_destinatario: "Lore", telefono_contacto: "600", linea_1: "Calle Sol 7", linea_2: "", codigo_postal: "28002", ciudad: "Madrid", provincia: "Madrid", pais_iso: "ES", predeterminada: false, fecha_creacion: "", fecha_actualizacion: "" },
    { id_direccion: "dir-2", alias: "Casa", nombre_destinatario: "Lore", telefono_contacto: "600", linea_1: "Calle Luna 13", linea_2: "", codigo_postal: "28013", ciudad: "Madrid", provincia: "Madrid", pais_iso: "ES", predeterminada: true, fecha_creacion: "", fecha_actualizacion: "" },
  ]);
  const datos = aplicarDireccionGuardadaADatosCheckoutReal(construirEstadoInicialCheckoutReal(), predeterminada);

  assert.equal(predeterminada?.id_direccion, "dir-2");
  assert.equal(datos.modo_direccion, "guardada");
  assert.equal(datos.id_direccion_guardada, "dir-2");
  assert.equal(datos.linea_1, "Calle Luna 13");
});

test("frontend real consume la API de confirmacion de pago simulado", async () => {
  const llamadas: string[] = [];
  globalThis.fetch = (async (url: string) => {
    llamadas.push(url);
    return {
      ok: true,
      json: async () => ({ resultado: "pagado", pedido: { id_pedido: "PED-1", estado: "pagado", estado_pago: "pagado", canal_checkout: "web_invitado", moneda: "EUR", subtotal: "9.90", importe_envio: "0.00", base_imponible: "9.90", tipo_impositivo: "0.21", importe_impuestos: "2.08", total: "11.98", requiere_revision_manual: true, email_post_pago_enviado: true, cliente: { email_contacto: "real@test.dev", nombre_contacto: "Lore", telefono_contacto: "600", es_invitado: true }, direccion_entrega: { nombre_destinatario: "Lore", linea_1: "Calle", linea_2: "", codigo_postal: "28001", ciudad: "Madrid", provincia: "Madrid", pais_iso: "ES", observaciones: "" }, resumen: { cantidad_total_items: 1, subtotal: "9.90", importe_envio: "0.00", base_imponible: "9.90", tipo_impositivo: "0.21", importe_impuestos: "2.08", total: "11.98" }, lineas: [], notas_cliente: "", pago: { proveedor_pago: "simulado_local", id_externo_pago: "SIM-PED-1-OP-1" }, expedicion: { transportista: "", codigo_seguimiento: "", envio_sin_seguimiento: false, fecha_preparacion: null, fecha_envio: null, fecha_entrega: null, observaciones_operativas: "", email_envio_enviado: false } } }),
    } as Response;
  }) as typeof fetch;

  const resultado = await confirmarPagoSimuladoPedido("PED-1");

  assert.equal(resultado.estado, "ok");
  if (resultado.estado === "ok") {
    assert.equal(resultado.pedido.estado_pago, "pagado");
    assert.equal(resultado.pedido.pago.proveedor_pago, "simulado_local");
  }
  assert.equal(llamadas[0].endsWith("/api/pedidos/PED-1/confirmar-pago-simulado"), true);
});

test("frontend real propaga errores de confirmacion de pago simulado", async () => {
  globalThis.fetch = (async () =>
    ({
      ok: false,
      json: async () => ({ detalle: "Solo se puede confirmar una intencion de pago simulada local." }),
    }) as Response) as typeof fetch;

  const resultado = await confirmarPagoSimuladoPedido("PED-1");

  assert.equal(resultado.estado, "error");
  if (resultado.estado === "error") {
    assert.match(resultado.mensaje, /pago de prueba/);
    assert.doesNotMatch(resultado.mensaje, /intencion de pago simulada|simulado_local/);
  }
});

test("errores comerciales traducen codigos tecnicos antes de llegar a la UI publica", () => {
  const mensajeStock = traducirMensajeErrorPedido({
    codigo: "stock_no_disponible",
    detalle: "stock_no_disponible_confirmacion_pago",
  });
  const mensajePago = traducirMensajeErrorPedido({
    detalle: "Solo se puede confirmar una intencion de pago simulada local.",
  });
  const linea = traducirLineaStock({
    codigo: "stock_insuficiente",
    nombre_producto: "Vela",
    cantidad_disponible: 1,
  });

  assert.equal(mensajeStock, "No hay stock suficiente para continuar con este pedido.");
  assert.match(mensajePago, /pago de prueba/);
  assert.match(linea, /disponibilidad actual/);
  assert.doesNotMatch(`${mensajeStock} ${mensajePago} ${linea}`, /stock_no|simulado_local|intencion de pago simulada/);
});

test("frontend real identifica pago simulado por proveedor y no por copy", () => {
  assert.equal(resolverEsPagoSimuladoLocal({ proveedor_pago: "simulado_local" }), true);
  assert.equal(resolverEsPagoSimuladoLocal({ proveedor_pago: "stripe" }), false);
  assert.equal(resolverEsPagoSimuladoLocal({}), false);
});
