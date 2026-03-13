"""Funciones de presentación para la pantalla de importación masiva."""

from __future__ import annotations

from dataclasses import dataclass

from backend.nucleo_herbal.infraestructura.persistencia_django.models import ImportacionFilaModelo


@dataclass(frozen=True)
class ResumenImportacion:
    total: int
    validas: int
    warnings: int
    invalidas: int
    descartadas: int
    confirmadas: int
    con_imagen: int
    sin_imagen: int
    seleccionadas: int


def construir_resumen(filas: list[ImportacionFilaModelo]) -> ResumenImportacion:
    conteo = {estado: 0 for estado, _ in ImportacionFilaModelo.ESTADOS}
    con_imagen = 0
    seleccionadas = 0
    for fila in filas:
        conteo[fila.estado] += 1
        con_imagen += 1 if fila.imagen else 0
        seleccionadas += 1 if fila.seleccionado else 0
    total = len(filas)
    return ResumenImportacion(
        total=total,
        validas=conteo[ImportacionFilaModelo.ESTADO_VALIDA],
        warnings=conteo[ImportacionFilaModelo.ESTADO_WARNING],
        invalidas=conteo[ImportacionFilaModelo.ESTADO_INVALIDA],
        descartadas=conteo[ImportacionFilaModelo.ESTADO_DESCARTADA],
        confirmadas=conteo[ImportacionFilaModelo.ESTADO_CONFIRMADA],
        con_imagen=con_imagen,
        sin_imagen=total - con_imagen,
        seleccionadas=seleccionadas,
    )


def construir_fila_presentacion(fila: ImportacionFilaModelo) -> dict:
    datos = fila.datos or {}
    identificador = datos.get("sku") or datos.get("slug") or "—"
    titulo = datos.get("nombre") or datos.get("titulo") or "Sin título"
    tipo = datos.get("tipo_producto") or datos.get("tipo") or datos.get("seccion_publica") or "—"
    resumen_datos = _resumen_datos(datos)
    return {
        "obj": fila,
        "identificador": identificador,
        "titulo": titulo,
        "tipo": tipo,
        "resumen_datos": resumen_datos,
    }


def _resumen_datos(datos: dict) -> str:
    claves = ["precio_visible", "publicado", "categoria_comercial", "seccion_publica"]
    partes = [f"{clave}: {datos.get(clave)}" for clave in claves if datos.get(clave) not in (None, "")]
    return " · ".join(partes) if partes else "Sin datos clave"
