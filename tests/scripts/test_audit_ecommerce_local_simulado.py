from __future__ import annotations

import importlib.util
import io
import json
import sys
import textwrap
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory


ROOT_DIR = Path(__file__).resolve().parents[2]
SCRIPT_DIR = ROOT_DIR / "scripts"
SCRIPT_PATH = SCRIPT_DIR / "audit_ecommerce_local_simulado.py"


def _load_module():
    if str(SCRIPT_DIR) not in sys.path:
        sys.path.insert(0, str(SCRIPT_DIR))
    spec = importlib.util.spec_from_file_location("audit_ecommerce_local_simulado_tested", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class AuditoriaEcommerceLocalSimuladoTests(unittest.TestCase):
    def setUp(self) -> None:
        self.module = _load_module()

    def _write(self, root: Path, rel_path: str, content: str) -> None:
        path = root / rel_path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(textwrap.dedent(content).strip() + "\n", encoding="utf-8")

    def _write_base_tree(self, root: Path) -> None:
        self._write(
            root,
            "docs/roadmap_ecommerce_local_simulado.md",
            """
            # Roadmap ecommerce local real con pago simulado
            `/checkout` principal. `/pedido/[id_pedido]` principal. `/mi-cuenta` principal.
            `simulado_local`. Stripe queda reservado. Catalogo vendible.
            `/encargo` Legacy deprecado. `/pedido-demo` Legacy deprecado.
            `PedidoDemo` y `CuentaDemo` como Legacy controlado.
            """,
        )
        self._write(
            root,
            "docs/roadmap_ecommerce_real_v2.md",
            """
            ### V2-R10 - Go-live checklist v2
            - **Estado**: `BLOCKED`.
            - Nota: la fase local no desbloquea `V2-R10` y no activa Stripe ni pagos reales.
            """,
        )
        self._write(root, "docs/90_estado_implementacion.md", "Ecommerce local simulado. V2-R10 bloqueado.")
        self._write(root, "docs/checklist_presentacion_ecommerce_local.md", "Lo que NO se debe prometer\nPago simulado\nV2-R10")
        self._write(root, "docs/operativa_ecommerce_local_simulado.md", "Gate local ecommerce\nsimulado_local")
        self._write(root, "docs/plan_retirada_legacy_demo.md", "Legacy controlado\nFase A\nFase B\nPedidoDemo\nCuentaDemo")
        self._write(
            root,
            "docs/mapa_rutas_ecommerce_local.md",
            """
            /checkout ACTIVA NOINDEX CTA principal
            /pedido/[id_pedido] ACTIVA NOINDEX
            /mi-cuenta ACTIVA NOINDEX
            /encargo LEGACY_DEPRECATED consulta
            /pedido-demo LEGACY_DEPRECATED
            cuenta-demo LEGACY_DEPRECATED
            scripts/check_ecommerce_local_simulado.py
            """,
        )
        self._write(root, "docs/seo_contrato.json", '{"rutas":{"transaccionales_noindex":["/checkout","/pedido/{id_pedido}"]}}')
        self._write(root, "frontend/app/checkout/page.tsx", "export default function Page(){ return <FlujoCheckoutReal /> }")
        self._write(root, "frontend/app/encargo/page.tsx", "export default function Page(){ return null }")
        self._write(root, "frontend/app/pedido/[id_pedido]/page.tsx", "export default function Page(){ return null }")
        self._write(root, "frontend/app/mi-cuenta/page.tsx", "export default function Page(){ return null }")
        self._write(root, "frontend/contenido/shell/navegacionGlobal.ts", 'const ENLACES_BASE_FOOTER = [{ href: "/encargo" }]')
        self._write(root, "frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx", "confirmarPagoSimuladoPedido resolverEsPagoSimuladoLocal")
        self._write(root, "frontend/tests/compra-local-simulada.test.ts", "test")
        self._write(root, "backend/nucleo_herbal/infraestructura/pagos_simulados.py", "class PasarelaPagoSimuladaLocal(PuertoPasarelaPago):\n    proveedor='simulado_local'")
        self._write(root, "backend/configuracion_django/settings.py", "BOTICA_PAYMENT_PROVIDER = 'simulado_local'")
        self._write(root, "backend/nucleo_herbal/aplicacion/casos_de_uso_pago_pedidos.py", "class ConfirmarPagoSimuladoPedido: pass\nProcesarPostPagoPedido")
        self._write(root, "backend/nucleo_herbal/presentacion/publica/urls_pedidos.py", "confirmar-pago-simulado")
        self._write(root, "backend/nucleo_herbal/infraestructura/persistencia_django/admin_pedidos.py", "class PedidoRealAdmin: pass\npago_simulado")
        self._write(root, "scripts/bootstrap_ecommerce_local_simulado.py", "bootstrap")
        self._write(root, "tests/nucleo_herbal/test_catalogo_vendible_local.py", "test")
        self._write(root, "tests/nucleo_herbal/test_regresion_compra_local_simulada.py", "test")
        self._write(root, "tests/scripts/test_check_ecommerce_local_simulado.py", "test")

    def test_auditoria_sin_blockers_con_fixture_valido(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)

            resultados = self.module.evaluar(root)

        self.assertFalse([r for r in resultados if r.severidad == "BLOCKER"])
        self.assertTrue([r for r in resultados if r.codigo == "gate_local" and r.severidad == "WARNING"])
        self.assertTrue([r for r in resultados if r.codigo == "catalogo_vendible" and r.severidad == "OK"])

    def test_detecta_ausencia_roadmap_local(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            (root / "docs" / "roadmap_ecommerce_local_simulado.md").unlink()

            resultados = self.module.evaluar(root)

        codigos = {r.codigo: r for r in resultados}
        self.assertEqual(codigos["documentacion_clave"].severidad, "BLOCKER")
        self.assertEqual(codigos["gate_local"].severidad, "BLOCKER")

    def test_detecta_v2_r10_desbloqueado(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            self._write(root, "docs/roadmap_ecommerce_real_v2.md", "V2-R10 DONE pagos reales activos")

            resultados = self.module.evaluar(root)

        gate = [r for r in resultados if r.codigo == "gate_local"][0]
        self.assertEqual(gate.severidad, "BLOCKER")
        self.assertIn("v2_r10_sigue_bloqueado", gate.detalle)

    def test_detecta_ausencia_adaptador_simulado(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            (root / "backend" / "nucleo_herbal" / "infraestructura" / "pagos_simulados.py").unlink()

            resultados = self.module.evaluar(root)

        gate = [r for r in resultados if r.codigo == "gate_local"][0]
        self.assertEqual(gate.severidad, "BLOCKER")
        self.assertIn("adaptador_pago_simulado", gate.detalle)

    def test_detecta_legacy_no_congelado(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            self._write(root, "docs/plan_retirada_legacy_demo.md", "sin fases")

            resultados = self.module.evaluar(root)

        codigos = {r.codigo: r for r in resultados}
        self.assertEqual(codigos["legacy_congelado"].severidad, "BLOCKER")

    def test_json_incluye_conteo_y_objetivo(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            self.module.ROOT_DIR = root
            buffer = io.StringIO()
            with redirect_stdout(buffer):
                code = self.module.main(["--json"])

        payload = json.loads(buffer.getvalue())
        self.assertEqual(code, 0)
        self.assertEqual(payload["auditoria"], "ecommerce_local_simulado")
        self.assertEqual(payload["objetivo"], "presentacion local, no go-live externo")
        self.assertGreaterEqual(payload["conteo"]["WARNING"], 1)


if __name__ == "__main__":
    unittest.main()
