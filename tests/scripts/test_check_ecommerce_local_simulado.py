from __future__ import annotations

import importlib.util
import io
import json
import os
import sys
import textwrap
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch


SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "check_ecommerce_local_simulado.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("check_ecommerce_local_simulado_tested", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class EcommerceLocalSimuladoGateTests(unittest.TestCase):
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
            `simulado_local`. Stripe queda reservado.
            `/encargo` Legacy deprecado. `/pedido-demo` Legacy deprecado.
            """,
        )
        self._write(
            root,
            "docs/mapa_rutas_ecommerce_local.md",
            """
            /checkout
            /pedido/[id_pedido]
            /mi-cuenta
            LEGACY_DEPRECATED
            NOINDEX
            CTA principal
            scripts/check_ecommerce_local_simulado.py
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
        self._write(root, "docs/seo_contrato.json", '{"rutas":{"transaccionales_noindex":["/checkout","/pedido/{id_pedido}"]}}')
        self._write(root, "frontend/app/checkout/page.tsx", "export default function Page(){ return <FlujoCheckoutReal /> }")
        self._write(root, "frontend/app/encargo/page.tsx", "export default function Page(){ return null }")
        self._write(root, "frontend/app/pedido/[id_pedido]/page.tsx", "export default function Page(){ return null }")
        self._write(root, "frontend/app/mi-cuenta/page.tsx", "export default function Page(){ return null }")
        self._write(root, "frontend/contenido/shell/navegacionGlobal.ts", 'const ENLACES_BASE_FOOTER = [{ href: "/encargo" }]')
        self._write(root, "frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx", "confirmarPagoSimuladoPedido resolverEsPagoSimuladoLocal")
        self._write(root, "frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx", "FlujoCheckoutReal")
        self._write(root, "frontend/contenido/catalogo/checkoutReal.ts", "construirPayloadPedidoReal")
        self._write(root, "frontend/infraestructura/api/pedidos.ts", "crearPedidoPublico")
        self._write(root, "frontend/infraestructura/api/cuentasCliente.ts", "obtenerSesionCuentaCliente")
        self._write(root, "backend/nucleo_herbal/infraestructura/pagos_simulados.py", "class PasarelaPagoSimuladaLocal(PuertoPasarelaPago):\n    proveedor='simulado_local'")
        self._write(root, "backend/configuracion_django/settings.py", "BOTICA_PAYMENT_PROVIDER = 'simulado_local'")
        self._write(root, "backend/nucleo_herbal/aplicacion/casos_de_uso_pago_pedidos.py", "class ConfirmarPagoSimuladoPedido: pass\nProcesarPostPagoPedido")
        self._write(root, "backend/nucleo_herbal/presentacion/publica/urls_pedidos.py", "confirmar-pago-simulado")
        self._write(root, "backend/nucleo_herbal/infraestructura/persistencia_django/admin_pedidos.py", "class PedidoRealAdmin: pass\npago_simulado")

    def test_salida_ok_con_fixture_minimo(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)

            resultados = self.module.evaluar(root)

        self.assertFalse([r for r in resultados if r.severidad == "BLOCKER"])
        self.assertTrue([r for r in resultados if r.codigo == "legacy_visible_documentado" and r.severidad == "WARNING"])
        self.assertTrue([r for r in resultados if r.codigo == "encargo_consulta_secundaria" and r.severidad == "WARNING"])

    def test_blocker_cuando_falta_roadmap_local(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            (root / "docs" / "roadmap_ecommerce_local_simulado.md").unlink()

            resultados = self.module.evaluar(root)

        por_codigo = {r.codigo: r for r in resultados}
        self.assertEqual(por_codigo["roadmap_local_existe"].severidad, "BLOCKER")

    def test_blocker_cuando_falta_mapa_rutas(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            (root / "docs" / "mapa_rutas_ecommerce_local.md").unlink()

            resultados = self.module.evaluar(root)

        por_codigo = {r.codigo: r for r in resultados}
        self.assertEqual(por_codigo["mapa_rutas_local"].severidad, "BLOCKER")

    def test_exit_code_respeta_fail_on(self) -> None:
        resultados = (
            self.module.ResultadoCheck("WARNING", "w", "d", "r", "a"),
            self.module.ResultadoCheck("OK", "ok", "d", "r", "a"),
        )

        self.assertEqual(self.module._exit_code(resultados, "blocker"), 0)
        self.assertEqual(self.module._exit_code(resultados, "warning"), 1)
        self.assertEqual(self.module._exit_code(resultados, "none"), 0)

    def test_json_incluye_conteo_y_objetivo_local(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            self.module.ROOT_DIR = root
            buffer = io.StringIO()
            with redirect_stdout(buffer):
                code = self.module.main(["--json"])

        payload = json.loads(buffer.getvalue())
        self.assertEqual(code, 0)
        self.assertEqual(payload["gate"], "ecommerce_local_simulado")
        self.assertEqual(payload["objetivo"], "validacion local, no go-live externo")
        self.assertGreaterEqual(payload["conteo"]["WARNING"], 1)

    def test_guardrail_bloquea_pedido_demo_en_checkout_real(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            self._write(root, "frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx", "PedidoDemo")

            resultados = self.module.evaluar(root)

        por_codigo = {r.codigo: r for r in resultados}
        self.assertEqual(por_codigo["checkout_real_sin_pedido_demo"].severidad, "BLOCKER")

    def test_guardrail_bloquea_import_de_checkout_demo_en_modulo_real(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            self._write(root, "frontend/contenido/catalogo/checkoutReal.ts", 'import { LineaNoConvertiblePedido } from "./checkoutDemo";')

            resultados = self.module.evaluar(root)

        por_codigo = {r.codigo: r for r in resultados}
        self.assertEqual(por_codigo["checkout_real_sin_pedido_demo"].severidad, "BLOCKER")

    def test_guardrail_advierte_si_checkout_real_usa_helper_encargo(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            self._write(root, "frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx", 'import { resolverContextoPreseleccionado } from "@/contenido/catalogo/encargoConsulta";')

            resultados = self.module.evaluar(root)

        por_codigo = {r.codigo: r for r in resultados}
        self.assertEqual(por_codigo["checkout_real_encargo_consulta_controlada"].severidad, "WARNING")
        self.assertEqual(por_codigo["checkout_real_sin_pedido_demo"].severidad, "OK")

    def test_guardrail_bloquea_cuenta_demo_en_navegacion_principal(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            self._write(
                root,
                "frontend/contenido/shell/navegacionGlobal.ts",
                'export const NAVEGACION_PRINCIPAL = [{ href: "/cuenta-demo" }]\nconst ENLACES_BASE_FOOTER = []',
            )

            resultados = self.module.evaluar(root)

        por_codigo = {r.codigo: r for r in resultados}
        self.assertEqual(por_codigo["navegacion_principal_cuenta_demo"].severidad, "BLOCKER")

    def test_guardrail_permite_encargo_como_consulta_secundaria(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)

            resultados = self.module.evaluar(root)

        por_codigo = {r.codigo: r for r in resultados}
        self.assertEqual(por_codigo["encargo_consulta_secundaria"].severidad, "WARNING")
        self.assertEqual(por_codigo["checkout_real_sin_pedido_demo"].severidad, "OK")

    def test_guardrail_no_rompe_sin_navegacion_opcional(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            (root / "frontend" / "contenido" / "shell" / "navegacionGlobal.ts").unlink()

            resultados = self.module.evaluar(root)

        por_codigo = {r.codigo: r for r in resultados}
        self.assertEqual(por_codigo["navegacion_principal_no_verificable"].severidad, "WARNING")

    def test_gate_local_ok_si_proveedor_entorno_no_esta_configurado(self) -> None:
        with patch.dict(os.environ, {}, clear=True):
            resultados = self.module._check_proveedor_pago_entorno()

        self.assertEqual(resultados[0].severidad, "OK")
        self.assertEqual(resultados[0].codigo, "proveedor_pago_entorno_local")

    def test_gate_local_advierte_si_entorno_usa_stripe(self) -> None:
        with patch.dict(os.environ, {"BOTICA_PAYMENT_PROVIDER": "stripe"}, clear=True):
            resultados = self.module._check_proveedor_pago_entorno()

        self.assertEqual(resultados[0].severidad, "WARNING")
        self.assertIn("stripe", resultados[0].detalle)

    def test_gate_local_bloquea_proveedor_entorno_desconocido(self) -> None:
        with patch.dict(os.environ, {"BOTICA_PAYMENT_PROVIDER": "stripe-real"}, clear=True):
            resultados = self.module._check_proveedor_pago_entorno()

        self.assertEqual(resultados[0].severidad, "BLOCKER")


if __name__ == "__main__":
    unittest.main()
