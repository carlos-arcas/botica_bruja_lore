from __future__ import annotations

import json

from django.contrib.auth import get_user_model
from django.test import Client, TestCase

from backend.nucleo_herbal.infraestructura.persistencia_django.models import ProductoModelo
from backend.nucleo_herbal.infraestructura.persistencia_django.models_inventario import InventarioProductoModelo, MovimientoInventarioModelo
from backend.nucleo_herbal.presentacion.backoffice_auth import crear_token_backoffice


class BackofficeInventarioTests(TestCase):
    def setUp(self) -> None:
        self.client = Client()
        user_model = get_user_model()
        self.staff = user_model.objects.create_user(username="staff-inv", password="x", is_staff=True, is_active=True)
        self.no_staff = user_model.objects.create_user(username="nostaff-inv", password="x", is_staff=False, is_active=True)
        self.producto = ProductoModelo.objects.create(
            id="prod-inv-1",
            sku="INV-001",
            slug="producto-inv-1",
            nombre="Producto inventario",
            tipo_producto="hierbas-a-granel",
            categoria_comercial="botica",
            seccion_publica="botica-natural",
            publicado=True,
        )
        self.inventario = InventarioProductoModelo.objects.create(
            producto=self.producto,
            cantidad_disponible=20,
            unidad_base="g",
            umbral_bajo_stock=8,
        )
        MovimientoInventarioModelo.objects.create(
            inventario=self.inventario,
            tipo_movimiento="alta_inicial",
            cantidad=20,
            unidad_base="g",
            referencia="inventario_inicial",
            operation_id="seed-1",
        )

    def _auth(self, staff: bool = True) -> dict[str, str]:
        user = self.staff if staff else self.no_staff
        return {"HTTP_AUTHORIZATION": f"Bearer {crear_token_backoffice(user)}"}

    def test_listado_inventario_devuelve_contrato_operativo(self) -> None:
        respuesta = self.client.get("/api/v1/backoffice/inventario/", **self._auth())

        self.assertEqual(respuesta.status_code, 200)
        body = respuesta.json()
        self.assertEqual(body["metricas"]["total"], 1)
        item = body["items"][0]
        self.assertEqual(item["id_producto"], self.producto.id)
        self.assertEqual(item["unidad_base"], "g")
        self.assertEqual(item["cantidad_disponible"], 20)
        self.assertEqual(item["umbral_bajo_stock"], 8)

    def test_detalle_inventario_devuelve_ledger_minimo(self) -> None:
        respuesta = self.client.get(f"/api/v1/backoffice/inventario/{self.producto.id}/", **self._auth())

        self.assertEqual(respuesta.status_code, 200)
        body = respuesta.json()
        self.assertEqual(body["item"]["producto_nombre"], "Producto inventario")
        self.assertEqual(len(body["movimientos"]), 1)
        self.assertEqual(body["movimientos"][0]["tipo_movimiento"], "alta_inicial")
        self.assertEqual(body["movimientos"][0]["cantidad"], 20)

    def test_ajuste_manual_desde_api_privada_actualiza_stock_y_ledger(self) -> None:
        respuesta = self.client.post(
            f"/api/v1/backoffice/inventario/{self.producto.id}/ajustar/",
            data=json.dumps({"delta": -5}),
            content_type="application/json",
            **self._auth(),
        )

        self.assertEqual(respuesta.status_code, 200)
        self.inventario.refresh_from_db()
        self.assertEqual(self.inventario.cantidad_disponible, 15)
        movimientos = MovimientoInventarioModelo.objects.filter(inventario=self.inventario).order_by("-fecha_creacion", "-id")
        self.assertEqual(movimientos.count(), 2)
        self.assertEqual(movimientos.first().tipo_movimiento, "ajuste_manual")
        self.assertEqual(movimientos.first().cantidad, -5)

    def test_ajuste_invalido_rechaza_y_no_rompe_ledger_existente(self) -> None:
        previo = MovimientoInventarioModelo.objects.filter(inventario=self.inventario).count()

        respuesta = self.client.post(
            f"/api/v1/backoffice/inventario/{self.producto.id}/ajustar/",
            data=json.dumps({"delta": -999}),
            content_type="application/json",
            **self._auth(),
        )

        self.assertEqual(respuesta.status_code, 400)
        self.assertIn("stock negativo", respuesta.json()["detalle"])
        self.inventario.refresh_from_db()
        self.assertEqual(self.inventario.cantidad_disponible, 20)
        self.assertEqual(MovimientoInventarioModelo.objects.filter(inventario=self.inventario).count(), previo)

    def test_backoffice_inventario_exige_staff(self) -> None:
        respuesta = self.client.get("/api/v1/backoffice/inventario/", **self._auth(staff=False))

        self.assertEqual(respuesta.status_code, 403)
        self.assertIn("operation_id", respuesta.json())
