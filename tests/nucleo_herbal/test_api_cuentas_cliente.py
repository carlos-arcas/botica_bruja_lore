import json
import unittest

try:
    from django.contrib.auth.models import User
    from django.test import TestCase as DjangoTestCase

    from backend.nucleo_herbal.infraestructura.persistencia_django.models import CuentaClienteModelo
    from backend.nucleo_herbal.infraestructura.persistencia_django.models_pedidos import PedidoRealModelo

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    DjangoTestCase = unittest.TestCase
    User = None
    CuentaClienteModelo = None
    PedidoRealModelo = None
    DJANGO_DISPONIBLE = False


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
class ApiCuentaClienteTests(DjangoTestCase):
    def test_registro_real_crea_cuenta_y_sesion(self) -> None:
        response = self.client.post(
            "/api/v1/cuenta/registro/",
            data=json.dumps({"email": "cliente@test.dev", "nombre_visible": "Lore", "password": "ClaveSegura123"}),
            content_type="application/json",
            HTTP_X_OPERATION_ID="op-cuenta-001",
        )

        self.assertEqual(response.status_code, 201)
        cuenta = response.json()["cuenta"]
        self.assertEqual(cuenta["email"], "cliente@test.dev")
        self.assertTrue(self.client.get("/api/v1/cuenta/sesion/").json()["autenticado"])

    def test_password_se_guarda_con_hash(self) -> None:
        self.client.post(
            "/api/v1/cuenta/registro/",
            data=json.dumps({"email": "hash@test.dev", "nombre_visible": "Hash", "password": "ClaveSegura123"}),
            content_type="application/json",
        )
        usuario = User.objects.get(username="hash@test.dev")
        self.assertNotEqual(usuario.password, "ClaveSegura123")
        self.assertTrue(usuario.check_password("ClaveSegura123"))

    def test_login_logout_y_sesion_actual_funcionan(self) -> None:
        self._registrar_cuenta(email="login@test.dev")
        self.client.post("/api/v1/cuenta/logout/", content_type="application/json")

        login = self.client.post(
            "/api/v1/cuenta/login/",
            data=json.dumps({"email": "login@test.dev", "password": "ClaveSegura123"}),
            content_type="application/json",
        )
        sesion = self.client.get("/api/v1/cuenta/sesion/")
        logout = self.client.post("/api/v1/cuenta/logout/", content_type="application/json")

        self.assertEqual(login.status_code, 200)
        self.assertTrue(sesion.json()["autenticado"])
        self.assertEqual(logout.status_code, 200)
        self.assertFalse(self.client.get("/api/v1/cuenta/sesion/").json()["autenticado"])

    def test_pedido_real_se_asocia_a_usuario_autenticado(self) -> None:
        cuenta = self._registrar_cuenta(email="pedido@test.dev")
        response = self.client.post(
            "/api/v1/pedidos/",
            data=json.dumps(_payload_pedido()),
            content_type="application/json",
        )
        pedido = response.json()["pedido"]

        self.assertEqual(response.status_code, 201)
        self.assertEqual(pedido["cliente"]["id_usuario"], cuenta["id_usuario"])
        self.assertFalse(pedido["cliente"]["es_invitado"])
        self.assertTrue(PedidoRealModelo.objects.filter(id_pedido=pedido["id_pedido"], id_usuario=cuenta["id_usuario"]).exists())

    def test_area_mis_pedidos_muestra_solo_pedidos_reales_del_usuario(self) -> None:
        cuenta = self._registrar_cuenta(email="area@test.dev")
        self.client.post("/api/v1/pedidos/", data=json.dumps(_payload_pedido()), content_type="application/json")
        self.client.post("/api/v1/cuenta/logout/", content_type="application/json")
        self.client.post(
            "/api/v1/pedidos/",
            data=json.dumps(_payload_pedido(email="invitado@test.dev", nombre="Invitado")),
            content_type="application/json",
        )
        self.client.post(
            "/api/v1/cuenta/login/",
            data=json.dumps({"email": "area@test.dev", "password": "ClaveSegura123"}),
            content_type="application/json",
        )

        listado = self.client.get("/api/v1/cuenta/pedidos/")
        detalle = self.client.get(f"/api/v1/cuenta/pedidos/{listado.json()['pedidos'][0]['id_pedido']}/")

        self.assertEqual(listado.status_code, 200)
        self.assertEqual(len(listado.json()["pedidos"]), 1)
        self.assertEqual(detalle.status_code, 200)
        self.assertEqual(detalle.json()["pedido"]["cliente"]["id_usuario"], cuenta["id_usuario"])

    def test_legado_demo_sigue_operativo(self) -> None:
        response = self.client.post(
            "/api/v1/cuentas-demo/registro/",
            data=json.dumps({"email": "demo@legacy.test", "nombre_visible": "Demo", "clave_acceso_demo": "bruma"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(CuentaClienteModelo.objects.filter(email="demo@legacy.test").exists() is False)

    def _registrar_cuenta(self, email: str) -> dict:
        response = self.client.post(
            "/api/v1/cuenta/registro/",
            data=json.dumps({"email": email, "nombre_visible": "Lore", "password": "ClaveSegura123"}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        return response.json()["cuenta"]


def _payload_pedido(email: str = "pedido@test.dev", nombre: str = "Lore") -> dict:
    return {
        "email_contacto": email,
        "nombre_contacto": nombre,
        "telefono_contacto": "600111222",
        "canal_checkout": "web_invitado",
        "direccion_entrega": {
            "nombre_destinatario": nombre,
            "linea_1": "Calle Luna 1",
            "codigo_postal": "28001",
            "ciudad": "Madrid",
            "provincia": "Madrid",
            "pais_iso": "ES",
            "observaciones": "Portal azul",
        },
        "notas_cliente": "Dejar en horario de tarde.",
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
