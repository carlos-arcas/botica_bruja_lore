"""Gestión de imágenes adjuntas para importación."""

from pathlib import Path

from django.core.files.storage import default_storage


def guardar_imagenes_adjuntas(archivos) -> dict[str, str]:
    imagenes_por_referencia: dict[str, str] = {}
    for imagen in archivos:
        nombre = Path(imagen.name).name
        ruta = default_storage.save(f"importaciones/imagenes/{nombre}", imagen)
        imagenes_por_referencia[nombre] = default_storage.url(ruta)
    return imagenes_por_referencia


def resolver_imagen(row: dict[str, str], imagenes_por_referencia: dict[str, str]) -> str:
    imagen_url = row.get("imagen_url", "").strip()
    if imagen_url:
        return imagen_url

    referencia = row.get("imagen_ref", "").strip()
    if referencia:
        return imagenes_por_referencia.get(referencia, "")
    return ""
