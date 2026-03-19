"""Backoffice operativo sobre Django Admin para catálogo y contenido editorial."""

from django.contrib import admin

from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
    ArticuloEditorialModelo,
    CuentaDemoModelo,
    IntencionModelo,
    LineaPedidoModelo,
    LineaPedidoRealModelo,
    PedidoDemoModelo,
    PedidoRealModelo,
    PlantaModelo,
    ProductoModelo,
    RitualModelo,
    SeccionPublicaModelo,
    ImportacionLoteModelo,
    ImportacionFilaModelo,
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
    prepopulated_fields = {"slug": ("nombre",)}
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
    prepopulated_fields = {"slug": ("nombre",)}
    filter_horizontal = ("intenciones",)
    actions = (publicar_plantas, despublicar_plantas)

    @admin.display(description="Intenciones")
    def mostrar_intenciones(self, obj):
        nombres = obj.intenciones.values_list("nombre", flat=True)
        return ", ".join(nombres)


@admin.register(SeccionPublicaModelo)
class SeccionPublicaAdmin(admin.ModelAdmin):
    list_display = ("nombre", "slug", "orden", "publicada")
    search_fields = ("nombre", "slug", "descripcion")
    list_filter = ("publicada",)
    list_editable = ("orden", "publicada")
    ordering = ("orden", "nombre")
    prepopulated_fields = {"slug": ("nombre",)}


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
        "slug",
        "tipo_producto",
        "categoria_comercial",
        "seccion_publica",
        "beneficio_principal",
        "formato_comercial",
        "modo_uso",
        "orden_publicacion",
        "publicado",
    )
    search_fields = ("nombre", "sku", "slug", "categoria_comercial", "seccion_publica")
    list_filter = ("publicado", "tipo_producto", "categoria_comercial", "seccion_publica", "beneficio_principal", "formato_comercial", "modo_uso")
    ordering = ("orden_publicacion", "nombre")
    list_editable = ("orden_publicacion", "publicado")
    prepopulated_fields = {"slug": ("nombre",)}
    autocomplete_fields = ("planta",)
    actions = (publicar_productos, despublicar_productos)
    fieldsets = (
        (
            "Datos comerciales",
            {
                "fields": (
                    "sku",
                    "slug",
                    "nombre",
                    "tipo_producto",
                    "categoria_comercial",
                    "seccion_publica",
                    "beneficio_principal",
                    "beneficios_secundarios",
                    "formato_comercial",
                    "modo_uso",
                    "categoria_visible",
                    "orden_publicacion",
                    "publicado",
                )
            },
        ),
        (
            "Contenido público",
            {"fields": ("descripcion_corta", "precio_visible", "imagen_url")},
        ),
        ("Relaciones", {"fields": ("planta",)}),
    )


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
        "contenido",
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
    prepopulated_fields = {"slug": ("nombre",)}
    filter_horizontal = ("intenciones", "plantas_relacionadas", "productos_relacionados")
    actions = (publicar_rituales, despublicar_rituales)
    fieldsets = (
        (
            "Contenido editorial",
            {"fields": ("slug", "nombre", "contexto_breve", "contenido", "imagen_url", "publicado")},
        ),
        (
            "Relaciones",
            {"fields": ("intenciones", "plantas_relacionadas", "productos_relacionados")},
        ),
    )

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


@admin.action(description="Publicar artículos")
def publicar_articulos(modeladmin, request, queryset):
    queryset.update(publicado=True)


@admin.action(description="Despublicar artículos")
def despublicar_articulos(modeladmin, request, queryset):
    queryset.update(publicado=False)


@admin.register(ArticuloEditorialModelo)
class ArticuloEditorialAdmin(admin.ModelAdmin):
    list_display = (
        "titulo",
        "slug",
        "tema",
        "hub",
        "subhub",
        "seccion_publica",
        "indexable",
        "publicado",
        "fecha_publicacion",
        "fecha_actualizacion",
    )
    search_fields = ("titulo", "slug", "resumen", "contenido", "tema", "hub", "subhub")
    list_filter = ("publicado", "indexable", "tema", "hub", "subhub", "seccion_publica")
    ordering = ("-fecha_actualizacion", "titulo")
    list_editable = ("indexable", "publicado")
    prepopulated_fields = {"slug": ("titulo",)}
    autocomplete_fields = ("seccion_publica",)
    readonly_fields = ("fecha_creacion", "fecha_actualizacion")
    actions = (publicar_articulos, despublicar_articulos)
    fieldsets = (
        (
            "Contenido",
            {
                "fields": (
                    "slug",
                    "titulo",
                    "resumen",
                    "contenido",
                    "imagen_url",
                )
            },
        ),
        (
            "Clasificación",
            {"fields": ("tema", "hub", "subhub", "seccion_publica")},
        ),
        (
            "Publicación",
            {"fields": ("indexable", "publicado", "fecha_publicacion")},
        ),
        (
            "Trazabilidad",
            {"fields": ("fecha_creacion", "fecha_actualizacion")},
        ),
    )


@admin.register(CuentaDemoModelo)
class CuentaDemoAdmin(admin.ModelAdmin):
    list_display = ("id_usuario", "email", "nombre_visible", "fecha_creacion")
    search_fields = ("id_usuario", "email", "nombre_visible")
    ordering = ("email",)
    readonly_fields = ("id_usuario", "email", "fecha_creacion", "fecha_actualizacion")


class LineaPedidoInline(admin.TabularInline):
    model = LineaPedidoModelo
    extra = 0
    can_delete = False
    fields = (
        "id_producto",
        "slug_producto",
        "nombre_producto",
        "cantidad",
        "precio_unitario_demo",
    )
    readonly_fields = fields


@admin.register(PedidoDemoModelo)
class PedidoDemoAdmin(admin.ModelAdmin):
    list_display = (
        "id_pedido",
        "email_contacto",
        "canal_compra",
        "estado",
        "total_lineas",
        "fecha_creacion",
    )
    search_fields = ("id_pedido", "email_contacto")
    list_filter = ("estado", "canal_compra", "fecha_creacion")
    ordering = ("-fecha_creacion",)
    list_editable = ("estado",)
    readonly_fields = ("id_pedido", "email_contacto", "canal_compra", "fecha_creacion", "id_usuario")
    inlines = (LineaPedidoInline,)

    @admin.display(description="nº líneas")
    def total_lineas(self, obj):
        return obj.lineas.count()


@admin.register(ImportacionLoteModelo)
class ImportacionLoteAdmin(admin.ModelAdmin):
    list_display = ("id", "entidad", "modo", "nombre_archivo", "total_filas", "usuario", "fecha_creacion")
    readonly_fields = ("entidad", "modo", "nombre_archivo", "columnas_detectadas", "total_filas", "usuario", "fecha_creacion", "fecha_actualizacion")


@admin.register(ImportacionFilaModelo)
class ImportacionFilaAdmin(admin.ModelAdmin):
    list_display = ("id", "lote", "numero_fila_original", "estado", "seleccionado")
    list_filter = ("estado", "seleccionado")
    readonly_fields = ("lote", "numero_fila_original", "datos", "errores", "warnings", "estado", "imagen", "resultado_confirmacion")


class LineaPedidoRealInline(admin.TabularInline):
    model = LineaPedidoRealModelo
    extra = 0
    can_delete = False
    readonly_fields = ("id_producto", "slug_producto", "nombre_producto", "cantidad", "precio_unitario", "moneda")


@admin.register(PedidoRealModelo)
class PedidoRealAdmin(admin.ModelAdmin):
    list_display = ("id_pedido", "estado", "canal_checkout", "email_contacto", "subtotal", "moneda", "fecha_creacion")
    search_fields = ("id_pedido", "email_contacto", "nombre_contacto")
    list_filter = ("estado", "canal_checkout", "es_invitado", "moneda")
    ordering = ("-fecha_creacion",)
    readonly_fields = ("fecha_creacion", "direccion_entrega")
    inlines = (LineaPedidoRealInline,)
