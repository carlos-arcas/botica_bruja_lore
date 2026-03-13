from __future__ import annotations

import json

from django.http import HttpRequest, JsonResponse


def json_no_autorizado() -> JsonResponse:
    return JsonResponse({"autorizado": False, "detalle": "Acceso restringido a staff."}, status=403)


def json_payload(request: HttpRequest) -> dict:
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError as exc:
        raise ValueError("Payload JSON inválido.") from exc


def to_bool(data: dict, campo: str, default: bool = False) -> bool:
    valor = data.get(campo, default)
    if isinstance(valor, bool):
        return valor
    raise ValueError(f"El campo '{campo}' debe ser booleano.")


def to_int(data: dict, campo: str, default: int = 0) -> int:
    try:
        return int(data.get(campo, default))
    except (TypeError, ValueError) as exc:
        raise ValueError(f"El campo '{campo}' debe ser numérico.") from exc
