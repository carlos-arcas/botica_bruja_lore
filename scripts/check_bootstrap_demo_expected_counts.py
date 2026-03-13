#!/usr/bin/env python3
"""Valida conteos públicos de bootstrap demo contra el seed canónico."""

from __future__ import annotations

import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]


def _bootstrap_django() -> None:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.configuracion_django.settings")
    if str(ROOT_DIR) not in sys.path:
        sys.path.insert(0, str(ROOT_DIR))

    import django

    django.setup()


def _calcular_conteos_esperados() -> dict[str, int]:
    from backend.nucleo_herbal.infraestructura.persistencia_django.management.commands.seed_demo_publico import (
        INTENCIONES_DEMO,
        PLANTAS_DEMO,
        PRODUCTOS_DEMO,
        RITUALES_DEMO,
    )

    return {
        "intenciones_publicas": sum(1 for item in INTENCIONES_DEMO if item["es_publica"]),
        "plantas_publicadas": sum(1 for item in PLANTAS_DEMO if item["publicada"]),
        "productos_publicados": sum(1 for item in PRODUCTOS_DEMO if item["publicado"]),
        "rituales_publicados": sum(1 for item in RITUALES_DEMO if item["publicado"]),
    }


def _calcular_conteos_reales() -> dict[str, int]:
    from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
        IntencionModelo,
        PlantaModelo,
        ProductoModelo,
        RitualModelo,
    )

    return {
        "intenciones_publicas": IntencionModelo.objects.filter(es_publica=True).count(),
        "plantas_publicadas": PlantaModelo.objects.filter(publicada=True).count(),
        "productos_publicados": ProductoModelo.objects.filter(publicado=True).count(),
        "rituales_publicados": RitualModelo.objects.filter(publicado=True).count(),
    }


def _detectar_desviaciones(
    esperados: dict[str, int], reales: dict[str, int]
) -> dict[str, tuple[int, int]]:
    claves = sorted(set(esperados) | set(reales))
    return {
        clave: (esperados.get(clave, -1), reales.get(clave, -1))
        for clave in claves
        if esperados.get(clave) != reales.get(clave)
    }


def _formatear_resumen(
    esperados: dict[str, int], reales: dict[str, int], desviaciones: dict[str, tuple[int, int]]
) -> str:
    lineas = ["== Verificación de conteos demo públicos =="]
    for clave in sorted(esperados):
        lineas.append(f"- {clave}: esperado={esperados[clave]} real={reales.get(clave, 'N/A')}")

    if not desviaciones:
        lineas.append("Resultado: OK. Conteos reales alineados con el seed canónico.")
        return "\n".join(lineas)

    lineas.append("Resultado: ERROR. Se detectaron desviaciones de conteo:")
    for clave, (esperado, real) in desviaciones.items():
        lineas.append(f"  * {clave}: esperado={esperado} real={real}")
    return "\n".join(lineas)


def main() -> int:
    _bootstrap_django()
    esperados = _calcular_conteos_esperados()
    reales = _calcular_conteos_reales()
    desviaciones = _detectar_desviaciones(esperados, reales)
    print(_formatear_resumen(esperados, reales, desviaciones))
    if desviaciones:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
