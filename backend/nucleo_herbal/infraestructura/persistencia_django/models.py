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
    seccion_publica = models.SlugField(max_length=80, default="catalogo-general")
    descripcion_corta = models.TextField(blank=True, default="")
    precio_visible = models.CharField(max_length=80, blank=True, default="")
    precio_numerico = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    imagen_url = models.CharField(max_length=255, blank=True, default="")
    beneficio_principal = models.SlugField(max_length=80, blank=True, default="")
    beneficios_secundarios = models.CharField(max_length=255, blank=True, default="")
    formato_comercial = models.SlugField(max_length=80, blank=True, default="")
    modo_uso = models.SlugField(max_length=80, blank=True, default="")
    categoria_visible = models.SlugField(max_length=80, blank=True, default="")
    orden_publicacion = models.PositiveIntegerField(default=100)
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
        ordering = ("orden_publicacion", "nombre")
        verbose_name = "producto"
        verbose_name_plural = "productos"
        indexes = [
            models.Index(fields=("seccion_publica", "publicado", "slug"), name="nucleo_prod_seccion_public_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.nombre} [{self.sku}]"


class RitualModelo(models.Model):
    id = models.CharField(primary_key=True, max_length=36)
    slug = models.SlugField(unique=True, max_length=120)
    nombre = models.CharField(max_length=180)
    contexto_breve = models.TextField()
    contenido = models.TextField(blank=True, default="")
    imagen_url = models.CharField(max_length=255, blank=True, default="")
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


class ReglaCalendarioModelo(models.Model):
    id = models.CharField(primary_key=True, max_length=36)
    ritual = models.ForeignKey(
        RitualModelo,
        on_delete=models.PROTECT,
        related_name="reglas_calendario",
    )
    nombre = models.CharField(max_length=180)
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    prioridad = models.PositiveIntegerField(default=100)
    activa = models.BooleanField(default=True)

    class Meta:
        db_table = "nucleo_regla_calendario"
        ordering = ("prioridad", "id")
        verbose_name = "regla de calendario"
        verbose_name_plural = "reglas de calendario"
        constraints = [
            models.CheckConstraint(
                check=models.Q(fecha_fin__gte=models.F("fecha_inicio")),
                name="nucleo_regla_calendario_rango_valido",
            )
        ]
        indexes = [
            models.Index(fields=("activa", "fecha_inicio", "fecha_fin"), name="nucleo_regl_activa_c83a4f_idx"),
            models.Index(fields=("ritual", "activa", "prioridad"), name="nucleo_regl_ritual__1999ce_idx"),
        ]

    def __str__(self) -> str:
        return self.nombre


class SeccionPublicaModelo(models.Model):
    slug = models.SlugField(unique=True, max_length=80)
    nombre = models.CharField(max_length=120)
    descripcion = models.TextField(blank=True, default="")
    orden = models.PositiveIntegerField(default=100)
    publicada = models.BooleanField(default=True)

    class Meta:
        db_table = "nucleo_seccion_publica"
        ordering = ("orden", "nombre")
        verbose_name = "sección pública"
        verbose_name_plural = "secciones públicas"

    def __str__(self) -> str:
        return self.nombre


class ArticuloEditorialModelo(models.Model):
    slug = models.SlugField(unique=True, max_length=140)
    titulo = models.CharField(max_length=200)
    resumen = models.TextField(blank=True, default="")
    contenido = models.TextField()
    tema = models.CharField(max_length=120, blank=True, default="")
    hub = models.CharField(max_length=120, blank=True, default="")
    subhub = models.CharField(max_length=120, blank=True, default="")
    imagen_url = models.CharField(max_length=255, blank=True, default="")
    indexable = models.BooleanField(default=True)
    publicado = models.BooleanField(default=False)
    seccion_publica = models.ForeignKey(
        SeccionPublicaModelo,
        on_delete=models.PROTECT,
        related_name="articulos",
        null=True,
        blank=True,
    )
    fecha_publicacion = models.DateTimeField(null=True, blank=True)
    productos_relacionados = models.ManyToManyField(
        ProductoModelo,
        related_name="articulos_editoriales",
        blank=True,
        help_text="Productos relacionados con el artículo para continuidad comercial.",
    )
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "nucleo_articulo_editorial"
        ordering = ("-fecha_actualizacion", "titulo")
        verbose_name = "artículo editorial"
        verbose_name_plural = "artículos editoriales"
        indexes = [
            models.Index(fields=("publicado", "indexable", "slug")),
            models.Index(fields=("tema", "hub", "subhub")),
        ]

    def __str__(self) -> str:
        return self.titulo


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


class CuentaDemoModelo(models.Model):
    id_usuario = models.CharField(primary_key=True, max_length=64)
    email = models.EmailField(max_length=254, unique=True)
    nombre_visible = models.CharField(max_length=120)
    clave_acceso_demo = models.CharField(max_length=120)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "nucleo_cuenta_demo"
        ordering = ("email",)
        verbose_name = "cuenta demo"
        verbose_name_plural = "cuentas demo"

    def __str__(self) -> str:
        return self.email


class ImportacionLoteModelo(models.Model):
    entidad = models.CharField(max_length=64)
    modo = models.CharField(max_length=32)
    nombre_archivo = models.CharField(max_length=255)
    columnas_detectadas = models.JSONField(default=list)
    total_filas = models.PositiveIntegerField(default=0)
    usuario = models.ForeignKey("auth.User", on_delete=models.PROTECT, related_name="lotes_importacion")
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "nucleo_importacion_lote"
        ordering = ("-fecha_creacion",)
        verbose_name = "lote de importación"
        verbose_name_plural = "lotes de importación"


class ImportacionFilaModelo(models.Model):
    ESTADO_VALIDA = "valida"
    ESTADO_WARNING = "valida_warning"
    ESTADO_INVALIDA = "invalida"
    ESTADO_DESCARTADA = "descartada"
    ESTADO_CONFIRMADA = "confirmada"
    ESTADOS = (
        (ESTADO_VALIDA, "Válida"),
        (ESTADO_WARNING, "Válida con warning"),
        (ESTADO_INVALIDA, "Inválida"),
        (ESTADO_DESCARTADA, "Descartada"),
        (ESTADO_CONFIRMADA, "Confirmada"),
    )

    lote = models.ForeignKey(ImportacionLoteModelo, on_delete=models.CASCADE, related_name="filas")
    numero_fila_original = models.PositiveIntegerField()
    datos = models.JSONField(default=dict)
    errores = models.JSONField(default=list)
    warnings = models.JSONField(default=list)
    estado = models.CharField(max_length=24, choices=ESTADOS, default=ESTADO_INVALIDA)
    seleccionado = models.BooleanField(default=True)
    imagen = models.CharField(max_length=255, blank=True, default="")
    resultado_confirmacion = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        db_table = "nucleo_importacion_fila"
        ordering = ("numero_fila_original", "id")
        verbose_name = "fila de importación"
        verbose_name_plural = "filas de importación"


from .models_pedidos import LineaPedidoRealModelo, PedidoRealModelo
