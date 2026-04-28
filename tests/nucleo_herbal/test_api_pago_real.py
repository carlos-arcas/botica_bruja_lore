import hashlib
import hmac
import json
import time
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase, override_settings

from backend.nucleo_herbal.infraestructura.persistencia_django.models import ProductoModelo
from backend.nucleo_herbal.infraestructura.persistencia_django.models_inventario import InventarioProductoModelo, MovimientoInventarioModelo
from backend.nucleo_herbal.infraestructura.persistencia_django.models_pedidos import EventoWebhookPagoModelo, PedidoRealModelo


@override_settings(
    STRIPE_PUBLIC_KEY="pk_test_123",
    STRIPE_SECRET_KEY="sk_test_123",
    STRIPE_WEBHOOK_SECRET="whsec_123",
    BOTICA_PAYMENT_PROVIDER="stripe",
    PAYMENT_SUCCESS_URL="https://frontend.test/pedido/{ID_PEDIDO}?retorno_pago=success&session_id={CHECKOUT_SESSION_ID}",
    PAYMENT_CANCEL_URL="https://frontend.test/pedido/{ID_PEDIDO}?retorno_pago=cancel",
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
class TestApiPagoReal(TestCase):
    def setUp(self) -> None:
        super().setUp()
        ProductoModelo.objects.create(
            id="prod-1",
            sku="SKU-PROD-1",
            slug="tarot-bosque-interior",
            nombre="Tarot bosque interior",
            tipo_producto="tarot",
            categoria_comercial="oraculos",
        )
        InventarioProductoModelo.objects.create(producto_id="prod-1", cantidad_disponible=5)

    @patch("backend.nucleo_herbal.infraestructura.pagos_stripe.PasarelaPagoStripe._post")
    def test_inicia_pago_real_y_persiste_referencia_externa(self, post_stripe) -> None:
        post_stripe.return_value = {"id": "cs_test_123", "url": "https://checkout.stripe.test/cs_test_123"}
        id_pedido = _crear_pedido(self.client)

        response = self.client.post(f"/api/v1/pedidos/{id_pedido}/iniciar-pago/", HTTP_X_OPERATION_ID="op-pay-1")

        self.assertEqual(response.status_code, 201)
        pago = response.json()["pago"]
        self.assertEqual(pago["id_externo_pago"], "cs_test_123")
        self.assertEqual(pago["proveedor_pago"], "stripe")
        self.assertEqual(pago["importe"], "16.82")
        modelo = PedidoRealModelo.objects.get(id_pedido=id_pedido)
        self.assertEqual(modelo.id_externo_pago, "cs_test_123")
        self.assertEqual(modelo.estado_pago, "requiere_accion")

    def test_retorno_success_responde_ok(self) -> None:
        response = self.client.get("/api/v1/pedidos/retorno/PED-1/success/?session_id=cs_test_123")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["retorno"], "success")

    def test_retorno_cancel_responde_ok(self) -> None:
        response = self.client.get("/api/v1/pedidos/retorno/PED-1/cancel/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["retorno"], "cancel")

    @patch("backend.nucleo_herbal.infraestructura.pagos_stripe.PasarelaPagoStripe._post")
    def test_webhook_valido_marca_pedido_como_pagado_y_envia_email(self, post_stripe) -> None:
        post_stripe.return_value = {"id": "cs_test_123", "url": "https://checkout.stripe.test/cs_test_123"}
        id_pedido = _crear_pedido(self.client)
        self.client.post(f"/api/v1/pedidos/{id_pedido}/iniciar-pago/")
        payload = _payload_webhook(id_pedido)

        response = self.client.post(
            "/api/v1/pedidos/webhooks/stripe/",
            data=payload,
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE=_firmar(payload),
        )

        self.assertEqual(response.status_code, 200)
        modelo = PedidoRealModelo.objects.get(id_pedido=id_pedido)
        self.assertEqual(modelo.estado, "pagado")
        self.assertEqual(modelo.estado_pago, "pagado")
        self.assertTrue(modelo.email_post_pago_enviado)
        self.assertTrue(modelo.requiere_revision_manual)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn(id_pedido, mail.outbox[0].subject)

    @patch("backend.nucleo_herbal.infraestructura.pagos_stripe.PasarelaPagoStripe._post")
    def test_webhook_duplicado_no_duplica_transicion_ni_email(self, post_stripe) -> None:
        post_stripe.return_value = {"id": "cs_test_123", "url": "https://checkout.stripe.test/cs_test_123"}
        id_pedido = _crear_pedido(self.client)
        self.client.post(f"/api/v1/pedidos/{id_pedido}/iniciar-pago/")
        payload = _payload_webhook(id_pedido, id_evento="evt_dup_1")
        firma = _firmar(payload)

        primera = self.client.post("/api/v1/pedidos/webhooks/stripe/", data=payload, content_type="application/json", HTTP_STRIPE_SIGNATURE=firma)
        segunda = self.client.post("/api/v1/pedidos/webhooks/stripe/", data=payload, content_type="application/json", HTTP_STRIPE_SIGNATURE=firma)

        self.assertEqual(primera.status_code, 200)
        self.assertEqual(segunda.status_code, 200)
        self.assertEqual(segunda.json()["resultado"], "duplicado")
        self.assertEqual(EventoWebhookPagoModelo.objects.filter(id_evento="evt_dup_1").count(), 1)
        self.assertEqual(len(mail.outbox), 1)

    def test_webhook_invalido_se_rechaza(self) -> None:
        payload = _payload_webhook("PED-1")
        response = self.client.post(
            "/api/v1/pedidos/webhooks/stripe/",
            data=payload,
            content_type="application/json",
            HTTP_STRIPE_SIGNATURE="t=1,v1=firma_invalida",
        )
        self.assertEqual(response.status_code, 400)

    @patch("backend.nucleo_herbal.infraestructura.pagos_stripe.PasarelaPagoStripe._post")
    def test_iniciar_pago_pedido_de_cuenta_requiere_autenticacion(self, post_stripe) -> None:
        post_stripe.return_value = {"id": "cs_test_acl_1", "url": "https://checkout.stripe.test/cs_test_acl_1"}
        duena = _crear_usuario("duena-pago")
        id_pedido = _crear_pedido(self.client, id_usuario=str(duena.id))

        response = self.client.post(f"/api/v1/pedidos/{id_pedido}/iniciar-pago/")

        self.assertEqual(response.status_code, 401)
        self.assertIn("iniciar sesión", response.json()["detalle"].lower())

    @patch("backend.nucleo_herbal.infraestructura.pagos_stripe.PasarelaPagoStripe._post")
    def test_iniciar_pago_pedido_de_cuenta_deniega_usuario_distinto(self, post_stripe) -> None:
        post_stripe.return_value = {"id": "cs_test_acl_2", "url": "https://checkout.stripe.test/cs_test_acl_2"}
        duena = _crear_usuario("duena-pago-2")
        intruso = _crear_usuario("intruso-pago")
        id_pedido = _crear_pedido(self.client, id_usuario=str(duena.id))
        self.client.force_login(intruso)

        response = self.client.post(f"/api/v1/pedidos/{id_pedido}/iniciar-pago/")

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["codigo"], "pedido_no_permitido")


@override_settings(
    BOTICA_PAYMENT_PROVIDER="simulado_local",
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
)
class TestApiPagoSimuladoLocal(TestCase):
    def setUp(self) -> None:
        super().setUp()
        ProductoModelo.objects.create(
            id="prod-1",
            sku="SKU-PROD-1",
            slug="tarot-bosque-interior",
            nombre="Tarot bosque interior",
            tipo_producto="tarot",
            categoria_comercial="oraculos",
        )
        InventarioProductoModelo.objects.create(producto_id="prod-1", cantidad_disponible=5)

    def test_confirmar_pago_simulado_marca_pagado_y_descuenta_stock(self) -> None:
        id_pedido = _crear_pedido(self.client)
        self.client.post(f"/api/v1/pedidos/{id_pedido}/iniciar-pago/", HTTP_X_OPERATION_ID="op-sim-1")

        response = self.client.post(f"/api/v1/pedidos/{id_pedido}/confirmar-pago-simulado/", HTTP_X_OPERATION_ID="op-sim-2")

        self.assertEqual(response.status_code, 200)
        pedido = response.json()["pedido"]
        self.assertEqual(pedido["estado"], "pagado")
        self.assertEqual(pedido["estado_pago"], "pagado")
        self.assertTrue(pedido["inventario_descontado"])
        self.assertEqual(InventarioProductoModelo.objects.get(producto_id="prod-1").cantidad_disponible, 4)
        self.assertEqual(MovimientoInventarioModelo.objects.filter(tipo_movimiento="descuento_pago").count(), 1)
        self.assertEqual(len(mail.outbox), 1)

    def test_iniciar_pago_simulado_rechaza_stock_insuficiente_sin_crear_intencion(self) -> None:
        id_pedido = _crear_pedido(self.client)
        inventario = InventarioProductoModelo.objects.get(producto_id="prod-1")
        inventario.cantidad_disponible = 0
        inventario.save(update_fields=["cantidad_disponible"])

        response = self.client.post(f"/api/v1/pedidos/{id_pedido}/iniciar-pago/")

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()["codigo"], "stock_no_disponible")
        self.assertEqual(response.json()["lineas"][0]["codigo"], "stock_insuficiente")
        modelo = PedidoRealModelo.objects.get(id_pedido=id_pedido)
        self.assertFalse(modelo.id_externo_pago)
        self.assertEqual(modelo.estado_pago, "pendiente")

    def test_iniciar_pago_simulado_rechaza_unidad_incompatible(self) -> None:
        id_pedido = _crear_pedido(self.client)
        inventario = InventarioProductoModelo.objects.get(producto_id="prod-1")
        inventario.unidad_base = "g"
        inventario.save(update_fields=["unidad_base"])

        response = self.client.post(f"/api/v1/pedidos/{id_pedido}/iniciar-pago/")

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()["lineas"][0]["codigo"], "unidad_incompatible")
        self.assertFalse(PedidoRealModelo.objects.get(id_pedido=id_pedido).id_externo_pago)

    def test_confirmar_pago_simulado_revalida_stock_y_no_marca_pagado(self) -> None:
        id_pedido = _crear_pedido(self.client)
        self.client.post(f"/api/v1/pedidos/{id_pedido}/iniciar-pago/")
        inventario = InventarioProductoModelo.objects.get(producto_id="prod-1")
        inventario.cantidad_disponible = 0
        inventario.save(update_fields=["cantidad_disponible"])

        response = self.client.post(f"/api/v1/pedidos/{id_pedido}/confirmar-pago-simulado/")

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()["lineas"][0]["codigo"], "stock_insuficiente")
        modelo = PedidoRealModelo.objects.get(id_pedido=id_pedido)
        self.assertEqual(modelo.estado, "pendiente_pago")
        self.assertEqual(modelo.estado_pago, "requiere_accion")
        self.assertFalse(modelo.inventario_descontado)
        self.assertEqual(MovimientoInventarioModelo.objects.filter(tipo_movimiento="descuento_pago").count(), 0)
        self.assertEqual(len(mail.outbox), 0)

    def test_confirmar_pago_simulado_rechaza_pedido_inexistente(self) -> None:
        response = self.client.post("/api/v1/pedidos/PED-NO-EXISTE/confirmar-pago-simulado/")

        self.assertEqual(response.status_code, 404)

    def test_confirmar_pago_simulado_requiere_intencion_simulada(self) -> None:
        id_pedido = _crear_pedido(self.client)

        response = self.client.post(f"/api/v1/pedidos/{id_pedido}/confirmar-pago-simulado/")

        self.assertEqual(response.status_code, 400)
        self.assertIn("intencion de pago simulada", response.json()["detalle"])

    def test_confirmar_pago_simulado_rechaza_pedido_cancelado(self) -> None:
        id_pedido = _crear_pedido(self.client)
        self.client.post(f"/api/v1/pedidos/{id_pedido}/iniciar-pago/")
        PedidoRealModelo.objects.filter(id_pedido=id_pedido).update(estado="cancelado")

        response = self.client.post(f"/api/v1/pedidos/{id_pedido}/confirmar-pago-simulado/")

        self.assertEqual(response.status_code, 400)
        self.assertIn("pedido cancelado", response.json()["detalle"])

    def test_confirmar_pago_simulado_es_idempotente(self) -> None:
        id_pedido = _crear_pedido(self.client)
        self.client.post(f"/api/v1/pedidos/{id_pedido}/iniciar-pago/")

        primera = self.client.post(f"/api/v1/pedidos/{id_pedido}/confirmar-pago-simulado/")
        segunda = self.client.post(f"/api/v1/pedidos/{id_pedido}/confirmar-pago-simulado/")

        self.assertEqual(primera.status_code, 200)
        self.assertEqual(segunda.status_code, 200)
        self.assertEqual(InventarioProductoModelo.objects.get(producto_id="prod-1").cantidad_disponible, 4)
        self.assertEqual(MovimientoInventarioModelo.objects.filter(tipo_movimiento="descuento_pago").count(), 1)
        self.assertEqual(len(mail.outbox), 1)

    @override_settings(
        BOTICA_PAYMENT_PROVIDER="stripe",
        STRIPE_PUBLIC_KEY="pk_test_123",
        STRIPE_SECRET_KEY="sk_test_123",
        STRIPE_WEBHOOK_SECRET="whsec_123",
        PAYMENT_SUCCESS_URL="https://frontend.test/pedido/{ID_PEDIDO}",
        PAYMENT_CANCEL_URL="https://frontend.test/pedido/{ID_PEDIDO}/cancel",
    )
    @patch("backend.nucleo_herbal.infraestructura.pagos_stripe.PasarelaPagoStripe._post")
    def test_confirmar_pago_simulado_rechaza_proveedor_stripe(self, post_stripe) -> None:
        post_stripe.return_value = {"id": "cs_test_123", "url": "https://checkout.stripe.test/cs_test_123"}
        id_pedido = _crear_pedido(self.client)
        self.client.post(f"/api/v1/pedidos/{id_pedido}/iniciar-pago/")

        response = self.client.post(f"/api/v1/pedidos/{id_pedido}/confirmar-pago-simulado/")

        self.assertEqual(response.status_code, 400)
        self.assertIn("pago simulada local", response.json()["detalle"])

    def test_confirmar_pago_simulado_no_filtra_claves_en_error_stripe(self) -> None:
        id_pedido = _crear_pedido(self.client)
        PedidoRealModelo.objects.filter(id_pedido=id_pedido).update(
            proveedor_pago="stripe",
            id_externo_pago="cs_test_123",
            url_pago="https://checkout.stripe.test/cs_test_123",
            estado_pago="requiere_accion",
        )

        response = self.client.post(f"/api/v1/pedidos/{id_pedido}/confirmar-pago-simulado/")
        cuerpo = response.content.decode("utf-8")

        self.assertEqual(response.status_code, 400)
        self.assertIn("pago simulada local", cuerpo)
        self.assertNotIn("sk_test_123", cuerpo)
        self.assertNotIn("whsec_123", cuerpo)


def _crear_pedido(cliente, id_usuario: str | None = None) -> str:
    payload = _payload_pedido()
    if id_usuario is not None:
        payload["canal_checkout"] = "web_autenticado"
        payload["id_usuario"] = id_usuario
    response = cliente.post("/api/v1/pedidos/", data=json.dumps(payload), content_type="application/json")
    return response.json()["pedido"]["id_pedido"]


def _payload_pedido() -> dict:
    return {
        "email_contacto": "real@test.dev",
        "nombre_contacto": "Lore",
        "telefono_contacto": "600111222",
        "canal_checkout": "web_invitado",
        "direccion_entrega": {
            "nombre_destinatario": "Lore",
            "linea_1": "Calle Luna 1",
            "codigo_postal": "28001",
            "ciudad": "Madrid",
            "provincia": "Madrid",
            "pais_iso": "ES",
        },
        "moneda": "EUR",
        "lineas": [
            {
                "id_producto": "prod-1",
                "slug_producto": "tarot-bosque-interior",
                "nombre_producto": "Tarot bosque interior",
                "cantidad": 1,
                "precio_unitario": "9.00",
                "moneda": "EUR",
            }
        ],
    }


def _payload_webhook(id_pedido: str, id_evento: str = "evt_1") -> bytes:
    payload = {
        "id": id_evento,
        "type": "checkout.session.completed",
        "data": {
            "object": {
                "id": "cs_test_123",
                "client_reference_id": id_pedido,
                "payment_status": "paid",
                "amount_total": 1682,
                "currency": "eur",
                "metadata": {"id_pedido": id_pedido},
            }
        },
    }
    return json.dumps(payload).encode("utf-8")


def _firmar(payload: bytes, secreto: str = "whsec_123") -> str:
    timestamp = str(int(time.time()))
    firmado = f"{timestamp}.".encode("utf-8") + payload
    digest = hmac.new(secreto.encode("utf-8"), firmado, hashlib.sha256).hexdigest()
    return f"t={timestamp},v1={digest}"


def _crear_usuario(username: str):
    return get_user_model().objects.create_user(
        username=username,
        email=f"{username}@test.dev",
        password="clave-segura",
        is_active=True,
    )
