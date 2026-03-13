from __future__ import annotations

import json

from django.contrib.auth import get_user_model
from django.test import Client, TestCase


class BackofficeAuthApiTests(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        user_model = get_user_model()
        self.staff = user_model.objects.create_user(
            username="staff_demo",
            password="clave-segura-1",
            is_staff=True,
            is_active=True,
        )
        self.no_staff = user_model.objects.create_user(
            username="cliente_demo",
            password="clave-segura-2",
            is_staff=False,
            is_active=True,
        )

    def _login(self, username: str, password: str):
        return self.client.post(
            "/api/backoffice/auth/login/",
            data=json.dumps({"username": username, "password": password}),
            content_type="application/json",
        )

    def test_login_staff_activo_ok(self):
        respuesta = self._login("staff_demo", "clave-segura-1")

        self.assertEqual(respuesta.status_code, 200)
        data = respuesta.json()
        self.assertTrue(data["autenticado"])
        self.assertIn("token", data)
        self.assertEqual(data["usuario"]["username"], "staff_demo")

    def test_login_incorrecto(self):
        respuesta = self._login("staff_demo", "invalida")

        self.assertEqual(respuesta.status_code, 401)
        self.assertFalse(respuesta.json()["autenticado"])

    def test_login_rechaza_usuario_no_staff(self):
        respuesta = self._login("cliente_demo", "clave-segura-2")

        self.assertEqual(respuesta.status_code, 401)
        self.assertFalse(respuesta.json()["autenticado"])

    def test_session_check_correcto(self):
        login = self._login("staff_demo", "clave-segura-1")
        token = login.json()["token"]

        respuesta = self.client.get(
            "/api/backoffice/auth/session/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(respuesta.status_code, 200)
        self.assertTrue(respuesta.json()["autenticado"])

    def test_logout_correcto(self):
        login = self._login("staff_demo", "clave-segura-1")
        token = login.json()["token"]

        respuesta = self.client.post(
            "/api/backoffice/auth/logout/",
            HTTP_AUTHORIZATION=f"Bearer {token}",
        )

        self.assertEqual(respuesta.status_code, 200)
        self.assertTrue(respuesta.json()["logout"])
