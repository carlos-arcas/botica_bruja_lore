from __future__ import annotations

import importlib.util
import io
import sys
import unittest
from contextlib import redirect_stdout
from pathlib import Path


SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "check_operational_reconciliation.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("check_operational_reconciliation_tested", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class OperationalReconciliationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.module = _load_module()

    def _pedido(self, **overrides):
        base = dict(
            id_pedido="ped-1",
            estado="pagado",
            estado_pago="pagado",
            inventario_descontado=True,
            incidencia_stock_confirmacion=False,
            cancelado_operativa_incidencia_stock=False,
            estado_reembolso="no_iniciado",
            inventario_restituido=False,
            transportista="",
            codigo_seguimiento="",
            envio_sin_seguimiento=False,
            fecha_envio=None,
            fecha_entrega=None,
            email_post_pago_enviado=True,
            email_envio_enviado=False,
            email_cancelacion_enviado=False,
            email_reembolso_enviado=False,
        )
        base.update(overrides)
        return self.module.PedidoSnapshot(**base)

    def test_detecta_error_stock_y_warning_email_post_pago(self) -> None:
        pedido = self._pedido(inventario_descontado=False, email_post_pago_enviado=False)

        hallazgos = self.module._evaluar((pedido,), set())

        codigos = {h.codigo for h in hallazgos}
        self.assertIn("pedido_pagado_sin_descuento_ni_incidencia_stock", codigos)
        self.assertIn("email_post_pago_pendiente", codigos)

    def test_no_falsos_positivos_en_pedido_cancelado_consistente(self) -> None:
        pedido = self._pedido(
            estado="cancelado",
            inventario_descontado=True,
            incidencia_stock_confirmacion=True,
            cancelado_operativa_incidencia_stock=True,
            estado_reembolso="ejecutado",
            inventario_restituido=True,
            email_cancelacion_enviado=True,
            email_reembolso_enviado=True,
        )

        hallazgos = self.module._evaluar((pedido,), {"ped-1"})

        self.assertEqual(hallazgos, ())

    def test_detecta_inconsistencia_ledger_restitucion(self) -> None:
        pedido = self._pedido(
            estado="cancelado",
            inventario_restituido=True,
            cancelado_operativa_incidencia_stock=True,
            estado_reembolso="ejecutado",
            email_cancelacion_enviado=True,
            email_reembolso_enviado=True,
        )

        hallazgos = self.module._evaluar((pedido,), set())

        codigos = {h.codigo for h in hallazgos}
        self.assertIn("inventario_restituido_sin_ledger_restitucion", codigos)

    def test_exit_code_respeta_fail_on(self) -> None:
        hallazgos = (
            self.module.Inconsistencia("WARNING", "w", "ped-1", "d", "a"),
            self.module.Inconsistencia("ERROR", "e", "ped-1", "d", "a"),
        )

        self.assertEqual(self.module._code_for_findings(hallazgos, "error"), 1)
        self.assertEqual(self.module._code_for_findings(hallazgos, "warning"), 1)
        self.assertEqual(self.module._code_for_findings(hallazgos, "none"), 0)

    def test_salida_texto_incluye_severidades_y_codigos(self) -> None:
        hallazgos = (
            self.module.Inconsistencia("ERROR", "codigo_error", "ped-1", "detalle", "accion"),
            self.module.Inconsistencia("WARNING", "codigo_warning", "ped-2", "detalle", "accion"),
        )

        buffer = io.StringIO()
        with redirect_stdout(buffer):
            self.module._print_text(hallazgos, 2)
        salida = buffer.getvalue()

        self.assertIn("[ERROR]", salida)
        self.assertIn("codigo_error", salida)
        self.assertIn("[WARNING]", salida)
        self.assertIn("codigo_warning", salida)


if __name__ == "__main__":
    unittest.main()
