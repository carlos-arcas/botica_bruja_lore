from __future__ import annotations

import importlib.util
import io
import sys
import textwrap
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from tempfile import TemporaryDirectory


SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "check_repo_operational_integrity.py"


def _load_module():
    spec = importlib.util.spec_from_file_location("check_repo_operational_integrity_tested", SCRIPT_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


class RepoOperationalIntegrityTests(unittest.TestCase):
    def setUp(self) -> None:
        self.module = _load_module()

    def _write_base_tree(self, root: Path) -> None:
        (root / "docs").mkdir(parents=True)
        (root / ".github" / "workflows").mkdir(parents=True)
        (root / "backend" / "configuracion_django").mkdir(parents=True)
        (root / "frontend").mkdir(parents=True)

        markdown = textwrap.dedent(
            """
            # Titulo

            ```bash
            echo ok
            ```
            """
        ).lstrip() + "\n"

        (root / "docs" / "deploy_railway.md").write_text(markdown, encoding="utf-8")
        (root / "docs" / "13_testing_ci_y_quality_gate.md").write_text(
            markdown + "Comando canónico: python scripts/check_release_gate.py\n",
            encoding="utf-8",
        )
        (root / "docs" / "90_estado_implementacion.md").write_text(markdown, encoding="utf-8")

        (root / "Procfile").write_text(
            "web: gunicorn backend.configuracion_django.wsgi:application\n", encoding="utf-8"
        )
        (root / "manage.py").write_text(
            'import os\nos.environ["DJANGO_SETTINGS_MODULE"] = "backend.configuracion_django.settings"\n',
            encoding="utf-8",
        )
        (root / "backend" / "configuracion_django" / "wsgi.py").write_text(
            'import os\nos.environ["DJANGO_SETTINGS_MODULE"] = "backend.configuracion_django.settings"\n',
            encoding="utf-8",
        )

        (root / "backend" / "railway.toml").write_text(
            textwrap.dedent(
                """
                [build]
                builder = "NIXPACKS"

                [deploy]
                startCommand = "gunicorn backend.configuracion_django.wsgi:application"
                healthcheckPath = "/healthz"
                """
            ).strip()
            + "\n",
            encoding="utf-8",
        )
        (root / "frontend" / "railway.toml").write_text(
            textwrap.dedent(
                """
                [build]
                builder = "NIXPACKS"

                [deploy]
                startCommand = "npm run start"
                """
            ).strip()
            + "\n",
            encoding="utf-8",
        )

        (root / ".env.railway.example").write_text(
            textwrap.dedent(
                """
                SECRET_KEY=
                DEBUG=false
                ALLOWED_HOSTS=
                CSRF_TRUSTED_ORIGINS=
                DATABASE_URL=${{SERVICE_NAME.DATABASE_URL}}
                NEXT_PUBLIC_API_BASE_URL=
                APP_DEBUG=
                DJANGO_SETTINGS_MODULE=
                WSGI_APPLICATION=
                """
            ).strip()
            + "\n",
            encoding="utf-8",
        )
        (root / ".github" / "workflows" / "quality_gate.yml").write_text(
            "- run: python scripts/check_release_gate.py\n",
            encoding="utf-8",
        )

    def _run_with_root(self, root: Path) -> tuple[int, str]:
        output = io.StringIO()
        self.module.ROOT_DIR = root
        with redirect_stdout(output):
            code = self.module.main()
        return code, output.getvalue()

    def test_healthy_minimal_repo_returns_ok(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            code, output = self._run_with_root(root)
            self.assertEqual(code, 0)
            self.assertIn("Integridad operativa/documental validada", output)

    def test_markdown_unbalanced_fences_fails(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            (root / "docs" / "deploy_railway.md").write_text("```\nincompleto\n", encoding="utf-8")
            code, output = self._run_with_root(root)
            self.assertEqual(code, 1)
            self.assertIn("fences", output)

    def test_unwanted_artifact_fails(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            (root / "docs" / "90_estado_implementacion.md").write_text("texto 【F:x†L1}\n", encoding="utf-8")
            code, output = self._run_with_root(root)
            self.assertEqual(code, 1)
            self.assertIn("artefacto indeseado", output)

    def test_ci_docs_command_incoherence_fails(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            (root / ".github" / "workflows" / "quality_gate.yml").write_text("- run: python manage.py test\n", encoding="utf-8")
            code, output = self._run_with_root(root)
            self.assertEqual(code, 1)
            self.assertIn("quality_gate.yml", output)

    def test_railway_env_example_inconsistency_fails(self) -> None:
        with TemporaryDirectory() as tempdir:
            root = Path(tempdir)
            self._write_base_tree(root)
            (root / ".env.railway.example").write_text("DEBUG=false\n", encoding="utf-8")
            code, output = self._run_with_root(root)
            self.assertEqual(code, 1)
            self.assertIn(".env.railway.example", output)


if __name__ == "__main__":
    unittest.main()
