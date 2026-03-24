from datetime import UTC, datetime

import pytest

from backend.nucleo_herbal.aplicacion.casos_de_uso import ErrorAplicacionLookup
from backend.nucleo_herbal.aplicacion.casos_de_uso_inventario import (
    AjustarInventarioProducto,
    CrearInventarioInicialProducto,
    ListarInventarioOperativo,
    ObtenerInventarioProducto,
)
from backend.nucleo_herbal.aplicacion.puertos.repositorios import RepositorioProductos
from backend.nucleo_herbal.aplicacion.puertos.repositorios_inventario import RepositorioInventario
from backend.nucleo_herbal.dominio.entidades import Producto
from backend.nucleo_herbal.dominio.excepciones import ErrorDominio
from backend.nucleo_herbal.dominio.inventario import InventarioProducto


class RepositorioProductosMemoria(RepositorioProductos):
    def __init__(self, productos: dict[str, Producto]):
        self.productos = productos

    def obtener_por_id(self, id_producto: str) -> Producto | None:
        return self.productos.get(id_producto)

    def listar_herbales_por_planta(self, id_planta: str) -> tuple[Producto, ...]:
        return ()

    def listar_publicos_por_seccion(self, slug_seccion: str, filtros: dict[str, str]) -> tuple[Producto, ...]:
        return ()

    def obtener_publico_por_slug(self, slug_producto: str) -> Producto | None:
        return None


class RepositorioInventarioMemoria(RepositorioInventario):
    def __init__(self, inventarios: dict[str, InventarioProducto] | None = None):
        self.inventarios = inventarios or {}

    def obtener_por_id_producto(self, id_producto: str) -> InventarioProducto | None:
        return self.inventarios.get(id_producto)

    def crear_inicial(self, inventario: InventarioProducto) -> InventarioProducto:
        if inventario.id_producto in self.inventarios:
            raise ErrorDominio("Ya existe inventario para el producto indicado.")
        self.inventarios[inventario.id_producto] = inventario
        return inventario

    def guardar(self, inventario: InventarioProducto) -> InventarioProducto:
        if inventario.id_producto not in self.inventarios:
            raise ErrorDominio("No existe inventario previo para el producto indicado.")
        self.inventarios[inventario.id_producto] = inventario
        return inventario

    def listar_operativo(self, *, solo_bajo_stock: bool = False) -> tuple[InventarioProducto, ...]:
        inventarios = tuple(self.inventarios.values())
        if not solo_bajo_stock:
            return inventarios
        return tuple(item for item in inventarios if item.bajo_stock)


@pytest.fixture
def producto() -> Producto:
    return Producto(
        id="prod-1",
        sku="SKU-1",
        slug="prod-1",
        nombre="Producto 1",
        tipo_producto="herramientas-rituales",
        categoria_comercial="botica",
        planta_id=None,
    )



def test_crear_inventario_inicial(producto: Producto) -> None:
    repo_inventario = RepositorioInventarioMemoria()
    caso = CrearInventarioInicialProducto(repo_inventario, RepositorioProductosMemoria({producto.id: producto}))

    resultado = caso.ejecutar(id_producto=producto.id, cantidad_inicial=5, umbral_bajo_stock=2, operation_id="op-1")

    assert resultado.cantidad_disponible == 5
    assert resultado.unidad_base == "ud"
    assert resultado.bajo_stock is False


def test_crear_inventario_inicial_con_unidad_base_valida(producto: Producto) -> None:
    repo_inventario = RepositorioInventarioMemoria()
    caso = CrearInventarioInicialProducto(repo_inventario, RepositorioProductosMemoria({producto.id: producto}))

    resultado = caso.ejecutar(
        id_producto=producto.id,
        cantidad_inicial=250,
        umbral_bajo_stock=100,
        operation_id="op-unidad-g",
        unidad_base="g",
    )

    assert resultado.unidad_base == "g"
    assert resultado.cantidad_disponible == 250


def test_crear_inventario_inicial_rechaza_unidad_base_invalida(producto: Producto) -> None:
    repo_inventario = RepositorioInventarioMemoria()
    caso = CrearInventarioInicialProducto(repo_inventario, RepositorioProductosMemoria({producto.id: producto}))

    with pytest.raises(ErrorDominio, match="unidad base"):
        caso.ejecutar(
            id_producto=producto.id,
            cantidad_inicial=1,
            umbral_bajo_stock=0,
            operation_id="op-unidad-bad",
            unidad_base="kg",
        )



def test_rechazar_inventario_duplicado(producto: Producto) -> None:
    actual = InventarioProducto(id_producto=producto.id, cantidad_disponible=1, umbral_bajo_stock=0, fecha_creacion=datetime.now(tz=UTC))
    repo_inventario = RepositorioInventarioMemoria({producto.id: actual})
    caso = CrearInventarioInicialProducto(repo_inventario, RepositorioProductosMemoria({producto.id: producto}))

    with pytest.raises(ErrorDominio, match="Ya existe inventario"):
        caso.ejecutar(id_producto=producto.id, cantidad_inicial=5, umbral_bajo_stock=2, operation_id="op-2")



def test_ajustar_stock_al_alza_y_a_la_baja(producto: Producto) -> None:
    inventario = InventarioProducto(id_producto=producto.id, cantidad_disponible=4, umbral_bajo_stock=2, fecha_creacion=datetime.now(tz=UTC))
    repo = RepositorioInventarioMemoria({producto.id: inventario})

    aumento = AjustarInventarioProducto(repo).ejecutar(id_producto=producto.id, delta=3, operation_id="op-3")
    bajada = AjustarInventarioProducto(repo).ejecutar(id_producto=producto.id, delta=-5, operation_id="op-4")

    assert aumento.cantidad_disponible == 7
    assert bajada.cantidad_disponible == 2
    assert bajada.bajo_stock is True



def test_rechazar_ajuste_que_deja_stock_negativo(producto: Producto) -> None:
    inventario = InventarioProducto(id_producto=producto.id, cantidad_disponible=1, umbral_bajo_stock=0)
    repo = RepositorioInventarioMemoria({producto.id: inventario})

    with pytest.raises(ErrorDominio, match="stock negativo"):
        AjustarInventarioProducto(repo).ejecutar(id_producto=producto.id, delta=-2, operation_id="op-5")



def test_obtener_y_listar_inventario(producto: Producto) -> None:
    inventario = InventarioProducto(id_producto=producto.id, cantidad_disponible=2, umbral_bajo_stock=2)
    repo = RepositorioInventarioMemoria({producto.id: inventario})

    detalle = ObtenerInventarioProducto(repo).ejecutar(producto.id)
    listado = ListarInventarioOperativo(repo).ejecutar(solo_bajo_stock=True)

    assert detalle.id_producto == producto.id
    assert len(listado) == 1



def test_crear_inventario_falla_si_producto_no_existe() -> None:
    caso = CrearInventarioInicialProducto(RepositorioInventarioMemoria(), RepositorioProductosMemoria({}))

    with pytest.raises(ErrorAplicacionLookup, match="Producto no encontrado"):
        caso.ejecutar(id_producto="prod-x", cantidad_inicial=1, umbral_bajo_stock=None, operation_id="op-6")
