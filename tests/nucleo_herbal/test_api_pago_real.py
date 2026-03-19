import hashlib
import hmac
import json
import time
import unittest
from unittest.mock import patch

from django.test import TestCase, override_settings

from backend.nucleo_herbal.infraestructura.persistencia_django.models_pedidos import EventoWebhookPagoModelo, PedidoRealModelo


@override_settings(
    STRIPE_PUBLIC_KEY="pk_test_123",
    STRIPE_SECRET_KEY="sk_test_123",
    STRIPE_WEBHOOK_SECRET="whsec_123",
    PAYMENT_SUCCESS_URL="https://frontend.test/pedido/{CHECKOUT_SESSION_ID}",
    PAYMENT_CANCEL_URL="https://frontend.test/checkout?estado_pago=cancelado",
)
class TestApiPagoReal(TestCase):
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

    def test_no_inicia_pago_sobre_pedido_inexistente(self) -> None:
        response = self.client.post("/api/v1/pedidos/PED-inexistente/iniciar-pago/")
        self.assertEqual(response.status_code, 404)

    @patch("backend.nucleo_herbal.infraestructura.pagos_stripe.PasarelaPagoStripe._post")
    def test_webhook_valido_marca_pedido_como_pagado(self, post_stripe) -> None:
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

    @patch("backend.nucleo_herbal.infraestructura.pagos_stripe.PasarelaPagoStripe._post")
    def test_webhook_duplicado_no_duplica_transicion(self, post_stripe) -> None:
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
