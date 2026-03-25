"""Modelos ORM del checkout real v1 y postventa manual."""

from django.core.exceptions import ValidationError
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
    metodo_envio = models.CharField(max_length=32, default="envio_estandar")
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    importe_envio = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tipo_impositivo = models.DecimalField(max_digits=5, decimal_places=4, default=0.21)
    notas_cliente = models.TextField(blank=True, default="")
    direccion_entrega = models.JSONField(default=dict)
    fecha_creacion = models.DateTimeField()
    fecha_pago_confirmado = models.DateTimeField(null=True, blank=True)
    inventario_descontado = models.BooleanField(default=False)
    incidencia_stock_confirmacion = models.BooleanField(default=False)
    requiere_revision_manual = models.BooleanField(default=False)
    incidencia_stock_revisada = models.BooleanField(default=False)
    fecha_revision_incidencia_stock = models.DateTimeField(null=True, blank=True)
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
    email_cancelacion_enviado = models.BooleanField(default=False)
    fecha_email_cancelacion = models.DateTimeField(null=True, blank=True)
    cancelado_operativa_incidencia_stock = models.BooleanField(default=False)
    fecha_cancelacion_operativa = models.DateTimeField(null=True, blank=True)
    motivo_cancelacion_operativa = models.CharField(max_length=280, blank=True, default="")
    estado_reembolso = models.CharField(max_length=24, default="no_iniciado")
    fecha_reembolso = models.DateTimeField(null=True, blank=True)
    id_externo_reembolso = models.CharField(max_length=128, blank=True, default="")
    motivo_fallo_reembolso = models.CharField(max_length=280, blank=True, default="")
    email_reembolso_enviado = models.BooleanField(default=False)
    fecha_email_reembolso = models.DateTimeField(null=True, blank=True)
    inventario_restituido = models.BooleanField(default=False)
    fecha_restitucion_inventario = models.DateTimeField(null=True, blank=True)

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
    cantidad_comercial = models.PositiveIntegerField(default=1)
    unidad_comercial = models.CharField(max_length=8, default="ud")
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


class DevolucionPedidoModelo(models.Model):
    ESTADO_ABIERTA = "abierta"
    ESTADO_RECIBIDA = "recibida"
    ESTADO_ACEPTADA = "aceptada"
    ESTADO_RECHAZADA = "rechazada"
    ESTADO_CERRADA = "cerrada"
    ESTADOS = (
        (ESTADO_ABIERTA, "Abierta"),
        (ESTADO_RECIBIDA, "Recibida"),
        (ESTADO_ACEPTADA, "Aceptada"),
        (ESTADO_RECHAZADA, "Rechazada"),
        (ESTADO_CERRADA, "Cerrada"),
    )
    ESTADOS_ELIGIBLES_PEDIDO = ("entregado", "enviado")
    TRANSICIONES_VALIDAS = {
        ESTADO_ABIERTA: {ESTADO_RECIBIDA, ESTADO_RECHAZADA, ESTADO_CERRADA},
        ESTADO_RECIBIDA: {ESTADO_ACEPTADA, ESTADO_RECHAZADA, ESTADO_CERRADA},
        ESTADO_ACEPTADA: {ESTADO_CERRADA},
        ESTADO_RECHAZADA: {ESTADO_CERRADA},
        ESTADO_CERRADA: set(),
    }

    pedido = models.ForeignKey(PedidoRealModelo, on_delete=models.PROTECT, related_name="devoluciones")
    fecha_apertura = models.DateTimeField(auto_now_add=True)
    motivo = models.CharField(max_length=280)
    estado = models.CharField(max_length=24, choices=ESTADOS, default=ESTADO_ABIERTA)
    abierta_por = models.CharField(max_length=150, blank=True, default="")
    revisada_por = models.CharField(max_length=150, blank=True, default="")
    fecha_revision = models.DateTimeField(null=True, blank=True)
    observaciones = models.TextField(blank=True, default="")
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "nucleo_devolucion_pedido"
        ordering = ("-fecha_apertura",)
        verbose_name = "devolución manual"
        verbose_name_plural = "devoluciones manuales"
        indexes = [
            models.Index(fields=("estado", "fecha_apertura"), name="nuc_dev_estado_fecha_idx"),
            models.Index(fields=("pedido", "fecha_apertura"), name="nuc_dev_pedido_fecha_idx"),
        ]

    def __str__(self) -> str:
        return f"{self.pedido_id} · {self.estado}"

    @property
    def reembolso_operativo(self) -> str:
        if self.estado != self.ESTADO_ACEPTADA:
            return "no_aplica"
        if self.pedido.estado_reembolso == "ejecutado":
            return "ejecutado"
        if self.pedido.estado_reembolso == "fallido":
            return "fallido"
        return "pendiente"

    @property
    def restitucion_operativa(self) -> str:
        if self.estado != self.ESTADO_ACEPTADA:
            return "no_aplica"
        return "ejecutada" if self.pedido.inventario_restituido else "pendiente"

    @property
    def esta_resuelta_operativamente(self) -> bool:
        if self.estado != self.ESTADO_ACEPTADA:
            return False
        return self.reembolso_operativo == "ejecutado" and self.restitucion_operativa == "ejecutada"

    def clean(self) -> None:
        self.motivo = self.motivo.strip()
        if not self.motivo:
            raise ValidationError("La devolución manual requiere motivo.")
        if self._state.adding and not self.es_pedido_elegible_para_apertura(self.pedido):
            raise ValidationError("Solo se permite abrir devoluciones para pedidos enviados o entregados ya pagados.")
        if self.pk:
            previo = DevolucionPedidoModelo.objects.filter(pk=self.pk).values_list("estado", flat=True).first()
            if previo and previo != self.estado and self.estado not in self.TRANSICIONES_VALIDAS.get(previo, set()):
                raise ValidationError(f"Transición de devolución no permitida: {previo} -> {self.estado}.")

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    @classmethod
    def es_pedido_elegible_para_apertura(cls, pedido: PedidoRealModelo) -> bool:
        if pedido.estado not in cls.ESTADOS_ELIGIBLES_PEDIDO:
            return False
        if pedido.estado_pago != "pagado":
            return False
        return not pedido.cancelado_operativa_incidencia_stock
