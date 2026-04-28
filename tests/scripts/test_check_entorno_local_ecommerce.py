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


SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "check_entorno_local_ecommerce.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("check_entorno_local_ecommerce_tested", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class CheckEntornoLocalEcommerceTests(unittest.TestCase):
    def setUp(self) -> None:
        self.module = _load_module()

    def _write(self, root: Path, rel_path: str, content: str = "ok") -> None:
        path = root / rel_path
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(textwrap.dedent(content).strip() + "\n", encoding="utf-8")

    def _base_tree(self, root: Path) -> None:
        for rel_path in (
            "manage.py",
            "requirements.txt",
            "setup_entorno.bat",
            "run_app.bat",
            "scripts/bootstrap_ecommerce_local_simulado.py",
            "scripts/check_ecommerce_local_simulado.py",
            "docs/operativa_ecommerce_local_simulado.md",
        ):
            self._write(root, rel_path)
        self._write(
            root,
            ".env.example",
            """
            DEBUG=true
            LOG_LEVEL=INFO
            BOTICA_PAYMENT_PROVIDER=simulado_local
            PUBLIC_SITE_URL=http://127.0.0.1:3000
            DEFAULT_FROM_EMAIL=no-reply@botica-lore.local
            EMAIL_BACKEND=django.core.mail.backends.locmem.EmailBackend
            ENVIO_ESTANDAR_IMPORTE=4.90
            STRIPE_SECRET_KEY=
            """,
        )
        self._write(
            root,
            "frontend/.env.example",
            """
            NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
            NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
            NEXT_PUBLIC_ANALITICA_LOCAL=false
            NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
            """,
        )
        self._write(
            root,
            "frontend/package.json",
            """
            {
              "scripts": {
                "dev": "next dev",
                "build": "next build",
                "lint": "next lint",
                "test:checkout-real": "node ok",
                "test:compra-local": "node ok",
                "test:cesta": "node ok",
                "test:cuenta-cliente": "node ok"
              }
            }
            """,
        )
        self._write(
            root,
            "docs/checklist_entorno_local_ecommerce.md",
            """
            BOTICA_PAYMENT_PROVIDER=simulado_local
            setup_entorno.bat --check
            manage.py migrate
            scripts/bootstrap_ecommerce_local_simulado.py --dry-run
            npm --prefix frontend run dev
            scripts/check_ecommerce_local_simulado.py
            python scripts/check_entorno_local_ecommerce.py
            V2-R10
            """,
        )

    def test_fixture_minimo_sin_blockers(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._base_tree(root)

            resultados = self.module.evaluar(root)

        self.assertFalse([r for r in resultados if r.severidad == "BLOCKER"])

    def test_blocker_si_falta_env_raiz(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._base_tree(root)
            (root / ".env.example").unlink()

            resultados = self.module.evaluar(root)

        por_codigo = {r.codigo: r for r in resultados}
        self.assertEqual(por_codigo["env_backend_local"].severidad, "BLOCKER")

    def test_blocker_si_falta_script_frontend_critico(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._base_tree(root)
            self._write(root, "frontend/package.json", '{"scripts":{"dev":"next dev"}}')

            resultados = self.module.evaluar(root)

        por_codigo = {r.codigo: r for r in resultados}
        self.assertEqual(por_codigo["scripts_frontend_criticos"].severidad, "BLOCKER")

    def test_proveedor_stripe_es_warning(self) -> None:
        with patch.dict(os.environ, {"BOTICA_PAYMENT_PROVIDER": "stripe"}, clear=True):
            resultados = self.module._check_proveedor_entorno()

        self.assertEqual(resultados[0].severidad, "WARNING")

    def test_json_incluye_contrato(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._base_tree(root)
            self.module.ROOT_DIR = root
            buffer = io.StringIO()
            with redirect_stdout(buffer):
                code = self.module.main(["--json"])

        payload = json.loads(buffer.getvalue())
        self.assertEqual(code, 0)
        self.assertEqual(payload["check"], "entorno_local_ecommerce_simulado")
        self.assertGreaterEqual(payload["conteo"]["OK"], 1)


if __name__ == "__main__":
    unittest.main()
