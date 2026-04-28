import json
import unittest

try:
    from django.core import mail
    from django.test import TestCase as DjangoTestCase, override_settings

    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        IntencionModelo,
        PlantaModelo,
        ProductoModelo,
    )
    from backend.nucleo_herbal.infraestructura.persistencia_django.models_inventario import (
        InventarioProductoModelo,
    )
    from backend.nucleo_herbal.infraestructura.persistencia_django.models_pedidos import (
        PedidoRealModelo,
    )
    from backend.nucleo_herbal.infraestructura.persistencia_django.models import PedidoDemoModelo

    DJANGO_DISPONIBLE = True
except ModuleNotFoundError:
    DjangoTestCase = unittest.TestCase
    DJANGO_DISPONIBLE = False


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no esta instalado en el entorno local.")
@override_settings(
    BOTICA_PAYMENT_PROVIDER="simulado_local",
    EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    PUBLIC_SITE_URL="http://frontend.test",
)
class RegresionCompraLocalSimuladaTests(DjangoTestCase):
    def setUp(self) -> None:
        super().setUp()
        _crear_producto_comprable()

    def test_compra_invitado_llega_a_pedido_pagado_y_documento(self) -> None:
        listado = self.client.get("/api/v1/herbal/secciones/botica-natural/productos/")
        ficha = self.client.get("/api/v1/herbal/productos/melisa-local-regresion/")
        crear = self.client.post("/api/v1/pedidos/", data=json.dumps(_payload_pedido()), content_type="application/json")
        id_pedido = crear.json()["pedido"]["id_pedido"]
        pago = self.client.post(f"/api/v1/pedidos/{id_pedido}/iniciar-pago/", HTTP_X_OPERATION_ID="op-reg-pay")
        confirmar = self.client.post(f"/api/v1/pedidos/{id_pedido}/confirmar-pago-simulado/", HTTP_X_OPERATION_ID="op-reg-ok")
        documento = self.client.get(f"/api/v1/pedidos/{id_pedido}/documento/")

        self.assertEqual(listado.status_code, 200)
        self.assertEqual(ficha.status_code, 200)
        self.assertEqual(crear.status_code, 201)
        self.assertEqual(pago.json()["pago"]["proveedor_pago"], "simulado_local")
        self.assertEqual(confirmar.status_code, 200)
        self.assertEqual(confirmar.json()["pedido"]["estado_pago"], "pagado")
        self.assertTrue(confirmar.json()["pedido"]["inventario_descontado"])
        self.assertIn("Documento:</strong>", documento.content.decode("utf-8"))
        self.assertEqual(InventarioProductoModelo.objects.get(producto_id="prod-local-reg").cantidad_disponible, 4)
        self.assertEqual(PedidoDemoModelo.objects.count(), 0)
        self.assertEqual(len(mail.outbox), 1)

    def test_compra_usuario_real_con_direccion_guardada_aparece_en_cuenta(self) -> None:
        cuenta = _registrar_cuenta(self.client)
        direccion = _crear_direccion(self.client)
        crear = self.client.post(
            "/api/v1/pedidos/",
            data=json.dumps(_payload_pedido(id_direccion=direccion["id_direccion"])),
            content_type="application/json",
        )
        id_pedido = crear.json()["pedido"]["id_pedido"]

        self.client.post(f"/api/v1/pedidos/{id_pedido}/iniciar-pago/")
        self.client.post(f"/api/v1/pedidos/{id_pedido}/confirmar-pago-simulado/")
        listado = self.client.get("/api/v1/cuenta/pedidos/")
        detalle = self.client.get(f"/api/v1/cuenta/pedidos/{id_pedido}/")

        self.assertEqual(crear.status_code, 201)
        self.assertEqual(crear.json()["pedido"]["cliente"]["id_usuario"], cuenta["id_usuario"])
        self.assertEqual(listado.status_code, 200)
        self.assertEqual(listado.json()["pedidos"][0]["id_pedido"], id_pedido)
        self.assertEqual(detalle.json()["pedido"]["id_pedido"], id_pedido)
        self.assertEqual(PedidoDemoModelo.objects.count(), 0)

    def test_stock_insuficiente_bloquea_pago_sin_crear_intencion(self) -> None:
        crear = self.client.post("/api/v1/pedidos/", data=json.dumps(_payload_pedido()), content_type="application/json")
        id_pedido = crear.json()["pedido"]["id_pedido"]
        inventario = InventarioProductoModelo.objects.get(producto_id="prod-local-reg")
        inventario.cantidad_disponible = 0
        inventario.save(update_fields=["cantidad_disponible"])

        pago = self.client.post(f"/api/v1/pedidos/{id_pedido}/iniciar-pago/")

        self.assertEqual(pago.status_code, 409)
        self.assertEqual(pago.json()["codigo"], "stock_no_disponible")
        self.assertEqual(pago.json()["lineas"][0]["codigo"], "stock_insuficiente")
        pedido = PedidoRealModelo.objects.get(id_pedido=id_pedido)
        self.assertEqual(pedido.estado_pago, "pendiente")
        self.assertFalse(pedido.id_externo_pago)


def _crear_producto_comprable() -> None:
    IntencionModelo.objects.create(
        id="int-local-reg",
        slug="calma-regresion",
        nombre="Calma regresion",
        descripcion="Intencion de prueba para compra local.",
    )
    planta = PlantaModelo.objects.create(
        id="pla-local-reg",
        slug="melisa-regresion",
        nombre="Melisa regresion",
        descripcion_breve="Planta de prueba para compra local.",
        publicada=True,
    )
    planta.intenciones.set(IntencionModelo.objects.filter(slug="calma-regresion"))
    ProductoModelo.objects.create(
        id="prod-local-reg",
        sku="REG-LOCAL-001",
        slug="melisa-local-regresion",
        nombre="Melisa local regresion",
        tipo_producto="hierbas-a-granel",
        categoria_comercial="hierbas",
        seccion_publica="botica-natural",
        precio_visible="6,90 EUR",
        precio_numerico="6.90",
        unidad_comercial="ud",
        tipo_fiscal="iva_reducido",
        planta=planta,
        publicado=True,
    )
    InventarioProductoModelo.objects.create(producto_id="prod-local-reg", cantidad_disponible=5, unidad_base="ud")


def _payload_pedido(id_direccion: str | None = None) -> dict:
    payload = {
        "email_contacto": "compra.local@test.dev",
        "nombre_contacto": "Lore Local",
        "telefono_contacto": "600111222",
        "canal_checkout": "web_invitado",
        "moneda": "EUR",
        "lineas": [_linea_pedido()],
    }
    if id_direccion:
        payload["id_direccion_guardada"] = id_direccion
        return payload
    payload["direccion_entrega"] = _direccion_manual()
    return payload


def _linea_pedido() -> dict:
    return {
        "id_producto": "prod-local-reg",
        "slug_producto": "melisa-local-regresion",
        "nombre_producto": "Melisa local regresion",
        "cantidad": 1,
        "precio_unitario": "6.90",
        "moneda": "EUR",
    }


def _direccion_manual() -> dict:
    return {
        "nombre_destinatario": "Lore Local",
        "linea_1": "Calle Luna 1",
        "codigo_postal": "28001",
        "ciudad": "Madrid",
        "provincia": "Madrid",
        "pais_iso": "ES",
    }


def _registrar_cuenta(client) -> dict:
    response = client.post(
        "/api/v1/cuenta/registro/",
        data=json.dumps({"email": "cuenta.local@test.dev", "nombre_visible": "Lore", "password": "ClaveSegura123"}),
        content_type="application/json",
    )
    return response.json()["cuenta"]


def _crear_direccion(client) -> dict:
    response = client.post(
        "/api/v1/cuenta/direcciones/",
        data=json.dumps({**_direccion_manual(), "alias": "Casa", "telefono_contacto": "600111222"}),
        content_type="application/json",
    )
    return response.json()["direccion"]
