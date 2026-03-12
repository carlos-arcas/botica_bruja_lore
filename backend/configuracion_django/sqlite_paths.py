"""Utilidades para resolver rutas SQLite de forma portable."""

from __future__ import annotations

from pathlib import Path
from urllib.parse import unquote, urlparse


def _es_ruta_windows_absoluta(ruta: str) -> bool:
    if len(ruta) < 3:
        return False
    return ruta[0].isalpha() and ruta[1] == ":" and ruta[2] in {"/", "\\"}


def resolver_ruta_sqlite(database_url: str, base_dir: Path, local_var_dir: Path) -> Path:
    parsed = urlparse(database_url)
    ruta = unquote(parsed.path or "")

    if not ruta:
        destino = local_var_dir / "dev.sqlite3"
    elif _es_ruta_windows_absoluta(ruta.lstrip("/")):
        destino = Path(ruta.lstrip("/"))
    elif database_url.startswith("sqlite:////"):
        destino = Path(ruta)
    else:
        destino = base_dir / ruta.lstrip("/")

    destino.parent.mkdir(parents=True, exist_ok=True)
    return destino
