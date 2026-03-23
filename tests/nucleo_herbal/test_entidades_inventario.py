from datetime import UTC, datetime

import pytest

from backend.nucleo_herbal.dominio.excepciones import ErrorDominio
from backend.nucleo_herbal.dominio.inventario import InventarioProducto



def test_inventario_identifica_bajo_stock() -> None:
    inventario = InventarioProducto(
        id_producto="prod-1",
        cantidad_disponible=2,
        umbral_bajo_stock=3,
    )

    assert inventario.bajo_stock is True



def test_ajuste_no_permite_stock_negativo() -> None:
    inventario = InventarioProducto(
        id_producto="prod-1",
        cantidad_disponible=1,
        umbral_bajo_stock=0,
    )

    with pytest.raises(ErrorDominio, match="stock negativo"):
        inventario.ajustar(-2, fecha_actualizacion=datetime.now(tz=UTC))
