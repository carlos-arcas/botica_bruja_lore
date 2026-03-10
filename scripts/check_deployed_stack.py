#!/usr/bin/env python3
"""Smoke check manual para validar stack fullstack ya desplegado (solo lectura)."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any


class RequestFailure(Exception):
    """Error de conectividad/timeout al consultar un endpoint remoto."""



TIMEOUT_SECONDS = 12


@dataclass
class CheckResult:
    block: str
    label: str
    status: str
    detail: str
    blocking: bool


def _normalized_base_url(name: str) -> str:
    value = os.environ.get(name, "").strip().rstrip("/")
    if not value:
        raise ValueError(f"La variable obligatoria {name} no está definida.")

    parsed = urllib.parse.urlparse(value)
    if parsed.scheme not in {"http", "https"}:
        raise ValueError(f"{name} debe incluir esquema http/https: {value!r}")
    if not parsed.netloc:
        raise ValueError(f"{name} no parece una URL válida: {value!r}")
    return value


def _env_flag(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    normalized = value.strip().lower()
    if normalized in {"1", "true", "yes", "y"}:
        return True
    if normalized in {"0", "false", "no", "n"}:
        return False
    raise ValueError(f"{name} debe ser true/false (valor recibido: {value!r}).")


def _join_url(base_url: str, path: str) -> str:
    return f"{base_url}/{path.lstrip('/')}"


def _http_get(url: str) -> tuple[int, str, bytes]:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json, text/html;q=0.9, */*;q=0.1",
            "User-Agent": "botica-smoke-check/1.0",
        },
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            status = response.getcode()
            content_type = response.headers.get("Content-Type", "")
            body = response.read()
            return status, content_type, body
    except urllib.error.HTTPError as error:
        body = b""
        try:
            body = error.read()
        except Exception:  # pragma: no cover - read puede fallar sin cuerpo
            body = b""
        return error.code, error.headers.get("Content-Type", ""), body
    except urllib.error.URLError as error:
        raise RequestFailure(f"Sin respuesta de red para {url}: {error.reason}") from error
    except TimeoutError as error:
        raise RequestFailure(f"Timeout consultando {url}: {error}") from error


def _decode_preview(payload: bytes, limit: int = 240) -> str:
    text = payload.decode("utf-8", errors="replace").strip()
    return text[:limit].replace("\n", " ")


def _validate_json_response(
    *,
    block: str,
    label: str,
    url: str,
    expected_status: int,
    require_non_empty_list_key: str | None = None,
) -> CheckResult:
    try:
        status, content_type, body = _http_get(url)
    except RequestFailure as error:
        return CheckResult(
            block=block,
            label=label,
            status="ERROR",
            detail=str(error),
            blocking=True,
        )
    if status != expected_status:
        preview = _decode_preview(body)
        return CheckResult(
            block=block,
            label=label,
            status="ERROR",
            detail=f"HTTP {status} (esperado {expected_status}) en {url}. Body: {preview}",
            blocking=True,
        )

    try:
        payload = json.loads(body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        preview = _decode_preview(body)
        return CheckResult(
            block=block,
            label=label,
            status="ERROR",
            detail=f"Respuesta no JSON válida en {url}. Content-Type={content_type!r}. Body: {preview}",
            blocking=True,
        )

    if require_non_empty_list_key is not None:
        value = payload.get(require_non_empty_list_key) if isinstance(payload, dict) else None
        if not isinstance(value, list):
            return CheckResult(
                block=block,
                label=label,
                status="ERROR",
                detail=f"JSON sin lista '{require_non_empty_list_key}' en {url}.",
                blocking=True,
            )
        if not value:
            return CheckResult(
                block=block,
                label=label,
                status="ERROR",
                detail=f"Lista '{require_non_empty_list_key}' vacía y EXPECT_NON_EMPTY_DATA=true en {url}.",
                blocking=True,
            )

    return CheckResult(
        block=block,
        label=label,
        status="OK",
        detail=f"{url} respondió {status} JSON válido.",
        blocking=True,
    )


def _validate_html_response(block: str, label: str, url: str) -> CheckResult:
    try:
        status, content_type, body = _http_get(url)
    except RequestFailure as error:
        return CheckResult(
            block=block,
            label=label,
            status="ERROR",
            detail=str(error),
            blocking=True,
        )
    if status != 200:
        preview = _decode_preview(body)
        return CheckResult(
            block=block,
            label=label,
            status="ERROR",
            detail=f"HTTP {status} en {url}. Body: {preview}",
            blocking=True,
        )

    body_preview = _decode_preview(body).lower()
    is_html_content_type = "text/html" in content_type.lower()
    has_html_tag = "<html" in body_preview or "<!doctype html" in body_preview
    if not (is_html_content_type or has_html_tag):
        return CheckResult(
            block=block,
            label=label,
            status="ERROR",
            detail=f"{url} no parece HTML. Content-Type={content_type!r}.",
            blocking=True,
        )

    return CheckResult(
        block=block,
        label=label,
        status="OK",
        detail=f"{url} respondió HTML público (HTTP 200).",
        blocking=True,
    )


def _print_result(result: CheckResult) -> None:
    print(f"[{result.status}] {result.block} :: {result.label}")
    print(f"  - {result.detail}")


def main() -> int:
    print("== Smoke check post-deploy (fullstack, solo lectura) ==")
    try:
        backend_base = _normalized_base_url("BACKEND_BASE_URL")
        frontend_base = _normalized_base_url("FRONTEND_BASE_URL")
        expect_non_empty = _env_flag("EXPECT_NON_EMPTY_DATA", default=False)
    except ValueError as error:
        print(f"[ERROR] Configuración: {error}")
        return 2

    herbal_slug = os.environ.get("HERBAL_SLUG", "").strip()
    ritual_slug = os.environ.get("RITUAL_SLUG", "").strip()

    results: list[CheckResult] = []

    # A) Backend base
    results.append(
        _validate_json_response(
            block="A.Backend base",
            label="GET /healthz",
            url=_join_url(backend_base, "/healthz"),
            expected_status=200,
        )
    )

    # B) APIs públicas backend
    key_plantas = "plantas" if expect_non_empty else None
    key_rituales = "rituales" if expect_non_empty else None
    results.append(
        _validate_json_response(
            block="B.API pública backend",
            label="GET /api/v1/herbal/plantas/",
            url=_join_url(backend_base, "/api/v1/herbal/plantas/"),
            expected_status=200,
            require_non_empty_list_key=key_plantas,
        )
    )
    results.append(
        _validate_json_response(
            block="B.API pública backend",
            label="GET /api/v1/rituales/",
            url=_join_url(backend_base, "/api/v1/rituales/"),
            expected_status=200,
            require_non_empty_list_key=key_rituales,
        )
    )

    # C) Frontend público
    for path in ("/", "/hierbas", "/rituales"):
        results.append(
            _validate_html_response(
                block="C.Frontend público",
                label=f"GET {path}",
                url=_join_url(frontend_base, path),
            )
        )

    # D) Validaciones opcionales por slug
    if herbal_slug:
        results.append(
            _validate_html_response(
                block="D.Detalle opcional",
                label=f"GET /hierbas/{herbal_slug}",
                url=_join_url(frontend_base, f"/hierbas/{herbal_slug}"),
            )
        )
        results.append(
            _validate_json_response(
                block="D.Detalle opcional",
                label=f"GET backend /api/v1/herbal/plantas/{herbal_slug}/",
                url=_join_url(backend_base, f"/api/v1/herbal/plantas/{herbal_slug}/"),
                expected_status=200,
            )
        )
    else:
        results.append(
            CheckResult(
                block="D.Detalle opcional",
                label="HERBAL_SLUG",
                status="SKIP",
                detail="No se proporcionó HERBAL_SLUG; se omiten checks de detalle herbal.",
                blocking=False,
            )
        )

    if ritual_slug:
        results.append(
            _validate_html_response(
                block="D.Detalle opcional",
                label=f"GET /rituales/{ritual_slug}",
                url=_join_url(frontend_base, f"/rituales/{ritual_slug}"),
            )
        )
        results.append(
            _validate_json_response(
                block="D.Detalle opcional",
                label=f"GET backend /api/v1/rituales/{ritual_slug}/",
                url=_join_url(backend_base, f"/api/v1/rituales/{ritual_slug}/"),
                expected_status=200,
            )
        )
    else:
        results.append(
            CheckResult(
                block="D.Detalle opcional",
                label="RITUAL_SLUG",
                status="SKIP",
                detail="No se proporcionó RITUAL_SLUG; se omiten checks de detalle ritual.",
                blocking=False,
            )
        )

    print("\n== Resultados ==")
    for result in results:
        _print_result(result)

    blocking_failures = [r for r in results if r.blocking and r.status == "ERROR"]
    skipped = [r for r in results if r.status == "SKIP"]
    print("\n== Resumen final ==")
    print(f"OK: {sum(1 for r in results if r.status == 'OK')}")
    print(f"ERROR: {len(blocking_failures)}")
    print(f"SKIP: {len(skipped)}")

    if blocking_failures:
        print("Veredicto: ERROR (fallaron checks bloqueantes del entorno desplegado).")
        return 1

    print("Veredicto: OK (stack desplegado operativo para rutas públicas verificadas).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
