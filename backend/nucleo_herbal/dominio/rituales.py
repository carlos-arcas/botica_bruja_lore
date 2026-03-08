"""Entidades de dominio para rituales conectados del Ciclo 2."""

from __future__ import annotations

from dataclasses import dataclass

from .entidades import Intencion
from .excepciones import ErrorDominio


@dataclass(frozen=True, slots=True)
class Ritual:
    """Entidad editorial conectada al núcleo herbal sin volverse categoría comercial."""

    id: str
    slug: str
    nombre: str
    contexto_breve: str
    intenciones: tuple[Intencion, ...]
    ids_plantas_relacionadas: tuple[str, ...]
    ids_productos_relacionados: tuple[str, ...]

    def __post_init__(self) -> None:
        if not self.slug.strip():
            raise ErrorDominio("El ritual requiere slug.")
        if not self.nombre.strip():
            raise ErrorDominio("El ritual requiere nombre.")
        if not self.contexto_breve.strip():
            raise ErrorDominio("El ritual requiere contexto breve.")
        if not self.intenciones:
            raise ErrorDominio("El ritual requiere al menos una intención.")
        _validar_intenciones_unicas(self.intenciones)
        _validar_ids_unicos(self.ids_plantas_relacionadas, "plantas")
        _validar_ids_unicos(self.ids_productos_relacionados, "productos")


def _validar_intenciones_unicas(intenciones: tuple[Intencion, ...]) -> None:
    slugs = [intencion.slug for intencion in intenciones]
    if len(slugs) != len(set(slugs)):
        raise ErrorDominio("Un ritual no puede repetir intenciones.")


def _validar_ids_unicos(ids: tuple[str, ...], entidad: str) -> None:
    valores_limpios = [valor.strip() for valor in ids if valor and valor.strip()]
    if len(valores_limpios) != len(ids):
        raise ErrorDominio(f"Las referencias de {entidad} del ritual deben tener texto.")
    if len(valores_limpios) != len(set(valores_limpios)):
        raise ErrorDominio(f"Un ritual no puede repetir referencias de {entidad}.")
