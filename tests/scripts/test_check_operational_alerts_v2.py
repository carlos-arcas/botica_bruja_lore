from __future__ import annotations

import importlib.util
import io
import sys
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "check_operational_alerts_v2.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("check_operational_alerts_v2_tested", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class CheckOperationalAlertsV2Tests(unittest.TestCase):
    def setUp(self) -> None:
        self.module = _load_module()

    def test_reconciliation_blockers_se_transforman_en_alertas(self) -> None:
        payload = {
            "hallazgos": [
                {
                    "severidad": "BLOCKER",
                    "codigo": "pedido_pagado_sin_descuento_ni_incidencia_stock",
                    "id_pedido": "ped-1",
                    "detalle": "detalle",
                    "accion_sugerida": "accion",
                },
                {
                    "severidad": "WARNING",
                    "codigo": "email_post_pago_pendiente",
                    "id_pedido": "ped-1",
                    "detalle": "detalle",
                    "accion_sugerida": "accion",
                },
            ]
        }
        with patch.object(self.module, "_run_json_script", return_value=(0, payload, "ok")):
            alertas = self.module._reconciliation_alerts(20)

        self.assertEqual(len(alertas), 1)
        self.assertEqual(alertas[0].severidad, "BLOCKER")
        self.assertEqual(alertas[0].codigo, "conciliacion_pedido_pagado_sin_descuento_ni_incidencia_stock")

    def test_no_false_positive_sin_alertas(self) -> None:
        with (
            patch.object(self.module, "_query_stock_reviews", return_value=()),
            patch.object(self.module, "_query_reembolsos_fallidos", return_value=()),
            patch.object(self.module, "_query_devoluciones_pendientes", return_value=()),
            patch.object(self.module, "_reconciliation_alerts", return_value=()),
            patch.object(self.module, "_readiness_alerts", return_value=()),
        ):
            alertas = self.module._collect_alerts(100, 100)

        self.assertEqual(alertas, ())

    def test_json_resume_y_codigos(self) -> None:
        alerta = self.module.AlertaOperativa(
            severidad="WARNING",
            codigo="reembolso_fallido_pendiente_accion",
            entidad_tipo="pedido",
            entidad_id="ped-2",
            mensaje="msg",
            accion_sugerida="accion",
            fuente="pedido_estado",
        )
        with patch.object(self.module, "_collect_alerts", return_value=(alerta,)):
            with patch.object(sys, "argv", ["check_operational_alerts_v2.py", "--json", "--fail-on", "none"]):
                buffer = io.StringIO()
                with redirect_stdout(buffer):
                    code = self.module.main()

        salida = buffer.getvalue()
        self.assertEqual(code, 0)
        self.assertIn('"resumen"', salida)
        self.assertIn('"WARNING": 1', salida)
        self.assertIn("reembolso_fallido_pendiente_accion", salida)

    def test_exit_code_fail_on_blocker_warning_none(self) -> None:
        blocker = self.module.AlertaOperativa("BLOCKER", "c", "pedido", "p", "m", "a", "f")
        warning = self.module.AlertaOperativa("WARNING", "w", "pedido", "p", "m", "a", "f")

        self.assertEqual(self.module._exit_code((warning,), "none"), 0)
        self.assertEqual(self.module._exit_code((warning,), "warning"), 1)
        self.assertEqual(self.module._exit_code((warning,), "blocker"), 0)
        self.assertEqual(self.module._exit_code((blocker,), "blocker"), 1)


if __name__ == "__main__":
    unittest.main()
