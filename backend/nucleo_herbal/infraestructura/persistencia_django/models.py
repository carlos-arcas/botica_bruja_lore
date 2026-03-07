"""Modelos ORM mínimos del núcleo herbal para Ciclo 1."""

from django.db import models


class IntencionModelo(models.Model):
    id = models.CharField(primary_key=True, max_length=36)
    slug = models.SlugField(unique=True, max_length=80)
    nombre = models.CharField(max_length=120)
    descripcion = models.TextField(blank=True)
    es_publica = models.BooleanField(default=True)

    class Meta:
        db_table = "nucleo_intencion"
        ordering = ("nombre",)


class PlantaModelo(models.Model):
    id = models.CharField(primary_key=True, max_length=36)
    slug = models.SlugField(unique=True, max_length=80)
    nombre = models.CharField(max_length=120)
    descripcion_breve = models.TextField()
    publicada = models.BooleanField(default=True)
    intenciones = models.ManyToManyField(IntencionModelo, related_name="plantas")

    class Meta:
        db_table = "nucleo_planta"
        ordering = ("nombre",)


class ProductoModelo(models.Model):
    id = models.CharField(primary_key=True, max_length=36)
    sku = models.CharField(unique=True, max_length=40)
    slug = models.SlugField(unique=True, max_length=120)
    nombre = models.CharField(max_length=180)
    tipo_producto = models.CharField(max_length=80)
    categoria_comercial = models.CharField(max_length=80)
    planta = models.ForeignKey(
        PlantaModelo,
        on_delete=models.PROTECT,
        related_name="productos",
        null=True,
        blank=True,
    )
    publicado = models.BooleanField(default=True)

    class Meta:
        db_table = "nucleo_producto"
        ordering = ("nombre",)
