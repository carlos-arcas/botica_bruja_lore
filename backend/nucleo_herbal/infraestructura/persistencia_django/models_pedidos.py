"""Modelos ORM del checkout real v1."""

from django.db import models


class PedidoRealModelo(models.Model):
    id_pedido = models.CharField(primary_key=True, max_length=64)
    estado = models.CharField(max_length=32)
    canal_checkout = models.CharField(max_length=32)
    email_contacto = models.EmailField(max_length=254)
    nombre_contacto = models.CharField(max_length=160)
    telefono_contacto = models.CharField(max_length=40)
    id_usuario = models.CharField(max_length=64, null=True, blank=True)
    es_invitado = models.BooleanField(default=True)
    moneda = models.CharField(max_length=8, default="EUR")
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    notas_cliente = models.TextField(blank=True, default="")
    direccion_entrega = models.JSONField(default=dict)
    fecha_creacion = models.DateTimeField()

    class Meta:
        db_table = "nucleo_pedido"
        ordering = ("-fecha_creacion",)
        verbose_name = "pedido"
        verbose_name_plural = "pedidos"
        indexes = [
            models.Index(fields=("estado", "fecha_creacion"), name="nucleo_pedido_estado_fecha_idx"),
            models.Index(fields=("email_contacto", "fecha_creacion"), name="nucleo_pedido_email_fecha_idx"),
        ]

    def __str__(self) -> str:
        return self.id_pedido


class LineaPedidoRealModelo(models.Model):
    pedido = models.ForeignKey(PedidoRealModelo, on_delete=models.CASCADE, related_name="lineas")
    id_producto = models.CharField(max_length=64)
    slug_producto = models.SlugField(max_length=140)
    nombre_producto = models.CharField(max_length=180)
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    moneda = models.CharField(max_length=8, default="EUR")

    class Meta:
        db_table = "nucleo_linea_pedido"
        ordering = ("id",)
        verbose_name = "línea de pedido"
        verbose_name_plural = "líneas de pedido"

    def __str__(self) -> str:
        return f"{self.pedido_id} · {self.slug_producto}"
