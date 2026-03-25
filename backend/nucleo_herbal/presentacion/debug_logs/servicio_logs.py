from __future__ import annotations

import re
from pathlib import Path

from django.conf import settings

FUENTES_VALIDAS = {"app", "error"}
PATRONES_SENSIBLES = [
    re.compile(r"(?i)(authorization\s*[:=]\s*bearer\s+)[^\s,;]+"),
    re.compile(r"(?i)(authorization\s*[:=]\s*)[^\s,;]+"),
    re.compile(r"(?i)(cookie\s*[:=]\s*)[^\n]+"),
    re.compile(r"(?i)(x-api-key\s*[:=]\s*)[^\s,;]+"),
    re.compile(r"(?i)(api[_-]?key\s*[:=]\s*)[^\s,;]+"),
    re.compile(r"(?i)(password\s*[:=]\s*)[^\s,;]+"),
    re.compile(r"(?i)(secret\s*[:=]\s*)[^\s,;]+"),
    re.compile(r"(?i)(session(id)?\s*[:=]\s*)[^\s,;]+"),
    re.compile(r"(?i)(token\s*[:=]\s*)[^\s,;]+"),
]


def resolver_archivo_fuente(source: str) -> Path:
    fuente = source.lower().strip()
    if fuente not in FUENTES_VALIDAS:
        raise ValueError("Fuente no válida")
    archivo = settings.DEBUG_LOG_APP_FILE if fuente == "app" else settings.DEBUG_LOG_ERROR_FILE
    return Path(archivo)


def sanitizar_linea(linea: str) -> str:
    redactada = linea
    for patron in PATRONES_SENSIBLES:
        redactada = patron.sub(r"\1[REDACTED]", redactada)
    return redactada


def extraer_logs(source: str, texto: str = "", nivel: str = "", limite: int = 200) -> dict[str, object]:
    archivo = resolver_archivo_fuente(source)
    if not archivo.exists():
        return {"source": source, "total": 0, "items": []}

    filtro_texto = texto.strip().lower()
    filtro_nivel = nivel.strip().upper()
    lineas = archivo.read_text(encoding="utf-8").splitlines()
    acumuladas: list[dict[str, str]] = []

    for linea in lineas:
        if filtro_nivel and f" {filtro_nivel} " not in linea.upper():
            continue
        if filtro_texto and filtro_texto not in linea.lower():
            continue
        acumuladas.append({"sanitized": sanitizar_linea(linea)})

    if limite > 0:
        acumuladas = acumuladas[-limite:]

    return {
        "source": source,
        "total": len(acumuladas),
        "items": acumuladas,
    }


def limpiar_logs(source: str | None = None) -> dict[str, bool]:
    fuentes = [source] if source else ["app", "error"]
    resultado: dict[str, bool] = {}
    for fuente in fuentes:
        archivo = resolver_archivo_fuente(fuente or "")
        archivo.parent.mkdir(parents=True, exist_ok=True)
        archivo.write_text("", encoding="utf-8")
        resultado[fuente or ""] = True
    return resultado
