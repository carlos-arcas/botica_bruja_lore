"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("node:assert/strict");
const node_test_1 = require("node:test");
const checkoutDemo_1 = require("../contenido/catalogo/checkoutDemo");
const postCheckoutDemo_1 = require("../contenido/catalogo/postCheckoutDemo");
const estadoCheckoutDemo_1 = require("../contenido/catalogo/estadoCheckoutDemo");
const pedidosDemo_1 = require("../infraestructura/api/pedidosDemo");
function crearItemSeleccionado(slug, cantidad) {
    return {
        id_linea: `linea-${slug}`,
        tipo_linea: "catalogo",
        slug,
        id_producto: null,
        nombre: slug,
        cantidad,
        formato: null,
        imagen_url: null,
        referencia_economica: {
            etiqueta: "Referencia editorial disponible",
            valor: null,
        },
        notas_origen: null,
    };
}
(0, node_test_1.test)("construirLineasPedidoDemo usa selección múltiple de cesta cuando existe", () => {
    const lineas = (0, checkoutDemo_1.construirLineasPedidoDemo)([crearItemSeleccionado("infusion-bruma-lavanda", 2)], "vela-intencion-clara", "1 unidad");
    assert.equal(lineas.length, 1);
    assert.equal(lineas[0]?.slug_producto, "infusion-bruma-lavanda");
    assert.equal(lineas[0]?.cantidad, 2);
    assert.equal(lineas[0]?.precio_unitario_demo, "14.90");
});
(0, node_test_1.test)("construirLineasPedidoDemo cae a producto individual y normaliza cantidad", () => {
    const lineas = (0, checkoutDemo_1.construirLineasPedidoDemo)([], "vela-intencion-clara", "3 unidades");
    assert.equal(lineas.length, 1);
    assert.equal(lineas[0]?.slug_producto, "vela-intencion-clara");
    assert.equal(lineas[0]?.cantidad, 3);
});
(0, node_test_1.test)("checkout demo bloquea selección mixta cuando una línea visible queda fuera del contrato final", () => {
    const resultado = (0, checkoutDemo_1.construirResultadoLineasPedidoDemo)([
        crearItemSeleccionado("infusion-bruma-lavanda", 1),
        {
            id_linea: "libre-001",
            tipo_linea: "fuera_catalogo",
            slug: null,
            id_producto: null,
            nombre: "Atado herbal a medida",
            cantidad: 1,
            formato: "ramillete artesanal",
            imagen_url: null,
            referencia_economica: {
                etiqueta: "Sin referencia económica",
                valor: null,
            },
            notas_origen: "Petición manual.",
        },
    ], "vela-intencion-clara", "1 unidad");
    assert.equal(resultado.lineasConvertibles.length, 1);
    assert.equal(resultado.lineasNoConvertibles.length, 1);
    assert.match((0, checkoutDemo_1.validarCheckoutDemo)("invitado", null, resultado).lineas ?? "", /No podemos enviar este pedido demo/);
});
(0, node_test_1.test)("checkout demo no fabrica pedidos vacíos cuando toda la selección es no catalogable", () => {
    const resultado = (0, checkoutDemo_1.construirResultadoLineasPedidoDemo)([
        {
            id_linea: "libre-001",
            tipo_linea: "fuera_catalogo",
            slug: null,
            id_producto: null,
            nombre: "Atado herbal a medida",
            cantidad: 2,
            formato: "ramillete artesanal",
            imagen_url: null,
            referencia_economica: {
                etiqueta: "Sin referencia económica",
                valor: null,
            },
            notas_origen: "Petición manual.",
        },
    ], "", "2 unidades");
    assert.equal(resultado.lineasConvertibles.length, 0);
    assert.equal(resultado.lineasNoConvertibles.length, 1);
    assert.match((0, checkoutDemo_1.validarCheckoutDemo)("invitado", null, resultado).lineas ?? "", /Atado herbal a medida/);
});
(0, node_test_1.test)("validarCheckoutDemo exige id_usuario para canal autenticado", () => {
    const errores = (0, checkoutDemo_1.validarCheckoutDemo)("autenticado", null, []);
    assert.ok(errores.idUsuario);
    assert.ok(errores.lineas);
});
(0, node_test_1.test)("construirPayloadPedidoDemo añade id_usuario en autenticado con sesión demo activa", () => {
    const payload = (0, checkoutDemo_1.construirPayloadPedidoDemo)("demo@botica.test", "autenticado", [
        {
            id_producto: "rit-001",
            slug_producto: "infusion-bruma-lavanda",
            nombre_producto: "Bruma de Lavanda Serena",
            cantidad: 1,
            precio_unitario_demo: "14.90",
        },
    ], {
        id_usuario: "usr-100",
        email: "demo@botica.test",
        nombre_visible: "Lore",
    });
    assert.equal(payload.id_usuario, "usr-100");
});
(0, node_test_1.test)("construirPayloadPedidoDemo no envía id_usuario en invitado aunque exista sesión", () => {
    const payload = (0, checkoutDemo_1.construirPayloadPedidoDemo)("demo@botica.test", "invitado", [], {
        id_usuario: "usr-100",
        email: "demo@botica.test",
        nombre_visible: "Lore",
    });
    assert.equal("id_usuario" in payload, false);
});
(0, node_test_1.test)("resolverEstadoIdentificacionCheckoutDemo detecta sesión demo activa y hace prefill de email", () => {
    const estado = (0, checkoutDemo_1.resolverEstadoIdentificacionCheckoutDemo)({
        id_usuario: "usr-100",
        email: "demo@botica.test",
        nombre_visible: "Lore",
    }, false);
    assert.equal(estado.canalActivo, "autenticado");
    assert.equal(estado.emailPrefill, "demo@botica.test");
    assert.equal(estado.cuentaActiva?.nombre_visible, "Lore");
});
(0, node_test_1.test)("resolverEstadoIdentificacionCheckoutDemo preserva camino invitado sin sesión", () => {
    const estado = (0, checkoutDemo_1.resolverEstadoIdentificacionCheckoutDemo)(null, true);
    assert.equal(estado.canalActivo, "invitado");
    assert.equal(estado.emailPrefill, "");
});
(0, node_test_1.test)("resolverCantidadCheckout aplica fallback seguro", () => {
    assert.equal((0, checkoutDemo_1.resolverCantidadCheckout)("sin número"), 1);
});
(0, node_test_1.test)("construirRutaReciboPedidoDemo genera ruta estable por URL", () => {
    assert.equal((0, postCheckoutDemo_1.construirRutaReciboPedidoDemo)("PD-123"), "/pedido-demo/PD-123");
});
(0, node_test_1.test)("resolverIdPedidoDesdeRuta retorna null en vacío", () => {
    assert.equal((0, postCheckoutDemo_1.resolverIdPedidoDesdeRuta)("   "), null);
});
(0, node_test_1.test)("guardar y leer borrador de checkout demo preserva intención y resetea consentimiento", () => {
    const originalWindow = global.window;
    const storage = new Map();
    global.window = {
        localStorage: {
            getItem: (key) => storage.get(key) ?? null,
            setItem: (key, value) => void storage.set(key, value),
            removeItem: (key) => void storage.delete(key),
        },
    };
    (0, estadoCheckoutDemo_1.guardarBorradorCheckoutDemo)({
        nombre: "Lore",
        email: "demo@botica.test",
        telefono: "600123123",
        productoSlug: "vela-intencion-clara",
        cantidad: "2 unidades",
        mensaje: "Quiero conservar esta intención para volver al checkout.",
        consentimiento: true,
    }, true);
    const borrador = (0, estadoCheckoutDemo_1.leerBorradorCheckoutDemo)();
    assert.equal(borrador?.datos.productoSlug, "vela-intencion-clara");
    assert.equal(borrador?.datos.consentimiento, false);
    assert.equal(borrador?.continuarComoInvitado, true);
    global.window = originalWindow;
});
(0, node_test_1.test)("limpiarBorradorCheckoutDemo elimina residuos tras pedido exitoso", () => {
    const originalWindow = global.window;
    const storage = new Map();
    global.window = {
        localStorage: {
            getItem: (key) => storage.get(key) ?? null,
            setItem: (key, value) => void storage.set(key, value),
            removeItem: (key) => void storage.delete(key),
        },
    };
    (0, estadoCheckoutDemo_1.guardarBorradorCheckoutDemo)({
        nombre: "Lore",
        email: "demo@botica.test",
        telefono: "600123123",
        productoSlug: "vela-intencion-clara",
        cantidad: "2 unidades",
        mensaje: "Seguimos con el checkout demo sin perder el formulario.",
        consentimiento: false,
    }, false);
    (0, estadoCheckoutDemo_1.limpiarBorradorCheckoutDemo)();
    assert.equal((0, estadoCheckoutDemo_1.leerBorradorCheckoutDemo)(), null);
    global.window = originalWindow;
});
(0, node_test_1.test)("construirRutaCuentaDemoConRetornoSeguro solo permite retorno interno", () => {
    assert.equal((0, estadoCheckoutDemo_1.construirRutaCuentaDemoConRetornoSeguro)("/encargo"), "/cuenta-demo?returnTo=%2Fencargo");
    assert.equal((0, estadoCheckoutDemo_1.construirRutaCuentaDemoConRetornoSeguro)("https://evil.test"), "/cuenta-demo?returnTo=%2Fcuenta-demo");
});
(0, node_test_1.test)("crearPedidoDemoPublico devuelve éxito con respuesta API", async () => {
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
        };
    });
    const resultado = await (0, pedidosDemo_1.crearPedidoDemoPublico)({
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
(0, node_test_1.test)("crearPedidoDemoPublico devuelve error cuando API responde validación", async () => {
    const originalFetch = global.fetch;
    global.fetch = (async () => {
        return {
            ok: false,
            json: async () => ({ detalle: "El campo 'lineas' es obligatorio." }),
        };
    });
    const resultado = await (0, pedidosDemo_1.crearPedidoDemoPublico)({
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
(0, node_test_1.test)("obtenerPedidoDemoPublico devuelve éxito para detalle existente", async () => {
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
        };
    });
    const resultado = await (0, pedidosDemo_1.obtenerPedidoDemoPublico)("PD-200");
    assert.equal(resultado.estado, "ok");
    global.fetch = originalFetch;
});
(0, node_test_1.test)("obtenerPedidoDemoPublico gestiona pedido inexistente", async () => {
    const originalFetch = global.fetch;
    global.fetch = (async () => {
        return {
            ok: false,
            status: 404,
            json: async () => ({ detalle: "Pedido demo no encontrado" }),
        };
    });
    const resultado = await (0, pedidosDemo_1.obtenerPedidoDemoPublico)("PD-nope");
    assert.equal(resultado.estado, "error");
    global.fetch = originalFetch;
});
(0, node_test_1.test)("obtenerEmailDemoPedidoPublico devuelve simulación de email", async () => {
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
                    lineas: [
                        { nombre_producto: "Bruma", cantidad: 1, subtotal_demo: "14.90" },
                    ],
                    es_simulacion: true,
                },
            }),
        };
    });
    const resultado = await (0, pedidosDemo_1.obtenerEmailDemoPedidoPublico)("PD-300");
    assert.equal(resultado.estado, "ok");
    global.fetch = originalFetch;
});
(0, node_test_1.test)("flujo post-checkout consume contratos mínimos de pedido y email demo", async () => {
    const originalFetch = global.fetch;
    const endpoints = [];
    global.fetch = (async (input) => {
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
            };
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
            };
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
        };
    });
    const crear = await (0, pedidosDemo_1.crearPedidoDemoPublico)({
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
    const detalle = await (0, pedidosDemo_1.obtenerPedidoDemoPublico)(crear.pedido.id_pedido);
    const email = await (0, pedidosDemo_1.obtenerEmailDemoPedidoPublico)(crear.pedido.id_pedido);
    assert.equal(detalle.estado, "ok");
    assert.equal(email.estado, "ok");
    assert.deepEqual(endpoints, [
        "http://127.0.0.1:8000/api/v1/pedidos-demo/",
        "http://127.0.0.1:8000/api/v1/pedidos-demo/PD-500/",
        "http://127.0.0.1:8000/api/v1/pedidos-demo/PD-500/email-demo/",
    ]);
    global.fetch = originalFetch;
});
(0, node_test_1.test)("checkout demo cubre el recorrido integrado cesta -> payload -> recibo -> email demo", async () => {
    const originalFetch = global.fetch;
    const endpoints = [];
    global.fetch = (async (input) => {
        const url = typeof input === "string" ? input : input.toString();
        endpoints.push(url);
        if (url.endsWith("/api/v1/pedidos-demo/")) {
            return {
                ok: true,
                json: async () => ({
                    pedido: {
                        id_pedido: "PD-610",
                        estado: "creado",
                        canal: "invitado",
                        email: "demo@botica.test",
                        resumen: { cantidad_total_items: 3, subtotal_demo: "33.70" },
                    },
                }),
            };
        }
        if (url.endsWith("/api/v1/pedidos-demo/PD-610/")) {
            return {
                ok: true,
                json: async () => ({
                    pedido: {
                        id_pedido: "PD-610",
                        estado: "creado",
                        canal: "invitado",
                        email: "demo@botica.test",
                        resumen: { cantidad_total_items: 3, subtotal_demo: "33.70" },
                        lineas: [
                            {
                                id_producto: "rit-001",
                                slug_producto: "infusion-bruma-lavanda",
                                nombre_producto: "Bruma de Lavanda Serena",
                                cantidad: 2,
                                precio_unitario_demo: "14.90",
                                subtotal_demo: "29.80",
                            },
                            {
                                id_producto: "rit-002",
                                slug_producto: "vela-intencion-clara",
                                nombre_producto: "Vela de Intención Clara",
                                cantidad: 1,
                                precio_unitario_demo: "3.90",
                                subtotal_demo: "3.90",
                            },
                        ],
                    },
                }),
            };
        }
        return {
            ok: true,
            json: async () => ({
                email_demo: {
                    id_pedido: "PD-610",
                    estado: "creado",
                    canal: "invitado",
                    email_destino: "demo@botica.test",
                    asunto: "[DEMO] Confirmación de pedido PD-610",
                    cuerpo_texto: "Aviso: entorno demo sin envío real de correo",
                    subtotal_demo: "33.70",
                    lineas: [
                        {
                            nombre_producto: "Bruma de Lavanda Serena",
                            cantidad: 2,
                            subtotal_demo: "29.80",
                        },
                        {
                            nombre_producto: "Vela de Intención Clara",
                            cantidad: 1,
                            subtotal_demo: "3.90",
                        },
                    ],
                    es_simulacion: true,
                },
            }),
        };
    });
    const estado = (0, checkoutDemo_1.resolverEstadoIdentificacionCheckoutDemo)(null, true);
    const resultadoLineas = (0, checkoutDemo_1.construirResultadoLineasPedidoDemo)([
        crearItemSeleccionado("infusion-bruma-lavanda", 2),
        crearItemSeleccionado("vela-intencion-clara", 1),
    ], "", "1 unidad");
    assert.deepEqual((0, checkoutDemo_1.validarCheckoutDemo)(estado.canalActivo, estado.cuentaActiva, resultadoLineas), {});
    const payload = (0, checkoutDemo_1.construirPayloadPedidoDemo)("demo@botica.test", estado.canalActivo, resultadoLineas.lineasConvertibles, estado.cuentaActiva);
    assert.equal(payload.canal, "invitado");
    assert.equal(payload.lineas.length, 2);
    assert.equal(payload.lineas[0]?.slug_producto, "infusion-bruma-lavanda");
    assert.equal(payload.lineas[1]?.slug_producto, "vela-intencion-clara");
    const crear = await (0, pedidosDemo_1.crearPedidoDemoPublico)(payload);
    assert.equal(crear.estado, "ok");
    if (crear.estado !== "ok") {
        throw new Error("El pedido demo debía crearse para validar el recorrido integrado.");
    }
    const rutaRecibo = (0, postCheckoutDemo_1.construirRutaReciboPedidoDemo)(crear.pedido.id_pedido);
    const idPedido = (0, postCheckoutDemo_1.resolverIdPedidoDesdeRuta)(rutaRecibo.replace("/pedido-demo/", ""));
    assert.equal(rutaRecibo, "/pedido-demo/PD-610");
    assert.equal(idPedido, "PD-610");
    const detalle = await (0, pedidosDemo_1.obtenerPedidoDemoPublico)(idPedido ?? "");
    const email = await (0, pedidosDemo_1.obtenerEmailDemoPedidoPublico)(idPedido ?? "");
    assert.equal(detalle.estado, "ok");
    assert.equal(email.estado, "ok");
    if (detalle.estado !== "ok" || email.estado !== "ok") {
        throw new Error("El recibo y el email demo deben quedar disponibles tras crear el pedido.");
    }
    assert.equal(detalle.pedido.resumen.cantidad_total_items, 3);
    assert.equal(detalle.pedido.lineas?.length, 2);
    assert.equal(email.emailDemo.subtotal_demo, detalle.pedido.resumen.subtotal_demo);
    assert.equal(email.emailDemo.email_destino, detalle.pedido.email);
    assert.deepEqual(endpoints, [
        "http://127.0.0.1:8000/api/v1/pedidos-demo/",
        "http://127.0.0.1:8000/api/v1/pedidos-demo/PD-610/",
        "http://127.0.0.1:8000/api/v1/pedidos-demo/PD-610/email-demo/",
    ]);
    global.fetch = originalFetch;
});
