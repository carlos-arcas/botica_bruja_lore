from __future__ import annotations

from decimal import Decimal, InvalidOperation

BENEFICIOS_BOTICA = (
    ("calma", "Calma"),
    ("digestivo", "Digestivo"),
    ("energia", "Energía"),
    ("enfoque", "Enfoque"),
    ("respiratorio", "Respiratorio"),
)

FORMATOS_BOTICA = (
    ("hoja-seca", "Hoja seca"),
    ("flor-seca", "Flor seca"),
    ("resina", "Resina"),
    ("mezcla-herbal", "Mezcla herbal"),
)

MODOS_USO_BOTICA = (
    ("infusion", "Infusión"),
    ("sahumado", "Sahumado"),
    ("bano-ritual", "Baño ritual"),
    ("altar", "Altar"),
)

CATEGORIAS_VISIBLES_BOTICA = (
    ("hierbas", "Hierbas"),
    ("mezclas", "Mezclas"),
    ("inciensos", "Inciensos"),
    ("rituales", "Rituales"),
)


def opciones_a_valores(opciones: tuple[tuple[str, str], ...]) -> set[str]:
    return {clave for clave, _ in opciones}


def parsear_precio_numerico(valor: str) -> Decimal | None:
    texto = valor.strip().replace("€", "").replace(" ", "").replace(",", ".")
    if not texto:
        return None
    try:
        numero = Decimal(texto)
    except InvalidOperation as error:
        raise ValueError("Precio visible inválido. Usa un valor numérico válido (ej: 9.90).") from error
    if numero < 0:
        raise ValueError("Precio visible inválido. No puede ser negativo.")
    return numero.quantize(Decimal("0.01"))
