"""DTOs de salida para casos de uso del núcleo herbal."""

from __future__ import annotations

from dataclasses import dataclass
from decimal import Decimal


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
    seccion_publica: str
    descripcion_corta: str
    precio_visible: str
    imagen_url: str
    beneficio_principal: str
    beneficios_secundarios: tuple[str, ...]
    formato_comercial: str
    modo_uso: str
    categoria_visible: str


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


@dataclass(frozen=True, slots=True)
class LineaPedidoDTO:
    id_producto: str
    slug_producto: str
    nombre_producto: str
    cantidad: int
    precio_unitario_demo: Decimal
    subtotal_demo: Decimal


@dataclass(frozen=True, slots=True)
class PedidoDemoDTO:
    id_pedido: str
    estado: str
    canal_compra: str
    email_contacto: str
    subtotal_demo: Decimal
    lineas: tuple[LineaPedidoDTO, ...]


@dataclass(frozen=True, slots=True)
class ResumenPedidoDemoDTO:
    id_pedido: str
    cantidad_total_items: int
    subtotal_demo: Decimal


@dataclass(frozen=True, slots=True)
class EmailDemoLineaDTO:
    nombre_producto: str
    cantidad: int
    subtotal_demo: Decimal


@dataclass(frozen=True, slots=True)
class EmailPedidoDemoDTO:
    id_pedido: str
    estado: str
    canal_compra: str
    email_destino: str
    asunto: str
    cuerpo_texto: str
    subtotal_demo: Decimal
    lineas: tuple[EmailDemoLineaDTO, ...]


@dataclass(frozen=True, slots=True)
class PerfilCuentaDemoDTO:
    id_usuario: str
    email: str
    nombre_visible: str


@dataclass(frozen=True, slots=True)
class CuentaDemoDTO:
    id_usuario: str
    email: str
    nombre_visible: str


@dataclass(frozen=True, slots=True)
class ResultadoAutenticacionDemoDTO:
    cuenta: CuentaDemoDTO



@dataclass(frozen=True, slots=True)
class RitualCalendarioDTO:
    slug: str
    nombre: str
    contexto_breve: str
    nombre_regla: str
    prioridad: int


@dataclass(frozen=True, slots=True)
class ConsultaCalendarioRitualDTO:
    fecha_consulta: str
    rituales: tuple[RitualCalendarioDTO, ...]
