"""Backoffice mínimo útil del Ciclo 1 y Ciclo 2 sobre Django Admin."""

from django.contrib import admin

from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
    IntencionModelo,
    PlantaModelo,
    ProductoModelo,
    RitualModelo,
)


@admin.action(description="Marcar intenciones como públicas")
def publicar_intenciones(modeladmin, request, queryset):
    queryset.update(es_publica=True)


@admin.action(description="Marcar intenciones como privadas")
def ocultar_intenciones(modeladmin, request, queryset):
    queryset.update(es_publica=False)


@admin.register(IntencionModelo)
class IntencionAdmin(admin.ModelAdmin):
    list_display = ("nombre", "slug", "es_publica")
    search_fields = ("nombre", "slug", "descripcion")
    list_filter = ("es_publica",)
    ordering = ("nombre",)
    list_editable = ("es_publica",)
    actions = (publicar_intenciones, ocultar_intenciones)


@admin.action(description="Publicar plantas")
def publicar_plantas(modeladmin, request, queryset):
    queryset.update(publicada=True)


@admin.action(description="Despublicar plantas")
def despublicar_plantas(modeladmin, request, queryset):
    queryset.update(publicada=False)


@admin.register(PlantaModelo)
class PlantaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "slug", "publicada", "mostrar_intenciones")
    search_fields = ("nombre", "slug", "descripcion_breve")
    list_filter = ("publicada", "intenciones")
    ordering = ("nombre",)
    list_editable = ("publicada",)
    filter_horizontal = ("intenciones",)
    actions = (publicar_plantas, despublicar_plantas)

    @admin.display(description="Intenciones")
    def mostrar_intenciones(self, obj):
        nombres = obj.intenciones.values_list("nombre", flat=True)
        return ", ".join(nombres)


@admin.action(description="Publicar productos")
def publicar_productos(modeladmin, request, queryset):
    queryset.update(publicado=True)


@admin.action(description="Despublicar productos")
def despublicar_productos(modeladmin, request, queryset):
    queryset.update(publicado=False)


@admin.register(ProductoModelo)
class ProductoAdmin(admin.ModelAdmin):
    list_display = (
        "nombre",
        "sku",
        "tipo_producto",
        "categoria_comercial",
        "planta",
        "publicado",
    )
    search_fields = ("nombre", "sku", "slug")
    list_filter = ("publicado", "tipo_producto", "categoria_comercial")
    ordering = ("nombre",)
    list_editable = ("publicado",)
    autocomplete_fields = ("planta",)
    actions = (publicar_productos, despublicar_productos)


@admin.action(description="Publicar rituales")
def publicar_rituales(modeladmin, request, queryset):
    queryset.update(publicado=True)


@admin.action(description="Despublicar rituales")
def despublicar_rituales(modeladmin, request, queryset):
    queryset.update(publicado=False)


@admin.register(RitualModelo)
class RitualAdmin(admin.ModelAdmin):
    list_display = (
        "nombre",
        "slug",
        "publicado",
        "mostrar_intenciones",
        "mostrar_plantas_relacionadas",
        "mostrar_productos_relacionados",
    )
    search_fields = (
        "nombre",
        "slug",
        "contexto_breve",
        "intenciones__nombre",
        "plantas_relacionadas__nombre",
        "productos_relacionados__nombre",
    )
    list_filter = (
        "publicado",
        "intenciones",
        "plantas_relacionadas",
        "productos_relacionados",
    )
    ordering = ("nombre",)
    list_editable = ("publicado",)
    filter_horizontal = ("intenciones", "plantas_relacionadas", "productos_relacionados")
    actions = (publicar_rituales, despublicar_rituales)

    @admin.display(description="Intenciones")
    def mostrar_intenciones(self, obj):
        nombres = obj.intenciones.values_list("nombre", flat=True)
        return ", ".join(nombres)

    @admin.display(description="Plantas relacionadas")
    def mostrar_plantas_relacionadas(self, obj):
        nombres = obj.plantas_relacionadas.values_list("nombre", flat=True)
        return ", ".join(nombres)

    @admin.display(description="Productos relacionados")
    def mostrar_productos_relacionados(self, obj):
        nombres = obj.productos_relacionados.values_list("nombre", flat=True)
        return ", ".join(nombres)
