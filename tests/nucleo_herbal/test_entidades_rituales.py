import unittest

from backend.nucleo_herbal.dominio.entidades import Intencion
from backend.nucleo_herbal.dominio.excepciones import ErrorDominio
from backend.nucleo_herbal.dominio.rituales import Ritual


class TestEntidadesRituales(unittest.TestCase):
    def test_ritual_requiere_identidad_publica_minima(self) -> None:
        intencion = Intencion("int-1", "calma", "Calma", "Contexto editorial")

        with self.assertRaises(ErrorDominio):
            Ritual(
                id="rit-1",
                slug="",
                nombre="Ritual de descanso",
                contexto_breve="Secuencia breve para cerrar el día.",
                intenciones=(intencion,),
                ids_plantas_relacionadas=("pla-1",),
                ids_productos_relacionados=("prod-1",),
            )

    def test_ritual_debe_tener_al_menos_una_intencion(self) -> None:
        with self.assertRaises(ErrorDominio):
            Ritual(
                id="rit-2",
                slug="ritual-lunar",
                nombre="Ritual lunar",
                contexto_breve="Anclaje de intención para fase creciente.",
                intenciones=(),
                ids_plantas_relacionadas=(),
                ids_productos_relacionados=(),
            )

    def test_ritual_permite_relaciones_con_plantas_y_productos(self) -> None:
        intencion = Intencion("int-1", "limpieza", "Limpieza", "Contexto editorial")

        ritual = Ritual(
            id="rit-3",
            slug="limpieza-del-altar",
            nombre="Limpieza del altar",
            contexto_breve="Preparación ritual breve para reiniciar energía del espacio.",
            intenciones=(intencion,),
            ids_plantas_relacionadas=("pla-romero", "pla-ruda"),
            ids_productos_relacionados=("prod-sahumerio", "prod-vela"),
        )

        self.assertEqual(ritual.intenciones[0].slug, "limpieza")
        self.assertIn("pla-romero", ritual.ids_plantas_relacionadas)
        self.assertIn("prod-vela", ritual.ids_productos_relacionados)


if __name__ == "__main__":
    unittest.main()
