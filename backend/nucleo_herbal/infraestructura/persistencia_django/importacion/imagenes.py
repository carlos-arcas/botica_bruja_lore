"""Gestión y optimización de imágenes adjuntas para importación."""

from io import BytesIO
from pathlib import Path
import re

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

try:
    from PIL import Image
except ModuleNotFoundError:  # pragma: no cover
    Image = None


MAX_CARD_SIZE = (640, 640)
WEBP_QUALITY = 82


def _slugify_nombre(nombre: str) -> str:
    base = Path(nombre).stem.lower()
    limpio = re.sub(r"[^a-z0-9]+", "-", base).strip("-")
    return limpio or "imagen"


def _guardar_como_webp(archivo, prefijo: str) -> str:
    if Image is None:
        ruta = default_storage.save(f"{prefijo}/{Path(archivo.name).name}", archivo)
        return default_storage.url(ruta)
    imagen = Image.open(archivo)
    if imagen.mode not in ("RGB", "RGBA"):
        imagen = imagen.convert("RGB")
    imagen.thumbnail(MAX_CARD_SIZE)
    nombre = f"{_slugify_nombre(archivo.name)}.webp"
    output = BytesIO()
    imagen.save(output, format="WEBP", quality=WEBP_QUALITY, method=6)
    ruta = default_storage.save(f"{prefijo}/{nombre}", ContentFile(output.getvalue()))
    return default_storage.url(ruta)


def guardar_imagenes_adjuntas(archivos) -> dict[str, str]:
    imagenes_por_referencia: dict[str, str] = {}
    for imagen in archivos:
        nombre = Path(imagen.name).name
        url = _guardar_como_webp(imagen, "importaciones/imagenes")
        imagenes_por_referencia[nombre] = url
    return imagenes_por_referencia


def guardar_imagen_fila(archivo, fila_id: int) -> str:
    return _guardar_como_webp(archivo, f"importaciones/filas/{fila_id}")


def resolver_imagen(row: dict[str, str], imagenes_por_referencia: dict[str, str]) -> str:
    imagen_url = row.get("imagen_url", "").strip()
    if imagen_url:
        return imagen_url

    referencia = row.get("imagen_ref", "").strip()
    if referencia:
        return imagenes_por_referencia.get(referencia, "")
    return ""
