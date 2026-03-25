from datetime import UTC, datetime
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.urls import reverse

from backend.nucleo_herbal.infraestructura.persistencia_django.models import DevolucionPedidoModelo, PedidoRealModelo


class TestDevolucionesPostventaManual(TestCase):
    @classmethod
    def setUpTestData(cls) -> None:
        cls.admin = get_user_model().objects.create_superuser("admin_devol", "admin_devol@botica.dev", "demo-admin")
        cls.pedido_entregado = PedidoRealModelo.objects.create(
            id_pedido="PR-DEV-0001",
            estado="entregado",
            estado_pago="pagado",
            canal_checkout="web_invitado",
            email_contacto="entregado@lore.test",
            nombre_contacto="Cliente Entregado",
            telefono_contacto="600111111",
            es_invitado=True,
            moneda="EUR",
            subtotal=Decimal("20.00"),
            direccion_entrega={"nombre_destinatario": "Cliente Entregado", "linea_1": "Calle Sol 1", "codigo_postal": "28001", "ciudad": "Madrid", "provincia": "Madrid", "pais_iso": "ES"},
            fecha_creacion=datetime(2026, 1, 1, tzinfo=UTC),
            fecha_pago_confirmado=datetime(2026, 1, 1, 1, tzinfo=UTC),
            fecha_entrega=datetime(2026, 1, 3, tzinfo=UTC),
        )
        cls.pedido_pendiente = PedidoRealModelo.objects.create(
            id_pedido="PR-DEV-0002",
            estado="pendiente_pago",
            estado_pago="pendiente",
            canal_checkout="web_invitado",
            email_contacto="pendiente@lore.test",
            nombre_contacto="Cliente Pendiente",
            telefono_contacto="600222222",
            es_invitado=True,
            moneda="EUR",
            subtotal=Decimal("10.00"),
            direccion_entrega={"nombre_destinatario": "Cliente Pendiente", "linea_1": "Calle Sol 2", "codigo_postal": "28002", "ciudad": "Madrid", "provincia": "Madrid", "pais_iso": "ES"},
            fecha_creacion=datetime(2026, 1, 1, tzinfo=UTC),
        )

    def test_creacion_valida_devolucion_manual(self) -> None:
        devolucion = DevolucionPedidoModelo.objects.create(
            pedido=self.pedido_entregado,
            motivo="Producto dañado en tránsito",
            abierta_por="operador-1",
        )

        self.assertEqual(devolucion.estado, DevolucionPedidoModelo.ESTADO_ABIERTA)
        self.assertEqual(devolucion.pedido_id, "PR-DEV-0001")
        self.assertEqual(devolucion.abierta_por, "operador-1")
        self.assertIsNotNone(devolucion.fecha_apertura)

    def test_rechaza_apertura_en_estado_no_elegible(self) -> None:
        with self.assertRaises(ValidationError):
            DevolucionPedidoModelo.objects.create(
                pedido=self.pedido_pendiente,
                motivo="No elegible todavía",
                abierta_por="operador-2",
            )

    def test_transicion_valida(self) -> None:
        devolucion = DevolucionPedidoModelo.objects.create(
            pedido=self.pedido_entregado,
            motivo="Falta un componente",
            abierta_por="operador-1",
        )
        devolucion.estado = DevolucionPedidoModelo.ESTADO_RECIBIDA
        devolucion.revisada_por = "operador-2"
        devolucion.save()

        devolucion.refresh_from_db()
        self.assertEqual(devolucion.estado, DevolucionPedidoModelo.ESTADO_RECIBIDA)
        self.assertEqual(devolucion.revisada_por, "operador-2")

    def test_rechaza_transicion_invalida(self) -> None:
        devolucion = DevolucionPedidoModelo.objects.create(
            pedido=self.pedido_entregado,
            motivo="Cambio inválido",
            abierta_por="operador-1",
        )
        devolucion.estado = DevolucionPedidoModelo.ESTADO_ACEPTADA
        with self.assertRaises(ValidationError):
            devolucion.save()

    def test_persistencia_y_trazabilidad_minima(self) -> None:
        devolucion = DevolucionPedidoModelo.objects.create(
            pedido=self.pedido_entregado,
            motivo="Prueba trazabilidad",
            abierta_por="operador-auditoria",
            observaciones="Ticket #123",
        )

        guardada = DevolucionPedidoModelo.objects.get(pk=devolucion.pk)
        self.assertEqual(guardada.observaciones, "Ticket #123")
        self.assertEqual(guardada.abierta_por, "operador-auditoria")
        self.assertIsNotNone(guardada.fecha_actualizacion)

    def test_admin_muestra_y_acciona_transicion(self) -> None:
        devolucion = DevolucionPedidoModelo.objects.create(
            pedido=self.pedido_entregado,
            motivo="Desde admin",
            abierta_por="operador-1",
        )
        self.client.force_login(self.admin)

        changelist = self.client.get(
            reverse("admin:persistencia_django_devolucionpedidomodelo_changelist"),
            {"q": "PR-DEV-0001"},
        )
        self.assertEqual(changelist.status_code, 200)
        self.assertContains(changelist, "PR-DEV-0001")

        respuesta = self.client.post(
            reverse("admin:persistencia_django_devolucionpedidomodelo_changelist"),
            {
                "action": "marcar_devolucion_recibida",
                "_selected_action": [str(devolucion.pk)],
            },
            follow=True,
        )
        self.assertEqual(respuesta.status_code, 200)
        devolucion.refresh_from_db()
        self.assertEqual(devolucion.estado, DevolucionPedidoModelo.ESTADO_RECIBIDA)
        self.assertEqual(devolucion.revisada_por, "admin_devol")
