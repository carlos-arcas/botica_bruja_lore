from decimal import Decimal

import pytest

from backend.nucleo_herbal.aplicacion.casos_de_uso_pedidos import RegistrarPedido
from backend.nucleo_herbal.aplicacion.errores_pedidos import ErrorStockPedido
from backend.nucleo_herbal.aplicacion.puertos.repositorios_cuentas_cliente import RepositorioCuentasCliente
from backend.nucleo_herbal.aplicacion.puertos.proveedor_envio import PuertoProveedorEnvio
from backend.nucleo_herbal.aplicacion.puertos.repositorios_inventario import RepositorioInventario
from backend.nucleo_herbal.aplicacion.puertos.repositorios_pedidos import RepositorioPedidos
from backend.nucleo_herbal.dominio.inventario import InventarioProducto
from backend.nucleo_herbal.dominio.pedidos import ClientePedido, DireccionEntrega, LineaPedido, PayloadPedido, Pedido


class RepositorioPedidosMemoria(RepositorioPedidos):
    def __init__(self) -> None:
        self.guardados: list[Pedido] = []

    def guardar(self, pedido: Pedido) -> Pedido:
        self.guardados.append(pedido)
        return pedido

    def obtener_por_id(self, id_pedido: str) -> Pedido | None:
        return next((pedido for pedido in self.guardados if pedido.id_pedido == id_pedido), None)

    def obtener_por_id_para_actualizar(self, id_pedido: str) -> Pedido | None:
        return self.obtener_por_id(id_pedido)

    def obtener_por_pago_externo(self, proveedor_pago: str, id_externo_pago: str) -> Pedido | None:
        return None

    def guardar_evento_webhook(self, proveedor_pago: str, id_evento: str, payload_crudo: str) -> bool:
        return True

    def listar(self, *, estados: tuple[str, ...] = (), solo_pagados: bool = False) -> tuple[Pedido, ...]:
        return tuple(self.guardados)

    def listar_por_id_usuario(self, id_usuario: str) -> tuple[Pedido, ...]:
        return tuple()

    def obtener_por_id_y_usuario(self, *, id_pedido: str, id_usuario: str) -> Pedido | None:
        return None


class RepositorioInventarioMemoria(RepositorioInventario):
    def __init__(self, inventarios: dict[str, InventarioProducto] | None = None) -> None:
        self.inventarios = inventarios or {}

    def obtener_por_id_producto(self, id_producto: str) -> InventarioProducto | None:
        return self.inventarios.get(id_producto)

    def crear_inicial(self, inventario: InventarioProducto) -> InventarioProducto:
        self.inventarios[inventario.id_producto] = inventario
        return inventario

    def guardar(self, inventario: InventarioProducto) -> InventarioProducto:
        self.inventarios[inventario.id_producto] = inventario
        return inventario

    def listar_operativo(self, *, solo_bajo_stock: bool = False) -> tuple[InventarioProducto, ...]:
        return tuple(self.inventarios.values())

    def obtener_para_actualizar_por_ids_producto(self, ids_producto: tuple[str, ...]) -> dict[str, InventarioProducto]:
        return {id_producto: self.inventarios[id_producto] for id_producto in ids_producto if id_producto in self.inventarios}


class RepositorioCuentasClienteStub(RepositorioCuentasCliente):
    def registrar(self, *, email: str, nombre_visible: str, password_plano: str):
        return None

    def autenticar(self, credenciales):
        return None

    def obtener_por_email(self, email: str):
        return None

    def obtener_por_id_usuario(self, id_usuario: str):
        return None

    def listar_direcciones(self, *, id_usuario: str):
        return tuple()

    def obtener_direccion_por_id(self, *, id_direccion: str):
        return None

    def crear_direccion(self, *, id_usuario: str, comando):
        return None

    def actualizar_direccion(self, *, id_usuario: str, id_direccion: str, comando):
        return None

    def eliminar_direccion(self, *, id_usuario: str, id_direccion: str) -> bool:
        return False

    def marcar_direccion_predeterminada(self, *, id_usuario: str, id_direccion: str):
        return None

    def crear_solicitud_verificacion(self, *, id_usuario: str, token_hash: str, expira_en):
        return None

    def obtener_solicitud_por_token_hash(self, token_hash: str):
        return None

    def marcar_email_verificado(self, *, id_usuario: str, token_hash: str):
        return None

    def obtener_solicitud_activa_por_usuario(self, id_usuario: str):
        return None

    def crear_solicitud_recuperacion_password(self, *, id_usuario: str, token_hash: str, expira_en):
        return None

    def obtener_solicitud_recuperacion_por_token_hash(self, token_hash: str):
        return None

    def actualizar_password(self, *, id_usuario: str, password_plano: str, token_hash: str):
        return None


class ProveedorEnvioFijoStub(PuertoProveedorEnvio):
    def __init__(self, importe: Decimal = Decimal("4.90")) -> None:
        self.importe = importe

    def resolver_importe_envio_estandar(self, *, moneda: str, operation_id: str) -> Decimal:
        return self.importe


def test_registrar_pedido_real_con_stock_suficiente_persiste() -> None:
    repo_pedidos = RepositorioPedidosMemoria()
    caso = RegistrarPedido(
        repositorio_pedidos=repo_pedidos,
        repositorio_cuentas_cliente=RepositorioCuentasClienteStub(),
        repositorio_inventario=RepositorioInventarioMemoria(
            {"prod-1": InventarioProducto(id_producto="prod-1", cantidad_disponible=3)}
        ),
        proveedor_envio=ProveedorEnvioFijoStub(),
    )

    resultado = caso.ejecutar(_payload_base(), operation_id="op-stock-ok")

    assert resultado.estado == "pendiente_pago"
    assert resultado.importe_envio == Decimal("4.90")
    assert resultado.total == Decimal("22.90")
    assert len(repo_pedidos.guardados) == 1


def test_rechaza_producto_sin_inventario() -> None:
    repo_pedidos = RepositorioPedidosMemoria()
    caso = RegistrarPedido(
        repositorio_pedidos=repo_pedidos,
        repositorio_cuentas_cliente=RepositorioCuentasClienteStub(),
        repositorio_inventario=RepositorioInventarioMemoria(),
        proveedor_envio=ProveedorEnvioFijoStub(),
    )

    with pytest.raises(ErrorStockPedido) as error:
        caso.ejecutar(_payload_base(), operation_id="op-stock-missing")

    assert error.value.codigo == "stock_no_disponible"
    assert error.value.lineas[0].codigo == "inventario_no_registrado"
    assert repo_pedidos.guardados == []


def test_rechaza_producto_con_stock_insuficiente() -> None:
    repo_pedidos = RepositorioPedidosMemoria()
    caso = RegistrarPedido(
        repositorio_pedidos=repo_pedidos,
        repositorio_cuentas_cliente=RepositorioCuentasClienteStub(),
        repositorio_inventario=RepositorioInventarioMemoria(
            {"prod-1": InventarioProducto(id_producto="prod-1", cantidad_disponible=1)}
        ),
        proveedor_envio=ProveedorEnvioFijoStub(),
    )

    with pytest.raises(ErrorStockPedido) as error:
        caso.ejecutar(_payload_base(), operation_id="op-stock-low")

    assert error.value.lineas[0].codigo == "stock_insuficiente"
    assert error.value.lineas[0].cantidad_disponible == 1
    assert repo_pedidos.guardados == []


def test_rechaza_pedido_completo_si_una_linea_falla() -> None:
    repo_pedidos = RepositorioPedidosMemoria()
    caso = RegistrarPedido(
        repositorio_pedidos=repo_pedidos,
        repositorio_cuentas_cliente=RepositorioCuentasClienteStub(),
        repositorio_inventario=RepositorioInventarioMemoria(
            {
                "prod-1": InventarioProducto(id_producto="prod-1", cantidad_disponible=5),
                "prod-2": InventarioProducto(id_producto="prod-2", cantidad_disponible=0),
            }
        ),
        proveedor_envio=ProveedorEnvioFijoStub(),
    )

    with pytest.raises(ErrorStockPedido) as error:
        caso.ejecutar(_payload_dos_lineas(), operation_id="op-stock-multi")

    assert len(error.value.lineas) == 1
    assert error.value.lineas[0].id_producto == "prod-2"
    assert repo_pedidos.guardados == []


def _payload_base() -> PayloadPedido:
    return PayloadPedido(
        canal_checkout="web_invitado",
        cliente=ClientePedido(
            id_cliente=None,
            email="real@test.dev",
            nombre_contacto="Lore",
            telefono_contacto="600111222",
            es_invitado=True,
        ),
        direccion_entrega=DireccionEntrega(
            nombre_destinatario="Lore",
            linea_1="Calle Luna 1",
            codigo_postal="28001",
            ciudad="Madrid",
            provincia="Madrid",
            pais_iso="ES",
            observaciones="Portal azul",
        ),
        lineas=(
            LineaPedido(
                id_producto="prod-1",
                slug_producto="tarot-bosque-interior",
                nombre_producto="Tarot bosque interior",
                cantidad_comercial=2,
                unidad_comercial="ud", precio_unitario=Decimal("9.00"),
                moneda="EUR",
            ),
        ),
        notas_cliente="Entrega de tarde.",
        moneda="EUR",
        id_direccion_guardada=None,
    )


def _payload_dos_lineas() -> PayloadPedido:
    base = _payload_base()
    return PayloadPedido(
        canal_checkout=base.canal_checkout,
        cliente=base.cliente,
        direccion_entrega=base.direccion_entrega,
        lineas=base.lineas
        + (
            LineaPedido(
                id_producto="prod-2",
                slug_producto="vela-intencion-clara",
                nombre_producto="Vela intención clara",
                cantidad_comercial=1,
                unidad_comercial="ud", precio_unitario=Decimal("12.00"),
                moneda="EUR",
            ),
        ),
        notas_cliente=base.notas_cliente,
        moneda=base.moneda,
        id_direccion_guardada=base.id_direccion_guardada,
    )
