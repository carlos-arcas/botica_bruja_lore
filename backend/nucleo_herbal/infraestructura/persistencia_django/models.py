"""Modelos ORM mínimos del núcleo herbal para Ciclo 1 y 2."""

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
        verbose_name = "intención"
        verbose_name_plural = "intenciones"

    def __str__(self) -> str:
        return self.nombre


class PlantaModelo(models.Model):
    id = models.CharField(primary_key=True, max_length=36)
    slug = models.SlugField(unique=True, max_length=80)
    nombre = models.CharField(max_length=120)
    descripcion_breve = models.TextField()
    publicada = models.BooleanField(default=True)
    intenciones = models.ManyToManyField(
        IntencionModelo,
        related_name="plantas",
        help_text="Intenciones editoriales vinculadas al descubrimiento herbal.",
    )

    class Meta:
        db_table = "nucleo_planta"
        ordering = ("nombre",)
        verbose_name = "planta"
        verbose_name_plural = "plantas"

    def __str__(self) -> str:
        return self.nombre


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
        help_text="Planta asociada cuando el producto es herbal.",
    )
    publicado = models.BooleanField(default=True)

    class Meta:
        db_table = "nucleo_producto"
        ordering = ("nombre",)
        verbose_name = "producto"
        verbose_name_plural = "productos"

    def __str__(self) -> str:
        return f"{self.nombre} [{self.sku}]"


class RitualModelo(models.Model):
    id = models.CharField(primary_key=True, max_length=36)
    slug = models.SlugField(unique=True, max_length=120)
    nombre = models.CharField(max_length=180)
    contexto_breve = models.TextField()
    publicado = models.BooleanField(default=True)
    intenciones = models.ManyToManyField(
        IntencionModelo,
        related_name="rituales",
        help_text="Intenciones editoriales que guían el descubrimiento del ritual.",
    )
    plantas_relacionadas = models.ManyToManyField(
        PlantaModelo,
        related_name="rituales",
        blank=True,
        help_text="Plantas conectadas editorialmente al ritual.",
    )
    productos_relacionados = models.ManyToManyField(
        ProductoModelo,
        related_name="rituales",
        blank=True,
        help_text="Productos conectados al ritual sin convertirlo en categoría comercial.",
    )

    class Meta:
        db_table = "nucleo_ritual"
        ordering = ("nombre",)
        verbose_name = "ritual"
        verbose_name_plural = "rituales"

    def __str__(self) -> str:
        return self.nombre


class PedidoDemoModelo(models.Model):
    id_pedido = models.CharField(primary_key=True, max_length=64)
    email_contacto = models.EmailField(max_length=254)
    canal_compra = models.CharField(max_length=20)
    estado = models.CharField(max_length=20)
    fecha_creacion = models.DateTimeField()
    id_usuario = models.CharField(max_length=64, null=True, blank=True)

    class Meta:
        db_table = "nucleo_pedido_demo"
        ordering = ("-fecha_creacion",)
        verbose_name = "pedido demo"
        verbose_name_plural = "pedidos demo"

    def __str__(self) -> str:
        return self.id_pedido


class LineaPedidoModelo(models.Model):
    pedido = models.ForeignKey(
        PedidoDemoModelo,
        on_delete=models.CASCADE,
        related_name="lineas",
    )
    id_producto = models.CharField(max_length=64)
    slug_producto = models.SlugField(max_length=140)
    nombre_producto = models.CharField(max_length=180)
    cantidad = models.PositiveIntegerField()
    precio_unitario_demo = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = "nucleo_linea_pedido_demo"
        ordering = ("id",)
        verbose_name = "línea de pedido demo"
        verbose_name_plural = "líneas de pedido demo"

    def __str__(self) -> str:
        return f"{self.pedido_id} · {self.slug_producto}"
