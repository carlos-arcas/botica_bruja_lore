import json
import unittest

try:
    from django.contrib.auth.models import User
    from django.core import mail
    from django.test import TestCase as DjangoTestCase
    from django.test.utils import override_settings

    from backend.nucleo_herbal.infraestructura.persistencia_django.models import CuentaClienteModelo, ProductoModelo
    from backend.nucleo_herbal.infraestructura.persistencia_django.models_inventario import InventarioProductoModelo
    from backend.nucleo_herbal.infraestructura.persistencia_django.models_pedidos import PedidoRealModelo

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    DjangoTestCase = unittest.TestCase
    User = None
    CuentaClienteModelo = None
    PedidoRealModelo = None
    DJANGO_DISPONIBLE = False


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno local.")
@override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend", PUBLIC_SITE_URL="http://frontend.test")
class ApiCuentaClienteTests(DjangoTestCase):
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


    def test_registro_real_crea_verificacion_email_y_la_cuenta_nace_no_verificada(self) -> None:
        response = self.client.post(
            "/api/v1/cuenta/registro/",
            data=json.dumps({"email": "verifica@test.dev", "nombre_visible": "Lore", "password": "ClaveSegura123"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.json()["cuenta"]["email_verificado"])
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("verificar-email?token=", mail.outbox[0].body)


    def test_solicitud_recuperacion_email_existente_e_inexistente_es_generica(self) -> None:
        self._registrar_cuenta(email="reset@test.dev")
        existente = self.client.post(
            "/api/v1/cuenta/password/recuperacion/solicitar/",
            data=json.dumps({"email": "reset@test.dev"}),
            content_type="application/json",
        )
        inexistente = self.client.post(
            "/api/v1/cuenta/password/recuperacion/solicitar/",
            data=json.dumps({"email": "nadie@test.dev"}),
            content_type="application/json",
        )

        self.assertEqual(existente.status_code, 200)
        self.assertEqual(inexistente.status_code, 200)
        self.assertEqual(existente.json()["detalle"], inexistente.json()["detalle"])
        self.assertEqual(len(mail.outbox), 2)
        self.assertIn("recuperar-password?token=", mail.outbox[-1].body)

    def test_confirmacion_recuperacion_ok_invalida_expirada_y_reutilizada(self) -> None:
        self._registrar_cuenta(email="recovery-flow@test.dev")
        self.client.post(
            "/api/v1/cuenta/password/recuperacion/solicitar/",
            data=json.dumps({"email": "recovery-flow@test.dev"}),
            content_type="application/json",
        )
        token = mail.outbox[-1].body.split("token=")[-1].split()[0]

        ok = self.client.post(
            "/api/v1/cuenta/password/recuperacion/confirmar/",
            data=json.dumps({"token": token, "password": "ClaveNuevaSegura123$"}),
            content_type="application/json",
        )
        reutilizado = self.client.post(
            "/api/v1/cuenta/password/recuperacion/confirmar/",
            data=json.dumps({"token": token, "password": "ClaveNuevaSegura123$"}),
            content_type="application/json",
        )
        invalido = self.client.post(
            "/api/v1/cuenta/password/recuperacion/confirmar/",
            data=json.dumps({"token": "token-invalido", "password": "ClaveNuevaSegura123$"}),
            content_type="application/json",
        )

        self._registrar_cuenta(email="expirado-reset@test.dev")
        self.client.post(
            "/api/v1/cuenta/password/recuperacion/solicitar/",
            data=json.dumps({"email": "expirado-reset@test.dev"}),
            content_type="application/json",
        )
        token_expirado = mail.outbox[-1].body.split("token=")[-1].split()[0]
        from backend.nucleo_herbal.infraestructura.persistencia_django.models import RecuperacionPasswordCuentaClienteModelo
        solicitud = RecuperacionPasswordCuentaClienteModelo.objects.filter(cuenta__email="expirado-reset@test.dev").first()
        solicitud.expira_en = solicitud.fecha_creacion
        solicitud.save(update_fields=["expira_en", "fecha_envio"])
        expirado = self.client.post(
            "/api/v1/cuenta/password/recuperacion/confirmar/",
            data=json.dumps({"token": token_expirado, "password": "ClaveNuevaSegura123$"}),
            content_type="application/json",
        )

        self.assertEqual(ok.status_code, 200)
        self.assertEqual(reutilizado.json()["codigo"], "token_usado")
        self.assertEqual(invalido.json()["codigo"], "token_invalido")
        self.assertEqual(expirado.json()["codigo"], "token_expirado")

    def test_recuperacion_valida_password_y_permite_login_con_nueva_clave(self) -> None:
        self._registrar_cuenta(email="validacion-reset@test.dev")
        self.client.post(
            "/api/v1/cuenta/password/recuperacion/solicitar/",
            data=json.dumps({"email": "validacion-reset@test.dev"}),
            content_type="application/json",
        )
        token = mail.outbox[-1].body.split("token=")[-1].split()[0]

        invalida = self.client.post(
            "/api/v1/cuenta/password/recuperacion/confirmar/",
            data=json.dumps({"token": token, "password": "123"}),
            content_type="application/json",
        )
        ok = self.client.post(
            "/api/v1/cuenta/password/recuperacion/confirmar/",
            data=json.dumps({"token": token, "password": "ClaveNuevaSegura123$"}),
            content_type="application/json",
        )
        self.client.post("/api/v1/cuenta/logout/", content_type="application/json")
        login = self.client.post(
            "/api/v1/cuenta/login/",
            data=json.dumps({"email": "validacion-reset@test.dev", "password": "ClaveNuevaSegura123$"}),
            content_type="application/json",
        )

        self.assertEqual(invalida.status_code, 400)
        self.assertEqual(invalida.json()["codigo"], "password_invalida")
        self.assertEqual(ok.status_code, 200)
        self.assertEqual(login.status_code, 200)

    def test_confirmacion_email_ok_token_invalido_y_expirado(self) -> None:
        self._registrar_cuenta(email="confirmar@test.dev")
        token_ok = mail.outbox[-1].body.split("token=")[-1].split()[0]

        ok = self.client.post(
            "/api/v1/cuenta/verificacion-email/confirmar/",
            data=json.dumps({"token": token_ok}),
            content_type="application/json",
        )
        invalido = self.client.post(
            "/api/v1/cuenta/verificacion-email/confirmar/",
            data=json.dumps({"token": "token-invalido"}),
            content_type="application/json",
        )

        self._registrar_cuenta(email="expirado@test.dev")
        token_expirado = mail.outbox[-1].body.split("token=")[-1].split()[0]
        from backend.nucleo_herbal.infraestructura.persistencia_django.models import VerificacionEmailCuentaClienteModelo
        solicitud = VerificacionEmailCuentaClienteModelo.objects.get(cuenta__email="expirado@test.dev")
        solicitud.expira_en = solicitud.fecha_creacion
        solicitud.save(update_fields=["expira_en", "fecha_envio"])
        expirado = self.client.post(
            "/api/v1/cuenta/verificacion-email/confirmar/",
            data=json.dumps({"token": token_expirado}),
            content_type="application/json",
        )

        self.assertEqual(ok.status_code, 200)
        self.assertTrue(ok.json()["cuenta"]["email_verificado"])
        self.assertEqual(invalido.status_code, 400)
        self.assertIn("válido", invalido.json()["detalle"])
        self.assertEqual(expirado.status_code, 400)
        self.assertIn("expirado", expirado.json()["detalle"])

    def test_reenvio_ok_y_rechazo_si_ya_esta_verificada_con_json_estable(self) -> None:
        self._registrar_cuenta(email="reenviar@test.dev")
        ok = self.client.post(
            "/api/v1/cuenta/verificacion-email/reenviar/",
            data=json.dumps({"email": "reenviar@test.dev"}),
            content_type="application/json",
        )
        token = mail.outbox[-1].body.split("token=")[-1].split()[0]
        self.client.post(
            "/api/v1/cuenta/verificacion-email/confirmar/",
            data=json.dumps({"token": token}),
            content_type="application/json",
        )
        ya_verificada = self.client.post(
            "/api/v1/cuenta/verificacion-email/reenviar/",
            data=json.dumps({"email": "reenviar@test.dev"}),
            content_type="application/json",
        )
        estado = self.client.get("/api/v1/cuenta/verificacion-email/estado/")

        self.assertEqual(ok.status_code, 200)
        self.assertSetEqual(set(ok.json()["verificacion"].keys()), {"email", "email_verificado", "expira_en", "reenviada"})
        self.assertEqual(ya_verificada.status_code, 400)
        self.assertIn("ya tiene el email verificado", ya_verificada.json()["detalle"])
        self.assertEqual(estado.status_code, 200)
        self.assertTrue(estado.json()["verificacion"]["email_verificado"])

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
