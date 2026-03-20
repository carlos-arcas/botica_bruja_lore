from __future__ import annotations

import json
from uuid import uuid4

from django.http import HttpRequest, JsonResponse

OPERATION_ID_ATTR = "_operation_id_backoffice"


def operation_id(request: HttpRequest) -> str:
    operation_id_actual = getattr(request, OPERATION_ID_ATTR, None)
    if operation_id_actual:
        return operation_id_actual
    operation_id_actual = request.headers.get("X-Request-ID") or str(uuid4())
    setattr(request, OPERATION_ID_ATTR, operation_id_actual)
    return operation_id_actual


def json_no_autorizado(request: HttpRequest | None = None, detalle: str = "Acceso restringido a staff.") -> JsonResponse:
    payload = {"autorizado": False, "detalle": detalle}
    if request is not None:
        payload["operation_id"] = operation_id(request)
    return JsonResponse(payload, status=403)


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
