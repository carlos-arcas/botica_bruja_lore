"""Persistencia Django para inventario operativo por producto."""

from django.db import models

from .models import ProductoModelo


class InventarioProductoModelo(models.Model):
    UNIDAD_BASE_UD = "ud"
    UNIDAD_BASE_G = "g"
    UNIDAD_BASE_ML = "ml"
    UNIDADES_BASE_CHOICES = (
        (UNIDAD_BASE_UD, "unidad"),
        (UNIDAD_BASE_G, "gramo"),
        (UNIDAD_BASE_ML, "mililitro"),
    )

    producto = models.OneToOneField(
        ProductoModelo,
        on_delete=models.PROTECT,
        related_name="inventario",
    )
    cantidad_disponible = models.PositiveIntegerField(default=0)
    unidad_base = models.CharField(max_length=2, choices=UNIDADES_BASE_CHOICES, default=UNIDAD_BASE_UD)
    umbral_bajo_stock = models.PositiveIntegerField(null=True, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "nucleo_inventario_producto"
        ordering = ("producto__nombre",)
        verbose_name = "inventario de producto"
        verbose_name_plural = "inventarios de producto"
        constraints = [
            models.CheckConstraint(
                check=models.Q(cantidad_disponible__gte=0),
                name="nucleo_inv_cantidad_no_negativa",
            ),
            models.CheckConstraint(
                check=models.Q(unidad_base__in=("ud", "g", "ml")),
                name="nucleo_inv_unidad_base_valida",
            ),
            models.CheckConstraint(
                check=models.Q(umbral_bajo_stock__isnull=True) | models.Q(umbral_bajo_stock__gte=0),
                name="nucleo_inv_umbral_no_negativo",
            ),
        ]
        indexes = [
            models.Index(fields=("cantidad_disponible",), name="nucleo_inv_cantidad_idx"),
            models.Index(fields=("umbral_bajo_stock",), name="nucleo_inv_umbral_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.producto.nombre} · {self.cantidad_disponible} {self.unidad_base}"


class MovimientoInventarioModelo(models.Model):
    TIPO_ALTA_INICIAL = "alta_inicial"
    TIPO_AJUSTE_MANUAL = "ajuste_manual"
    TIPO_DESCUENTO_PAGO = "descuento_pago"
    TIPO_RESTITUCION_MANUAL = "restitucion_manual"
    TIPOS_MOVIMIENTO = (
        (TIPO_ALTA_INICIAL, "Alta inicial"),
        (TIPO_AJUSTE_MANUAL, "Ajuste manual"),
        (TIPO_DESCUENTO_PAGO, "Descuento pago"),
        (TIPO_RESTITUCION_MANUAL, "Restitución manual"),
    )

    inventario = models.ForeignKey(
        InventarioProductoModelo,
        on_delete=models.PROTECT,
        related_name="movimientos",
    )
    tipo_movimiento = models.CharField(max_length=20, choices=TIPOS_MOVIMIENTO)
    cantidad = models.IntegerField()
    unidad_base = models.CharField(max_length=2, choices=InventarioProductoModelo.UNIDADES_BASE_CHOICES)
    referencia = models.CharField(max_length=100, blank=True, default="")
    metadata = models.JSONField(default=dict, blank=True)
    operation_id = models.CharField(max_length=64, blank=True, default="")
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "nucleo_movimiento_inventario"
        ordering = ("-fecha_creacion", "-id")
        verbose_name = "movimiento de inventario"
        verbose_name_plural = "movimientos de inventario"
        constraints = [
            models.CheckConstraint(
                check=~models.Q(cantidad=0),
                name="mov_inv_cant_no_cero",
            ),
            models.CheckConstraint(
                check=models.Q(unidad_base__in=("ud", "g", "ml")),
                name="mov_inv_unidad_valida",
            ),
            models.CheckConstraint(
                check=models.Q(tipo_movimiento__in=("alta_inicial", "ajuste_manual", "descuento_pago", "restitucion_manual")),
                name="mov_inv_tipo_valido",
            ),
            models.UniqueConstraint(
                fields=("inventario", "tipo_movimiento", "operation_id"),
                condition=~models.Q(operation_id=""),
                name="mov_inv_operacion_unica",
            ),
        ]
        indexes = [
            models.Index(fields=("inventario", "fecha_creacion"), name="mov_inv_inv_fecha_idx"),
            models.Index(fields=("tipo_movimiento", "fecha_creacion"), name="mov_inv_tipo_fecha_idx"),
            models.Index(fields=("operation_id",), name="mov_inv_op_idx"),
        ]
