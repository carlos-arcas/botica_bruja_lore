"""Modelos ORM del checkout real v1."""

from django.db import models


class PedidoRealModelo(models.Model):
    id_pedido = models.CharField(primary_key=True, max_length=64)
    estado = models.CharField(max_length=32)
    estado_pago = models.CharField(max_length=32, default="pendiente")
    proveedor_pago = models.CharField(max_length=32, blank=True, default="")
    id_externo_pago = models.CharField(max_length=128, blank=True, default="")
    url_pago = models.URLField(blank=True, default="")
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
    fecha_pago_confirmado = models.DateTimeField(null=True, blank=True)
    requiere_revision_manual = models.BooleanField(default=False)
    email_post_pago_enviado = models.BooleanField(default=False)
    fecha_email_post_pago = models.DateTimeField(null=True, blank=True)
    transportista = models.CharField(max_length=120, blank=True, default="")
    codigo_seguimiento = models.CharField(max_length=120, blank=True, default="")
    envio_sin_seguimiento = models.BooleanField(default=False)
    fecha_preparacion = models.DateTimeField(null=True, blank=True)
    fecha_envio = models.DateTimeField(null=True, blank=True)
    fecha_entrega = models.DateTimeField(null=True, blank=True)
    observaciones_operativas = models.TextField(blank=True, default="")
    email_envio_enviado = models.BooleanField(default=False)
    fecha_email_envio = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "nucleo_pedido"
        ordering = ("-fecha_creacion",)
        verbose_name = "pedido"
        verbose_name_plural = "pedidos"
        indexes = [
            models.Index(fields=("estado", "fecha_creacion"), name="nucleo_pedido_estado_fecha_idx"),
            models.Index(fields=("email_contacto", "fecha_creacion"), name="nucleo_pedido_email_fecha_idx"),
            models.Index(fields=("proveedor_pago", "id_externo_pago"), name="nucleo_pedido_pago_ext_idx"),
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


class EventoWebhookPagoModelo(models.Model):
    proveedor_pago = models.CharField(max_length=32)
    id_evento = models.CharField(max_length=128)
    payload_crudo = models.TextField()
    fecha_registro = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "nucleo_evento_webhook_pago"
        verbose_name = "evento webhook pago"
        verbose_name_plural = "eventos webhook pago"
        constraints = [
            models.UniqueConstraint(fields=("proveedor_pago", "id_evento"), name="nucleo_webhook_pago_unique_idx")
        ]

    def __str__(self) -> str:
        return f"{self.proveedor_pago}:{self.id_evento}"
