"""Registro admin para importación operativa."""

from django.contrib import admin

from .models import ImportacionFilaModelo, ImportacionLoteModelo


@admin.register(ImportacionLoteModelo)
class ImportacionLoteAdmin(admin.ModelAdmin):
    list_display = ("id", "entidad", "modo", "nombre_archivo", "total_filas", "usuario", "fecha_creacion")
    readonly_fields = ("entidad", "modo", "nombre_archivo", "columnas_detectadas", "total_filas", "usuario", "fecha_creacion", "fecha_actualizacion")


@admin.register(ImportacionFilaModelo)
class ImportacionFilaAdmin(admin.ModelAdmin):
    list_display = ("id", "lote", "numero_fila_original", "estado", "seleccionado")
    list_filter = ("estado", "seleccionado")
    readonly_fields = ("lote", "numero_fila_original", "datos", "errores", "warnings", "estado", "imagen", "resultado_confirmacion")
