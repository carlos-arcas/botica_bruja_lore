"""Adaptador Django del puerto transaccional de aplicación."""

from __future__ import annotations

from django.db import transaction

from ...aplicacion.puertos.transacciones import PuertoTransacciones


class TransaccionesDjango(PuertoTransacciones):
    def atomic(self):
        return transaction.atomic()
