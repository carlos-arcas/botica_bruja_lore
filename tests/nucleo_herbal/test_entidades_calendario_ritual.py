from __future__ import annotations

from datetime import date
import unittest

from backend.nucleo_herbal.dominio.calendario_ritual import ReglaCalendario
from backend.nucleo_herbal.dominio.excepciones import ErrorDominio


class TestEntidadesCalendarioRitual(unittest.TestCase):
    def test_regla_calendario_valida(self) -> None:
        regla = ReglaCalendario(
            id="reg-1",
            id_ritual="rit-1",
            nombre="Ventana equinoccio",
            fecha_inicio=date(2026, 3, 20),
            fecha_fin=date(2026, 3, 25),
            prioridad=5,
        )

        self.assertTrue(regla.aplica_en(date(2026, 3, 22)))

    def test_regla_calendario_con_rango_invalido_lanza_error(self) -> None:
        with self.assertRaises(ErrorDominio):
            ReglaCalendario(
                id="reg-1",
                id_ritual="rit-1",
                nombre="Rango inválido",
                fecha_inicio=date(2026, 6, 1),
                fecha_fin=date(2026, 5, 1),
            )

    def test_regla_calendario_con_prioridad_invalida_lanza_error(self) -> None:
        with self.assertRaises(ErrorDominio):
            ReglaCalendario(
                id="reg-1",
                id_ritual="rit-1",
                nombre="Prioridad inválida",
                fecha_inicio=date(2026, 6, 1),
                fecha_fin=date(2026, 6, 30),
                prioridad=-1,
            )

    def test_regla_inactiva_no_aplica_en_fecha(self) -> None:
        regla = ReglaCalendario(
            id="reg-2",
            id_ritual="rit-1",
            nombre="Ventana opcional",
            fecha_inicio=date(2026, 6, 1),
            fecha_fin=date(2026, 6, 30),
            activa=False,
        )

        self.assertFalse(regla.aplica_en(date(2026, 6, 10)))


if __name__ == "__main__":
    unittest.main()
