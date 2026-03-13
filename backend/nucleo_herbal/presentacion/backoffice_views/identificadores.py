from __future__ import annotations

import uuid

from django.db.models import Model
from django.utils.text import slugify


def generar_id_si_falta(valor: str | None) -> str:
    limpio = (valor or "").strip()
    return limpio or str(uuid.uuid4())


def generar_slug_unico(modelo: type[Model], base: str, actual_id: str | int | None = None) -> str:
    semilla = slugify(base or "") or "registro"
    slug = semilla
    secuencia = 2
    while _slug_existe(modelo, slug, actual_id):
        slug = f"{semilla}-{secuencia}"
        secuencia += 1
    return slug


def _slug_existe(modelo: type[Model], slug: str, actual_id: str | int | None) -> bool:
    consulta = modelo.objects.filter(slug=slug)
    if actual_id is not None:
        consulta = consulta.exclude(pk=actual_id)
    return consulta.exists()
