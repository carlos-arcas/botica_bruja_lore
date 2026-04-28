from django.conf import settings
from django.http import HttpResponse


def _append_vary_header(valor_actual: str | None, item: str) -> str:
    if not valor_actual:
        return item
    valores = [parte.strip() for parte in valor_actual.split(",") if parte.strip()]
    if item not in valores:
        valores.append(item)
    return ", ".join(valores)


class FrontendCorsMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        origen = request.headers.get("Origin", "").strip()
        origen_permitido = origen in settings.CORS_ALLOWED_ORIGINS

        if request.method == "OPTIONS" and origen_permitido:
            response = HttpResponse(status=204)
        else:
            response = self.get_response(request)

        if origen_permitido:
            response["Access-Control-Allow-Origin"] = origen
            response["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response["Access-Control-Allow-Headers"] = request.headers.get(
                "Access-Control-Request-Headers",
                "Content-Type, Authorization, X-Requested-With",
            )
            response["Vary"] = _append_vary_header(response.get("Vary"), "Origin")

        return response
