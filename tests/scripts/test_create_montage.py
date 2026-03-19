import tempfile
import unittest
from pathlib import Path

from PIL import Image

from create_montage import ErrorMontaje, create_montage


class CreateMontageTests(unittest.TestCase):
    def test_create_montage_contiene_imagenes_heterogeneas_sin_recorte(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            base = Path(tmp_dir)
            rutas = [
                self._crear_imagen(base / "uno.png", (100, 100), (255, 0, 0, 255)),
                self._crear_imagen(base / "dos.png", (200, 50), (0, 255, 0, 255)),
                self._crear_imagen(base / "tres.png", (50, 200), (0, 0, 255, 255)),
            ]
            salida = base / "montage.png"

            create_montage(rutas, output_path=salida, columns=2)

            with Image.open(salida) as collage:
                self.assertEqual(collage.size, (400, 400))
                self.assertEqual(collage.getbbox(), (50, 50, 400, 400))
                self.assertEqual(collage.getpixel((100, 100)), (255, 0, 0, 255))
                self.assertEqual(collage.getpixel((300, 100)), (0, 255, 0, 255))
                self.assertEqual(collage.getpixel((100, 300)), (0, 0, 255, 255))
                self.assertEqual(collage.getpixel((49, 100)), (0, 0, 0, 0))
                self.assertEqual(collage.getpixel((199, 100)), (0, 0, 0, 0))
                self.assertEqual(collage.getpixel((125, 300)), (0, 0, 0, 0))

    def test_create_montage_falla_si_no_hay_imagenes(self):
        with self.assertRaises(ErrorMontaje):
            create_montage([], output_path="/tmp/inexistente.png")

    def test_create_montage_falla_si_input_dir_no_tiene_pngs(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            with self.assertRaisesRegex(ErrorMontaje, "No se encontraron PNGs"):
                create_montage(output_path=Path(tmp_dir) / "montage.png", input_dir=tmp_dir)

    def _crear_imagen(self, ruta: Path, size: tuple[int, int], color: tuple[int, int, int, int]) -> str:
        Image.new("RGBA", size, color).save(ruta)
        return str(ruta)


if __name__ == "__main__":
    unittest.main()
