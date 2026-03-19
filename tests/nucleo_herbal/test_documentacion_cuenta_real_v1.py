from pathlib import Path
from unittest import TestCase


class DocumentacionCuentaRealV1Tests(TestCase):
    def test_documentacion_refleja_cuenta_real_y_legado_demo(self) -> None:
        estado = Path("docs/90_estado_implementacion.md").read_text(encoding="utf-8")
        migracion = Path("docs/17_migracion_ecommerce_real.md").read_text(encoding="utf-8")

        self.assertIn("cuenta real v1", estado.lower())
        self.assertIn("cuentademo", migracion.lower())
        self.assertIn("legado controlado", migracion.lower())
