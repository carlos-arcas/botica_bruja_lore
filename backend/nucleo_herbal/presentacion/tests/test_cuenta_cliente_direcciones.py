from __future__ import annotations

import json

from django.contrib.auth import get_user_model
from django.test import Client, TestCase

from backend.nucleo_herbal.infraestructura.persistencia_django.models import CuentaClienteModelo, DireccionCuentaClienteModelo


class CuentaClienteDireccionesApiTests(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        user_model = get_user_model()
        self.user = user_model.objects.create_user(username="cliente@example.com", email="cliente@example.com", password="clave-segura-1")
        self.cuenta = CuentaClienteModelo.objects.create(usuario=self.user, email="cliente@example.com", nombre_visible="Cliente")
        self.other_user = user_model.objects.create_user(username="otro@example.com", email="otro@example.com", password="clave-segura-2")
        self.other_cuenta = CuentaClienteModelo.objects.create(usuario=self.other_user, email="otro@example.com", nombre_visible="Otro")

    def _login(self) -> None:
        self.client.force_login(self.user)

    def _payload(self, **overrides):
        payload = {
            "alias": "Casa",
            "nombre_destinatario": "Lore Bruja",
            "telefono_contacto": "+34600111222",
            "linea_1": "Calle Luna 13",
            "linea_2": "Portal 2",
            "codigo_postal": "28013",
            "ciudad": "Madrid",
            "provincia": "Madrid",
            "pais_iso": "ES",
        }
        payload.update(overrides)
        return payload

    def test_requiere_auth_para_listar(self):
        respuesta = self.client.get("/api/v1/cuenta/direcciones/")
        self.assertEqual(respuesta.status_code, 401)
        self.assertEqual(respuesta.json()["detalle"], "Debes iniciar sesión con una cuenta real.")

    def test_crear_primera_direccion_queda_predeterminada(self):
        self._login()
        respuesta = self.client.post("/api/v1/cuenta/direcciones/", data=json.dumps(self._payload()), content_type="application/json")

        self.assertEqual(respuesta.status_code, 201)
        data = respuesta.json()["direccion"]
        self.assertTrue(data["predeterminada"])
        self.assertEqual(DireccionCuentaClienteModelo.objects.filter(cuenta=self.cuenta, predeterminada=True).count(), 1)

    def test_crear_segunda_direccion_no_rompe_unicidad_predeterminada(self):
        self._login()
        self.client.post("/api/v1/cuenta/direcciones/", data=json.dumps(self._payload(alias="Casa")), content_type="application/json")
        self.client.post("/api/v1/cuenta/direcciones/", data=json.dumps(self._payload(alias="Trabajo", linea_1="Calle Sol 7")), content_type="application/json")

        self.assertEqual(DireccionCuentaClienteModelo.objects.filter(cuenta=self.cuenta).count(), 2)
        self.assertEqual(DireccionCuentaClienteModelo.objects.filter(cuenta=self.cuenta, predeterminada=True).count(), 1)

    def test_marcar_otra_direccion_como_predeterminada(self):
        self._login()
        primera = self.client.post("/api/v1/cuenta/direcciones/", data=json.dumps(self._payload(alias="Casa")), content_type="application/json").json()["direccion"]
        segunda = self.client.post("/api/v1/cuenta/direcciones/", data=json.dumps(self._payload(alias="Trabajo", linea_1="Calle Sol 7")), content_type="application/json").json()["direccion"]

        respuesta = self.client.post(f"/api/v1/cuenta/direcciones/{segunda['id_direccion']}/predeterminada/")

        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.json()["direccion"]["id_direccion"], segunda["id_direccion"])
        self.assertTrue(respuesta.json()["direccion"]["predeterminada"])
        self.assertFalse(DireccionCuentaClienteModelo.objects.get(id=primera["id_direccion"]).predeterminada)

    def test_listar_direcciones_usuario_autenticado(self):
        self._login()
        self.client.post("/api/v1/cuenta/direcciones/", data=json.dumps(self._payload(alias="Casa")), content_type="application/json")
        self.client.post("/api/v1/cuenta/direcciones/", data=json.dumps(self._payload(alias="Trabajo", linea_1="Calle Sol 7")), content_type="application/json")

        respuesta = self.client.get("/api/v1/cuenta/direcciones/")

        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(len(respuesta.json()["direcciones"]), 2)
        self.assertIn("nombre_destinatario", respuesta.json()["direcciones"][0])

    def test_actualizar_direccion_propia(self):
        self._login()
        direccion = self.client.post("/api/v1/cuenta/direcciones/", data=json.dumps(self._payload()), content_type="application/json").json()["direccion"]

        respuesta = self.client.put(f"/api/v1/cuenta/direcciones/{direccion['id_direccion']}/", data=json.dumps(self._payload(alias="Refugio", ciudad="Toledo")), content_type="application/json")

        self.assertEqual(respuesta.status_code, 200)
        self.assertEqual(respuesta.json()["direccion"]["alias"], "Refugio")
        self.assertEqual(respuesta.json()["direccion"]["ciudad"], "Toledo")

    def test_rechaza_operacion_sobre_direccion_ajena(self):
        ajena = DireccionCuentaClienteModelo.objects.create(cuenta=self.other_cuenta, nombre_destinatario="Otra", telefono_contacto="600000000", linea_1="Calle ajena", codigo_postal="41001", ciudad="Sevilla", provincia="Sevilla", pais_iso="ES", predeterminada=True)
        self._login()

        respuesta = self.client.put(f"/api/v1/cuenta/direcciones/{ajena.id}/", data=json.dumps(self._payload(ciudad="Bilbao")), content_type="application/json")

        self.assertEqual(respuesta.status_code, 404)

    def test_eliminar_direccion_no_predeterminada(self):
        self._login()
        self.client.post("/api/v1/cuenta/direcciones/", data=json.dumps(self._payload(alias="Casa")), content_type="application/json")
        segunda = self.client.post("/api/v1/cuenta/direcciones/", data=json.dumps(self._payload(alias="Trabajo", linea_1="Calle Sol 7")), content_type="application/json").json()["direccion"]

        respuesta = self.client.delete(f"/api/v1/cuenta/direcciones/{segunda['id_direccion']}/")

        self.assertEqual(respuesta.status_code, 200)
        self.assertTrue(respuesta.json()["eliminada"])
        self.assertEqual(DireccionCuentaClienteModelo.objects.filter(cuenta=self.cuenta).count(), 1)

    def test_eliminar_predeterminada_reasigna_nueva_predeterminada(self):
        self._login()
        primera = self.client.post("/api/v1/cuenta/direcciones/", data=json.dumps(self._payload(alias="Casa")), content_type="application/json").json()["direccion"]
        segunda = self.client.post("/api/v1/cuenta/direcciones/", data=json.dumps(self._payload(alias="Trabajo", linea_1="Calle Sol 7")), content_type="application/json").json()["direccion"]

        respuesta = self.client.delete(f"/api/v1/cuenta/direcciones/{primera['id_direccion']}/")

        self.assertEqual(respuesta.status_code, 200)
        restante = DireccionCuentaClienteModelo.objects.get(id=segunda["id_direccion"])
        self.assertTrue(restante.predeterminada)

    def test_contrato_json_estable_y_payload_invalido(self):
        self._login()
        respuesta = self.client.post("/api/v1/cuenta/direcciones/", data=json.dumps({"alias": "Sin datos"}), content_type="application/json")

        self.assertEqual(respuesta.status_code, 400)
        self.assertIn("detalle", respuesta.json())
