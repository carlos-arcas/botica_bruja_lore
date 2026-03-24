"""Proveedor de envío estándar v1 con tarifa fija configurable."""

from __future__ import annotations

import logging
from decimal import Decimal

from django.conf import settings

from ..aplicacion.puertos.proveedor_envio import PuertoProveedorEnvio

logger = logging.getLogger(__name__)


class ProveedorEnvioEstandarFijo(PuertoProveedorEnvio):
    def resolver_importe_envio_estandar(self, *, moneda: str, operation_id: str) -> Decimal:
        importe = Decimal(str(getattr(settings, "ENVIO_ESTANDAR_IMPORTE", "4.90")))
        logger.info(
            "pedido_real_envio_estandar_resuelto",
            extra={
                "operation_id": operation_id,
                "flujo": "checkout_real_v1",
                "metodo_envio": "envio_estandar",
                "moneda": moneda,
                "importe_envio": str(importe),
                "resultado": "ok",
            },
        )
        return importe
