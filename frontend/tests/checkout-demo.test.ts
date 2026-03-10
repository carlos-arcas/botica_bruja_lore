import * as assert from "node:assert/strict";
import { test } from "node:test";

import {
  construirLineasPedidoDemo,
  construirPayloadPedidoDemo,
  resolverCantidadCheckout,
  validarCheckoutDemo,
} from "../contenido/catalogo/checkoutDemo";
import { construirRutaReciboPedidoDemo, resolverIdPedidoDesdeRuta } from "../contenido/catalogo/postCheckoutDemo";
import { crearPedidoDemoPublico, obtenerEmailDemoPedidoPublico, obtenerPedidoDemoPublico } from "../infraestructura/api/pedidosDemo";

test("construirLineasPedidoDemo usa selección múltiple de cesta cuando existe", () => {
  const lineas = construirLineasPedidoDemo(
    [{ slug: "infusion-bruma-lavanda", cantidad: 2 }],
    "vela-intencion-clara",
    "1 unidad",
  );

  assert.equal(lineas.length, 1);
  assert.equal(lineas[0]?.slug_producto, "infusion-bruma-lavanda");
  assert.equal(lineas[0]?.cantidad, 2);
  assert.equal(lineas[0]?.precio_unitario_demo, "14.90");
});

test("construirLineasPedidoDemo cae a producto individual y normaliza cantidad", () => {
  const lineas = construirLineasPedidoDemo([], "vela-intencion-clara", "3 unidades");

  assert.equal(lineas.length, 1);
  assert.equal(lineas[0]?.slug_producto, "vela-intencion-clara");
  assert.equal(lineas[0]?.cantidad, 3);
});

test("validarCheckoutDemo exige id_usuario para canal autenticado", () => {
  const errores = validarCheckoutDemo("autenticado", "", []);

  assert.ok(errores.idUsuario);
  assert.ok(errores.lineas);
});

test("construirPayloadPedidoDemo añade id_usuario en autenticado", () => {
  const payload = construirPayloadPedidoDemo(
    "demo@botica.test",
    "autenticado",
    [
      {
        id_producto: "rit-001",
        slug_producto: "infusion-bruma-lavanda",
        nombre_producto: "Bruma de Lavanda Serena",
        cantidad: 1,
        precio_unitario_demo: "14.90",
      },
    ],
    "usr-100",
  );

  assert.equal(payload.id_usuario, "usr-100");
});

test("resolverCantidadCheckout aplica fallback seguro", () => {
  assert.equal(resolverCantidadCheckout("sin número"), 1);
});

test("construirRutaReciboPedidoDemo genera ruta estable por URL", () => {
  assert.equal(construirRutaReciboPedidoDemo("PD-123"), "/pedido-demo/PD-123");
});

test("resolverIdPedidoDesdeRuta retorna null en vacío", () => {
  assert.equal(resolverIdPedidoDesdeRuta("   "), null);
});

test("crearPedidoDemoPublico devuelve éxito con respuesta API", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => {
    return {
      ok: true,
      json: async () => ({
        pedido: {
          id_pedido: "PD-123",
          estado: "creado",
          canal: "invitado",
          email: "demo@botica.test",
          resumen: { cantidad_total_items: 2, subtotal_demo: "29.80" },
        },
      }),
    } as Response;
  }) as typeof fetch;

  const resultado = await crearPedidoDemoPublico({
    email: "demo@botica.test",
    canal: "invitado",
    lineas: [
      {
        id_producto: "rit-001",
        slug_producto: "infusion-bruma-lavanda",
        nombre_producto: "Bruma de Lavanda Serena",
        cantidad: 2,
        precio_unitario_demo: "14.90",
      },
    ],
  });

  assert.equal(resultado.estado, "ok");

  global.fetch = originalFetch;
});

test("crearPedidoDemoPublico devuelve error cuando API responde validación", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => {
    return {
      ok: false,
      json: async () => ({ detalle: "El campo 'lineas' es obligatorio." }),
    } as Response;
  }) as typeof fetch;

  const resultado = await crearPedidoDemoPublico({
    email: "demo@botica.test",
    canal: "invitado",
    lineas: [],
  });

  assert.equal(resultado.estado, "error");
  if (resultado.estado === "error") {
    assert.match(resultado.mensaje, /lineas/i);
  }

  global.fetch = originalFetch;
});

test("obtenerPedidoDemoPublico devuelve éxito para detalle existente", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => {
    return {
      ok: true,
      json: async () => ({
        pedido: {
          id_pedido: "PD-200",
          estado: "creado",
          canal: "invitado",
          email: "demo@botica.test",
          resumen: { cantidad_total_items: 1, subtotal_demo: "14.90" },
          lineas: [
            {
              id_producto: "rit-001",
              slug_producto: "infusion-bruma-lavanda",
              nombre_producto: "Bruma de Lavanda Serena",
              cantidad: 1,
              precio_unitario_demo: "14.90",
              subtotal_demo: "14.90",
            },
          ],
        },
      }),
    } as Response;
  }) as typeof fetch;

  const resultado = await obtenerPedidoDemoPublico("PD-200");
  assert.equal(resultado.estado, "ok");

  global.fetch = originalFetch;
});

test("obtenerPedidoDemoPublico gestiona pedido inexistente", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => {
    return {
      ok: false,
      status: 404,
      json: async () => ({ detalle: "Pedido demo no encontrado" }),
    } as Response;
  }) as typeof fetch;

  const resultado = await obtenerPedidoDemoPublico("PD-nope");
  assert.equal(resultado.estado, "error");

  global.fetch = originalFetch;
});


test("obtenerEmailDemoPedidoPublico devuelve simulación de email", async () => {
  const originalFetch = global.fetch;
  global.fetch = (async () => {
    return {
      ok: true,
      json: async () => ({
        email_demo: {
          id_pedido: "PD-300",
          estado: "creado",
          canal: "invitado",
          email_destino: "demo@botica.test",
          asunto: "[DEMO] Confirmación de pedido PD-300",
          cuerpo_texto: "Aviso: entorno demo sin envío real de correo",
          subtotal_demo: "14.90",
          lineas: [{ nombre_producto: "Bruma", cantidad: 1, subtotal_demo: "14.90" }],
          es_simulacion: true,
        },
      }),
    } as Response;
  }) as typeof fetch;

  const resultado = await obtenerEmailDemoPedidoPublico("PD-300");
  assert.equal(resultado.estado, "ok");

  global.fetch = originalFetch;
});



test("flujo post-checkout consume contratos mínimos de pedido y email demo", async () => {
  const originalFetch = global.fetch;
  const endpoints: string[] = [];

  global.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : input.toString();
    endpoints.push(url);

    if (url.endsWith("/api/v1/pedidos-demo/")) {
      return {
        ok: true,
        json: async () => ({
          pedido: {
            id_pedido: "PD-500",
            estado: "creado",
            canal: "invitado",
            email: "demo@botica.test",
            resumen: { cantidad_total_items: 1, subtotal_demo: "14.90" },
          },
        }),
      } as Response;
    }

    if (url.endsWith("/api/v1/pedidos-demo/PD-500/")) {
      return {
        ok: true,
        json: async () => ({
          pedido: {
            id_pedido: "PD-500",
            estado: "creado",
            canal: "invitado",
            email: "demo@botica.test",
            resumen: { cantidad_total_items: 1, subtotal_demo: "14.90" },
            lineas: [],
          },
        }),
      } as Response;
    }

    return {
      ok: true,
      json: async () => ({
        email_demo: {
          id_pedido: "PD-500",
          estado: "creado",
          canal: "invitado",
          email_destino: "demo@botica.test",
          asunto: "[DEMO] Confirmación de pedido PD-500",
          cuerpo_texto: "Aviso: entorno demo sin envío real de correo",
          subtotal_demo: "14.90",
          lineas: [],
          es_simulacion: true,
        },
      }),
    } as Response;
  }) as typeof fetch;

  const crear = await crearPedidoDemoPublico({
    email: "demo@botica.test",
    canal: "invitado",
    lineas: [
      {
        id_producto: "rit-001",
        slug_producto: "infusion-bruma-lavanda",
        nombre_producto: "Bruma de Lavanda Serena",
        cantidad: 1,
        precio_unitario_demo: "14.90",
      },
    ],
  });

  assert.equal(crear.estado, "ok");
  if (crear.estado !== "ok") {
    throw new Error("El pedido demo debía crearse para validar el flujo.");
  }

  const detalle = await obtenerPedidoDemoPublico(crear.pedido.id_pedido);
  const email = await obtenerEmailDemoPedidoPublico(crear.pedido.id_pedido);

  assert.equal(detalle.estado, "ok");
  assert.equal(email.estado, "ok");
  assert.deepEqual(endpoints, [
    "http://127.0.0.1:8000/api/v1/pedidos-demo/",
    "http://127.0.0.1:8000/api/v1/pedidos-demo/PD-500/",
    "http://127.0.0.1:8000/api/v1/pedidos-demo/PD-500/email-demo/",
  ]);

  global.fetch = originalFetch;
});
