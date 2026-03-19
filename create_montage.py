from __future__ import annotations

import argparse
import math
from pathlib import Path
from typing import Sequence

from PIL import Image, UnidentifiedImageError

TRANSPARENTE = (0, 0, 0, 0)


class ErrorMontaje(ValueError):
    """Error controlado para entradas inválidas del montaje."""


def _parsear_max_size(valor: str | Sequence[int] | None) -> tuple[int, int] | None:
    if valor is None:
        return None
    if isinstance(valor, tuple):
        return valor
    if isinstance(valor, list):
        return tuple(valor)  # type: ignore[return-value]
    ancho, separador, alto = str(valor).lower().partition("x")
    if not separador:
        raise ErrorMontaje("max_size debe usar el formato ANCHOxALTO.")
    try:
        dimensiones = (int(ancho), int(alto))
    except ValueError as exc:  # pragma: no cover
        raise ErrorMontaje("max_size debe contener enteros positivos.") from exc
    if min(dimensiones) <= 0:
        raise ErrorMontaje("max_size debe contener enteros positivos.")
    return dimensiones


def _resolver_entradas(image_paths: Sequence[str] | None, input_dir: str | None) -> list[Path]:
    rutas = [Path(ruta) for ruta in image_paths or []]
    if input_dir:
        directorio = Path(input_dir)
        if not directorio.is_dir():
            raise ErrorMontaje(f"No existe el directorio de entrada: {directorio}")
        pngs = sorted(directorio.glob("*.png"))
        if not pngs and not rutas:
            raise ErrorMontaje(f"No se encontraron PNGs en el directorio: {directorio}")
        rutas.extend(pngs)
    if not rutas:
        raise ErrorMontaje("Debes indicar al menos una imagen o un --input_dir con PNGs.")
    inexistentes = [str(ruta) for ruta in rutas if not ruta.is_file()]
    if inexistentes:
        raise ErrorMontaje(f"No existen las rutas de imagen: {', '.join(inexistentes)}")
    return rutas


def _cargar_imagenes(rutas: Sequence[Path]) -> list[Image.Image]:
    imagenes: list[Image.Image] = []
    for ruta in rutas:
        try:
            with Image.open(ruta) as imagen:
                imagen.load()
                imagenes.append(imagen.convert("RGBA"))
        except (FileNotFoundError, UnidentifiedImageError, OSError) as exc:
            raise ErrorMontaje(f"No fue posible abrir la imagen: {ruta}") from exc
    return imagenes


def _calcular_grid(total_imagenes: int, columns: int | None) -> tuple[int, int]:
    if total_imagenes <= 0:
        raise ErrorMontaje("Debes indicar al menos una imagen válida.")
    columnas = columns or math.ceil(math.sqrt(total_imagenes))
    if columnas <= 0:
        raise ErrorMontaje("El número de columnas debe ser mayor que cero.")
    filas = math.ceil(total_imagenes / columnas)
    return columnas, filas


def _calcular_celda(imagenes: Sequence[Image.Image]) -> tuple[int, int]:
    return (
        max(imagen.width for imagen in imagenes),
        max(imagen.height for imagen in imagenes),
    )


def _ajustar_a_celda(imagen: Image.Image, celda: tuple[int, int]) -> Image.Image:
    contenida = imagen.copy()
    contenida.thumbnail(celda, Image.Resampling.LANCZOS)
    return contenida


def _pegar_centrada(collage: Image.Image, imagen: Image.Image, origen: tuple[int, int], celda: tuple[int, int]) -> None:
    offset_x = origen[0] + (celda[0] - imagen.width) // 2
    offset_y = origen[1] + (celda[1] - imagen.height) // 2
    collage.alpha_composite(imagen, (offset_x, offset_y))


def create_montage(
    image_paths: Sequence[str] | None = None,
    output_path: str | Path = "montage.png",
    columns: int | None = None,
    max_size: str | tuple[int, int] | None = None,
    input_dir: str | None = None,
) -> Path:
    rutas = _resolver_entradas(image_paths, input_dir)
    imagenes = _cargar_imagenes(rutas)
    columnas, filas = _calcular_grid(len(imagenes), columns)
    celda = _calcular_celda(imagenes)
    collage = Image.new("RGBA", (columnas * celda[0], filas * celda[1]), TRANSPARENTE)

    for indice, imagen in enumerate(imagenes):
        fila, columna = divmod(indice, columnas)
        origen = (columna * celda[0], fila * celda[1])
        _pegar_centrada(collage, _ajustar_a_celda(imagen, celda), origen, celda)

    limite = _parsear_max_size(max_size)
    if limite is not None:
        collage.thumbnail(limite, Image.Resampling.LANCZOS)

    salida = Path(output_path)
    salida.parent.mkdir(parents=True, exist_ok=True)
    collage.save(salida)
    return salida


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Genera un montaje PNG a partir de varias imágenes.")
    parser.add_argument("images", nargs="*", help="Rutas de imágenes individuales.")
    parser.add_argument("--input_dir", help="Directorio con PNGs a incluir.")
    parser.add_argument("--output", required=True, help="Ruta del collage de salida.")
    parser.add_argument("--columns", type=int, help="Número de columnas del grid.")
    parser.add_argument("--max_size", help="Tamaño máximo final en formato ANCHOxALTO.")
    return parser


def main() -> int:
    parser = _build_parser()
    args = parser.parse_args()
    try:
        create_montage(
            image_paths=args.images,
            output_path=args.output,
            columns=args.columns,
            max_size=args.max_size,
            input_dir=args.input_dir,
        )
    except ErrorMontaje as exc:
        parser.error(str(exc))
    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
