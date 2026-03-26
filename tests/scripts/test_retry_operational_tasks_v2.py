from __future__ import annotations

import importlib.util
import io
import json
import sys
from contextlib import redirect_stdout
from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import patch

from django.core import mail
from django.test import TestCase

from backend.nucleo_herbal.infraestructura.persistencia_django.models_pedidos import LineaPedidoRealModelo, PedidoRealModelo

SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "retry_operational_tasks_v2.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("retry_operational_tasks_v2_tested", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class RetryOperationalTasksV2Tests(TestCase):
    def setUp(self) -> None:
        self.module = _load_module()

    def test_dry_run_lista_candidatos_sin_mutar(self) -> None:
        pedido = self._crear_pedido("PED-DRY", estado="pagado", estado_pago="pagado")

        with patch.object(sys, "argv", ["retry_operational_tasks_v2.py", "--task", "email_post_pago", "--dry-run", "--json"]):
            out = io.StringIO()
            with redirect_stdout(out):
                code = self.module.main()

        self.assertEqual(code, 0)
        pedido.refresh_from_db()
        self.assertFalse(pedido.email_post_pago_enviado)
        self.assertEqual(len(mail.outbox), 0)
        payload = json.loads(out.getvalue())
        self.assertEqual(payload["resumen"]["candidate"], 1)
        self.assertEqual(payload["resultados"][0]["resultado"], "candidate")

    def test_ejecucion_real_procesa_solo_elegibles(self) -> None:
        elegible = self._crear_pedido("PED-OK", estado="pagado", estado_pago="pagado")
        self._crear_pedido("PED-NO", estado="pagado", estado_pago="pagado", incidencia_stock_confirmacion=True)

        with patch.object(sys, "argv", ["retry_operational_tasks_v2.py", "--task", "email_post_pago", "--json"]):
            out = io.StringIO()
            with redirect_stdout(out):
                code = self.module.main()

        self.assertEqual(code, 0)
        elegible.refresh_from_db()
        self.assertTrue(elegible.email_post_pago_enviado)
        payload = json.loads(out.getvalue())
        self.assertEqual(payload["resumen"]["ok"], 1)
        self.assertEqual(payload["resumen"]["error"], 0)
        self.assertEqual(len(mail.outbox), 1)

    def test_reejecucion_no_duplica_efectos(self) -> None:
        pedido = self._crear_pedido("PED-RERUN", estado="pagado", estado_pago="pagado")
        for _ in range(2):
            with patch.object(sys, "argv", ["retry_operational_tasks_v2.py", "--task", "email_post_pago"]):
                self.assertEqual(self.module.main(), 0)
        pedido.refresh_from_db()
        self.assertTrue(pedido.email_post_pago_enviado)
        self.assertEqual(len(mail.outbox), 1)

    def test_tareas_no_elegibles_se_omiten_en_ejecucion(self) -> None:
        pedido = self._crear_pedido("PED-SKIP", estado="pagado", estado_pago="pagado")
        with patch.object(self.module, "_is_still_eligible", return_value=False):
            resultado = self.module._process_candidate(
                self.module.RetryCandidate(task="email_post_pago", pedido_id=pedido.id_pedido, motivo="x"),
                self.module.RepositorioPedidosORM(),
                self.module.NotificadorEmailPostPago(),
            )

        self.assertEqual(resultado.resultado, "skip")
        self.assertIn("no_elegible", resultado.detalle)
        pedido.refresh_from_db()
        self.assertFalse(pedido.email_post_pago_enviado)

    def test_salida_texto_es_clara_y_verificable(self) -> None:
        self._crear_pedido("PED-TEXT", estado="cancelado", estado_reembolso="ejecutado", cancelado_operativa_incidencia_stock=True)

        with patch.object(sys, "argv", ["retry_operational_tasks_v2.py", "--task", "email_reembolso"]):
            out = io.StringIO()
            with redirect_stdout(out):
                code = self.module.main()

        self.assertEqual(code, 0)
        salida = out.getvalue()
        self.assertIn("Retry operational tasks V2", salida)
        self.assertIn("email_reembolso", salida)
        self.assertIn("ok", salida)

    def _crear_pedido(
        self,
        pedido_id: str,
        *,
        estado: str,
        estado_pago: str = "pendiente",
        incidencia_stock_confirmacion: bool = False,
        estado_reembolso: str = "no_iniciado",
        cancelado_operativa_incidencia_stock: bool = False,
    ) -> PedidoRealModelo:
        pedido = PedidoRealModelo.objects.create(
            id_pedido=pedido_id,
            estado=estado,
            estado_pago=estado_pago,
            canal_checkout="web_invitado",
            email_contacto="ops@test.dev",
            nombre_contacto="Ops",
            telefono_contacto="+34000000000",
            es_invitado=True,
            subtotal="10.00",
            importe_envio="2.00",
            direccion_entrega={"nombre_destinatario": "Lore", "linea_1": "Calle 1", "codigo_postal": "28001", "ciudad": "Madrid", "provincia": "Madrid", "pais_iso": "ES"},
            fecha_creacion=datetime.now(tz=UTC),
            fecha_pago_confirmado=datetime.now(tz=UTC) if estado_pago == "pagado" else None,
            incidencia_stock_confirmacion=incidencia_stock_confirmacion,
            estado_reembolso=estado_reembolso,
            cancelado_operativa_incidencia_stock=cancelado_operativa_incidencia_stock,
            fecha_reembolso=datetime.now(tz=UTC) if estado_reembolso == "ejecutado" else None,
            id_externo_reembolso="re-test-1" if estado_reembolso == "ejecutado" else "",
            fecha_cancelacion_operativa=datetime.now(tz=UTC) if cancelado_operativa_incidencia_stock else None,
            motivo_cancelacion_operativa="Motivo" if cancelado_operativa_incidencia_stock else "",
        )
        LineaPedidoRealModelo.objects.create(
            pedido=pedido,
            id_producto="prod-1",
            slug_producto="prod-1",
            nombre_producto="Producto 1",
            cantidad=1,
            cantidad_comercial=1,
            unidad_comercial="ud",
            precio_unitario="10.00",
            moneda="EUR",
        )
        return pedido
