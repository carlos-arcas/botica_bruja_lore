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
    def _crear_pedido_cancelado_operativa(self, id_pedido: str) -> PedidoRealModelo:
        return PedidoRealModelo.objects.create(
            id_pedido=id_pedido,
            estado="cancelado",
            estado_pago="pagado",
            proveedor_pago="stripe",
            id_externo_pago=f"cs_{id_pedido.lower()}",
            canal_checkout="web_invitado",
            email_contacto=f"{id_pedido.lower()}@lore.test",
            nombre_contacto="Cliente Cancelado",
            telefono_contacto="600333333",
            es_invitado=True,
            moneda="EUR",
            subtotal=Decimal("12.00"),
            direccion_entrega={"nombre_destinatario": "Cliente Cancelado", "linea_1": "Calle Sol 3", "codigo_postal": "28003", "ciudad": "Madrid", "provincia": "Madrid", "pais_iso": "ES"},
            fecha_creacion=datetime(2026, 1, 2, tzinfo=UTC),
            fecha_pago_confirmado=datetime(2026, 1, 2, 1, tzinfo=UTC),
            cancelado_operativa_incidencia_stock=True,
            inventario_descontado=True,
        )

    def _crear_pedido_entregado_pagado(self, id_pedido: str) -> PedidoRealModelo:
        return PedidoRealModelo.objects.create(
            id_pedido=id_pedido,
            estado="entregado",
            estado_pago="pagado",
            canal_checkout="web_invitado",
            email_contacto=f"{id_pedido.lower()}@lore.test",
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

    def test_estado_operativo_aceptada_pendiente_reembolso_y_restitucion(self) -> None:
        pedido = self._crear_pedido_entregado_pagado("PR-DEV-0101")
        devolucion = DevolucionPedidoModelo.objects.create(
            pedido=pedido,
            motivo="Coordinación operativa",
            abierta_por="operador-1",
            estado=DevolucionPedidoModelo.ESTADO_ACEPTADA,
        )
        self.assertEqual(devolucion.reembolso_operativo, "pendiente")
        self.assertEqual(devolucion.restitucion_operativa, "pendiente")
        self.assertFalse(devolucion.esta_resuelta_operativamente)

    def test_aceptada_con_reembolso_y_sin_restitucion_no_resuelta(self) -> None:
        pedido = self._crear_pedido_entregado_pagado("PR-DEV-0102")
        pedido.estado_reembolso = "ejecutado"
        pedido.fecha_reembolso = datetime(2026, 1, 4, tzinfo=UTC)
        pedido.id_externo_reembolso = "re_ok_1"
        pedido.save(update_fields=["estado_reembolso", "fecha_reembolso", "id_externo_reembolso"])
        devolucion = DevolucionPedidoModelo.objects.create(
            pedido=pedido,
            motivo="Solo reembolso",
            abierta_por="operador-1",
            estado=DevolucionPedidoModelo.ESTADO_ACEPTADA,
        )
        self.assertEqual(devolucion.reembolso_operativo, "ejecutado")
        self.assertEqual(devolucion.restitucion_operativa, "pendiente")
        self.assertFalse(devolucion.esta_resuelta_operativamente)

    def test_aceptada_con_restitucion_y_sin_reembolso_no_resuelta(self) -> None:
        pedido = self._crear_pedido_entregado_pagado("PR-DEV-0103")
        pedido.inventario_restituido = True
        pedido.fecha_restitucion_inventario = datetime(2026, 1, 4, tzinfo=UTC)
        pedido.save(update_fields=["inventario_restituido", "fecha_restitucion_inventario"])
        devolucion = DevolucionPedidoModelo.objects.create(
            pedido=pedido,
            motivo="Solo restitución",
            abierta_por="operador-1",
            estado=DevolucionPedidoModelo.ESTADO_ACEPTADA,
        )
        self.assertEqual(devolucion.reembolso_operativo, "pendiente")
        self.assertEqual(devolucion.restitucion_operativa, "ejecutada")
        self.assertFalse(devolucion.esta_resuelta_operativamente)

    def test_aceptada_con_reembolso_y_restitucion_resuelta(self) -> None:
        pedido = self._crear_pedido_entregado_pagado("PR-DEV-0104")
        pedido.estado_reembolso = "ejecutado"
        pedido.fecha_reembolso = datetime(2026, 1, 4, tzinfo=UTC)
        pedido.id_externo_reembolso = "re_ok_2"
        pedido.inventario_restituido = True
        pedido.fecha_restitucion_inventario = datetime(2026, 1, 4, tzinfo=UTC)
        pedido.save(
            update_fields=[
                "estado_reembolso",
                "fecha_reembolso",
                "id_externo_reembolso",
                "inventario_restituido",
                "fecha_restitucion_inventario",
            ]
        )
        devolucion = DevolucionPedidoModelo.objects.create(
            pedido=pedido,
            motivo="Resolución completa",
            abierta_por="operador-1",
            estado=DevolucionPedidoModelo.ESTADO_ACEPTADA,
        )
        self.assertTrue(devolucion.esta_resuelta_operativamente)

    def test_admin_acciones_coordinadas_omite_no_elegibles(self) -> None:
        devolucion_abierta = DevolucionPedidoModelo.objects.create(
            pedido=self.pedido_entregado,
            motivo="No aceptada",
            abierta_por="operador-1",
        )
        self.client.force_login(self.admin)
        respuesta = self.client.post(
            reverse("admin:persistencia_django_devolucionpedidomodelo_changelist"),
            {
                "action": "ejecutar_reembolso_manual_desde_devolucion",
                "_selected_action": [str(devolucion_abierta.pk)],
            },
            follow=True,
        )
        self.assertEqual(respuesta.status_code, 200)
        self.pedido_entregado.refresh_from_db()
        self.assertEqual(self.pedido_entregado.estado_reembolso, "no_iniciado")
