"""Sitemaps públicos para indexación SEO del proyecto."""

import json
from pathlib import Path
from urllib.parse import urlparse

from django.conf import settings
from django.contrib.sitemaps import Sitemap

from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
    PlantaModelo,
    ProductoModelo,
    RitualModelo,
)


class SitemapPublicoBase(Sitemap):
    def get_protocol(self, protocol: str | None = None) -> str:
        public_site_url = getattr(settings, "PUBLIC_SITE_URL", "").strip().rstrip("/")
        if not public_site_url:
            return super().get_protocol(protocol)

        esquema = urlparse(public_site_url).scheme
        if esquema in {"http", "https"}:
            return esquema
        return super().get_protocol(protocol)

    def get_domain(self, site=None) -> str:
        public_site_url = getattr(settings, "PUBLIC_SITE_URL", "").strip().rstrip("/")
        if not public_site_url:
            return super().get_domain(site)

        parsed = urlparse(public_site_url)
        if parsed.netloc:
            return parsed.netloc
        return super().get_domain(site)


class SitemapPaginasPublicas(SitemapPublicoBase):
    changefreq = "weekly"
    priority = 0.7

    def items(self) -> list[str]:
        return [
            "/",
            "/hierbas",
            "/rituales",
            "/colecciones",
            "/guias",
            "/la-botica",
            "/envios-y-preparacion",
        ]

    def location(self, item: str) -> str:
        return item

    def priority(self, item: str) -> float:
        if item == "/":
            return 1.0
        if item in {"/hierbas", "/rituales", "/colecciones", "/guias"}:
            return 0.9
        return 0.6


class SitemapPlantasPublicas(SitemapPublicoBase):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return PlantaModelo.objects.filter(publicada=True)

    def location(self, item: PlantaModelo) -> str:
        return f"/hierbas/{item.slug}"


class SitemapRitualesPublicos(SitemapPublicoBase):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return RitualModelo.objects.filter(publicado=True)

    def location(self, item: RitualModelo) -> str:
        return f"/rituales/{item.slug}"


class SitemapProductosPublicos(SitemapPublicoBase):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return ProductoModelo.objects.filter(publicado=True)

    def location(self, item: ProductoModelo) -> str:
        return f"/colecciones/{item.slug}"


class SitemapGuiasEditorialesPublicas(SitemapPublicoBase):
    changefreq = "weekly"
    priority = 0.75

    def items(self) -> list[dict[str, object]]:
        path = Path(settings.BASE_DIR) / "frontend" / "contenido" / "editorial" / "guiasEditoriales.json"
        with path.open("r", encoding="utf-8") as handler:
            guias = json.load(handler)

        return [guia for guia in guias if guia.get("publicada") and guia.get("indexable")]

    def location(self, item: dict[str, object]) -> str:
        return f"/guias/{item['slug']}"


class SitemapSubhubsEditorialesPublicos(SitemapPublicoBase):
    changefreq = "weekly"
    priority = 0.72

    def items(self) -> list[dict[str, object]]:
        return _cargar_subhubs_editoriales_publicables()

    def location(self, item: dict[str, object]) -> str:
        return f"/guias/temas/{item['slug']}"


def _cargar_subhubs_editoriales_publicables() -> list[dict[str, object]]:
    base = Path(settings.BASE_DIR) / "frontend" / "contenido" / "editorial"
    with (base / "guiasEditoriales.json").open("r", encoding="utf-8") as handler:
        guias = json.load(handler)
    with (base / "subhubsEditoriales.json").open("r", encoding="utf-8") as handler:
        subhubs = json.load(handler)

    guias_indexables = [guia for guia in guias if guia.get("publicada") and guia.get("indexable")]
    return [subhub for subhub in subhubs if _es_subhub_publicable(subhub, guias_indexables)]


def _es_subhub_publicable(subhub: dict[str, object], guias_indexables: list[dict[str, object]]) -> bool:
    if not subhub.get("publicada") or not subhub.get("indexable"):
        return False

    tema = subhub.get("tema")
    guias_tema = [guia for guia in guias_indexables if guia.get("tema") == tema]
    if len(guias_tema) >= 2:
        return True

    if len(guias_tema) != 1:
        return False

    relaciones = guias_tema[0].get("relaciones", {})
    hubs = len(relaciones.get("hubs_relacionados", []))
    fichas_relacionadas = relaciones.get("fichas_relacionadas", {})
    fichas = sum(len(listado) for listado in fichas_relacionadas.values())
    return hubs >= 2 and fichas >= 2


SITEMAPS_PUBLICOS = {
    "paginas": SitemapPaginasPublicas,
    "plantas": SitemapPlantasPublicas,
    "rituales": SitemapRitualesPublicos,
    "productos": SitemapProductosPublicos,
    "guias": SitemapGuiasEditorialesPublicas,
    "subhubs_guias": SitemapSubhubsEditorialesPublicos,
}
