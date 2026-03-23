"""Persistencia Django para inventario operativo por producto."""

from django.db import models

from .models import ProductoModelo


class InventarioProductoModelo(models.Model):
    producto = models.OneToOneField(
        ProductoModelo,
        on_delete=models.PROTECT,
        related_name="inventario",
    )
    cantidad_disponible = models.PositiveIntegerField(default=0)
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
                check=models.Q(umbral_bajo_stock__isnull=True) | models.Q(umbral_bajo_stock__gte=0),
                name="nucleo_inv_umbral_no_negativo",
            ),
        ]
        indexes = [
            models.Index(fields=("cantidad_disponible",), name="nucleo_inv_cantidad_idx"),
            models.Index(fields=("umbral_bajo_stock",), name="nucleo_inv_umbral_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.producto.nombre} · {self.cantidad_disponible} uds"
