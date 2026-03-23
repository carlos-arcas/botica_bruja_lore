from __future__ import annotations

import json

from django.contrib.auth import get_user_model
from django.test import Client, TestCase

from backend.nucleo_herbal.infraestructura.persistencia_django.models import CuentaClienteModelo, DireccionCuentaClienteModelo
from backend.nucleo_herbal.infraestructura.persistencia_django.models_pedidos import PedidoRealModelo


class PedidoCheckoutRealDireccionesTests(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        user_model = get_user_model()
        self.user = user_model.objects.create_user(username="cliente@example.com", email="cliente@example.com", password="clave-segura-1")
        self.cuenta = CuentaClienteModelo.objects.create(usuario=self.user, email="cliente@example.com", nombre_visible="Lore")
        self.other_user = user_model.objects.create_user(username="otro@example.com", email="otro@example.com", password="clave-segura-2")
        self.other_cuenta = CuentaClienteModelo.objects.create(usuario=self.other_user, email="otro@example.com", nombre_visible="Otra")
        self.direccion = DireccionCuentaClienteModelo.objects.create(
            cuenta=self.cuenta,
            alias="Casa",
            nombre_destinatario="Lore Bruja",
            telefono_contacto="600000000",
            linea_1="Calle Luna 13",
            linea_2="Portal 2",
            codigo_postal="28013",
            ciudad="Madrid",
            provincia="Madrid",
            pais_iso="ES",
            predeterminada=True,
        )
        self.direccion_ajena = DireccionCuentaClienteModelo.objects.create(
            cuenta=self.other_cuenta,
            alias="Ajena",
            nombre_destinatario="Otra Persona",
            telefono_contacto="611111111",
            linea_1="Calle Ajena 9",
            linea_2="",
            codigo_postal="41001",
            ciudad="Sevilla",
            provincia="Sevilla",
            pais_iso="ES",
            predeterminada=True,
        )

    def _payload_base(self) -> dict:
        return {
            "email_contacto": "checkout@test.dev",
            "nombre_contacto": "Lore",
            "telefono_contacto": "600000000",
            "lineas": [{
                "id_producto": "prod-1",
                "slug_producto": "vela-intencion-clara",
                "nombre_producto": "Vela Intención Clara",
                "cantidad": 1,
                "precio_unitario": "9.90",
                "moneda": "EUR",
            }],
            "canal_checkout": "web_invitado",
            "moneda": "EUR",
        }

    def test_checkout_autenticado_usa_direccion_guardada_y_persist_snapshot(self):
        self.client.force_login(self.user)
        payload = self._payload_base() | {"id_direccion_guardada": str(self.direccion.id)}

        respuesta = self.client.post("/api/v1/pedidos/", data=json.dumps(payload), content_type="application/json")

        self.assertEqual(respuesta.status_code, 201)
        pedido = respuesta.json()["pedido"]
        self.assertEqual(pedido["cliente"]["id_usuario"], str(self.user.id))
        self.assertEqual(pedido["direccion_entrega"]["linea_1"], "Calle Luna 13")
        modelo = PedidoRealModelo.objects.get(id_pedido=pedido["id_pedido"])
        self.assertEqual(modelo.direccion_entrega["ciudad"], "Madrid")

        self.direccion.linea_1 = "Calle Nueva 99"
        self.direccion.ciudad = "Toledo"
        self.direccion.save(update_fields=["linea_1", "ciudad", "fecha_actualizacion"])
        modelo.refresh_from_db()
        self.assertEqual(modelo.direccion_entrega["linea_1"], "Calle Luna 13")
        self.assertEqual(modelo.direccion_entrega["ciudad"], "Madrid")

    def test_checkout_autenticado_rechaza_direccion_ajena(self):
        self.client.force_login(self.user)
        payload = self._payload_base() | {"id_direccion_guardada": str(self.direccion_ajena.id)}

        respuesta = self.client.post("/api/v1/pedidos/", data=json.dumps(payload), content_type="application/json")

        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(respuesta.json()["detalle"], "La dirección guardada no pertenece al cliente autenticado.")

    def test_checkout_invitado_rechaza_direccion_guardada(self):
        payload = self._payload_base() | {"id_direccion_guardada": str(self.direccion.id)}

        respuesta = self.client.post("/api/v1/pedidos/", data=json.dumps(payload), content_type="application/json")

        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(respuesta.json()["detalle"], "Solo un cliente autenticado puede usar 'id_direccion_guardada'.")

    def test_checkout_rechaza_payload_ambiguo(self):
        payload = self._payload_base() | {
            "id_direccion_guardada": str(self.direccion.id),
            "direccion_entrega": {
                "nombre_destinatario": "Manual",
                "linea_1": "Calle Sol 1",
                "codigo_postal": "28001",
                "ciudad": "Madrid",
                "provincia": "Madrid",
                "pais_iso": "ES",
            },
        }

        respuesta = self.client.post("/api/v1/pedidos/", data=json.dumps(payload), content_type="application/json")

        self.assertEqual(respuesta.status_code, 400)
        self.assertEqual(respuesta.json()["detalle"], "Debes indicar exactamente una fuente de dirección: 'direccion_entrega' o 'id_direccion_guardada'.")

    def test_checkout_manual_sigue_funcionando(self):
        payload = self._payload_base() | {
            "direccion_entrega": {
                "nombre_destinatario": "Manual",
                "linea_1": "Calle Sol 1",
                "linea_2": "Piso 2",
                "codigo_postal": "28001",
                "ciudad": "Madrid",
                "provincia": "Madrid",
                "pais_iso": "ES",
                "observaciones": "Llamar al telefonillo.",
            }
        }

        respuesta = self.client.post("/api/v1/pedidos/", data=json.dumps(payload), content_type="application/json")

        self.assertEqual(respuesta.status_code, 201)
        pedido = respuesta.json()["pedido"]
        self.assertTrue(pedido["cliente"]["es_invitado"])
        self.assertEqual(pedido["direccion_entrega"]["linea_1"], "Calle Sol 1")
