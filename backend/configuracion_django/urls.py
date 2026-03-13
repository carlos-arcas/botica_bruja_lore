"""Rutas raíz para administración, APIs públicas y healthcheck."""

import logging

from django.contrib import admin
from django.contrib.sitemaps.views import sitemap
from django.db import connections
from django.db.utils import DatabaseError
from django.http import HttpResponse, JsonResponse
from django.urls import include, path
from django.conf import settings

from backend.nucleo_herbal.presentacion.publica.sitemaps import SITEMAPS_PUBLICOS
from backend.nucleo_herbal.infraestructura.persistencia_django.views_importacion import (
    descargar_plantilla_view,
    importacion_masiva_view,
)

LOGGER = logging.getLogger(__name__)


def _resolver_url_publica_sitio(request) -> str:
    public_site_url = getattr(settings, "PUBLIC_SITE_URL", "").strip().rstrip("/")
    if public_site_url:
        return public_site_url
    return request.build_absolute_uri("/").rstrip("/")


def robots_txt(request):
    base_url = _resolver_url_publica_sitio(request)
    contenido = "\n".join(
        (
            "User-agent: *",
            "Allow: /",
            "Disallow: /admin/",
            "Disallow: /api/",
            f"Sitemap: {base_url}/sitemap.xml",
        )
    )
    return HttpResponse(f"{contenido}\n", content_type="text/plain; charset=utf-8")


def healthcheck(_request):
    try:
        with connections["default"].cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except DatabaseError:
        LOGGER.exception("healthcheck_db_unavailable")
        return JsonResponse({"status": "error", "database": "unavailable"}, status=503)
    return JsonResponse({"status": "ok", "database": "available"})


urlpatterns = [
    path("robots.txt", robots_txt, name="robots-txt"),
    path("healthz", healthcheck, name="healthcheck"),
    path("sitemap.xml", sitemap, {"sitemaps": SITEMAPS_PUBLICOS}, name="sitemap-xml"),
    path("admin/importacion-masiva/", importacion_masiva_view, name="importacion-masiva"),
    path("admin/importacion-masiva/plantilla/<str:entidad>/<str:formato>/", descargar_plantilla_view, name="importacion-plantilla"),
    path("admin/", admin.site.urls),
    path("api/backoffice/auth/", include("backend.nucleo_herbal.presentacion.backoffice_auth_urls")),
    path("api/v1/herbal/", include("backend.nucleo_herbal.presentacion.publica.urls")),
    path(
        "api/v1/rituales/",
        include("backend.nucleo_herbal.presentacion.publica.urls_rituales"),
    ),
    path(
        "api/v1/pedidos-demo/",
        include("backend.nucleo_herbal.presentacion.publica.urls_pedidos_demo"),
    ),
    path(
        "api/v1/cuentas-demo/",
        include("backend.nucleo_herbal.presentacion.publica.urls_cuentas_demo"),
    ),
    path(
        "api/v1/calendario-ritual/",
        include("backend.nucleo_herbal.presentacion.publica.urls_calendario_ritual"),
    ),
    path(
        "api/v1/backoffice/",
        include("backend.nucleo_herbal.presentacion.backoffice_urls"),
    ),
]
