"""DTOs de salida para casos de uso del núcleo herbal."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class IntencionDTO:
    slug: str
    nombre: str


@dataclass(frozen=True, slots=True)
class PlantaResumenDTO:
    slug: str
    nombre: str
    descripcion_breve: str
    intenciones: tuple[IntencionDTO, ...]


@dataclass(frozen=True, slots=True)
class PlantaDetalleDTO:
    slug: str
    nombre: str
    descripcion_breve: str
    intenciones: tuple[IntencionDTO, ...]


@dataclass(frozen=True, slots=True)
class ProductoResumenDTO:
    sku: str
    slug: str
    nombre: str
    tipo_producto: str
    categoria_comercial: str


@dataclass(frozen=True, slots=True)
class RelacionIntencionHerbalDTO:
    intencion: IntencionDTO
    plantas: tuple[PlantaResumenDTO, ...]


@dataclass(frozen=True, slots=True)
class RitualResumenDTO:
    slug: str
    nombre: str
    contexto_breve: str
    intenciones: tuple[IntencionDTO, ...]


@dataclass(frozen=True, slots=True)
class RitualDetalleDTO:
    slug: str
    nombre: str
    contexto_breve: str
    intenciones: tuple[IntencionDTO, ...]
    ids_plantas_relacionadas: tuple[str, ...]
    ids_productos_relacionados: tuple[str, ...]


@dataclass(frozen=True, slots=True)
class RelacionIntencionRitualDTO:
    intencion: IntencionDTO
    rituales: tuple[RitualResumenDTO, ...]
