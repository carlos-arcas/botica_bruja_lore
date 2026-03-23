import hashlib
import hmac
import json
import time
from unittest.mock import patch

from django.core import mail
from django.test import TestCase, override_settings

from backend.nucleo_herbal.infraestructura.persistencia_django.models import ProductoModelo
from backend.nucleo_herbal.infraestructura.persistencia_django.models_inventario import InventarioProductoModelo
from backend.nucleo_herbal.infraestructura.persistencia_django.models_pedidos import EventoWebhookPagoModelo, PedidoRealModelo


@override_settings(
    STRIPE_PUBLIC_KEY="pk_test_123",
    STRIPE_SECRET_KEY="sk_test_123",
    STRIPE_WEBHOOK_SECRET="whsec_123",
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


def _crear_pedido(cliente) -> str:
    response = cliente.post("/api/v1/pedidos/", data=json.dumps(_payload_pedido()), content_type="application/json")
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
                "amount_total": 900,
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
