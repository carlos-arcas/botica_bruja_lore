"""Cableado de dependencias de aplicación para la API pública."""

from dataclasses import dataclass

from ...aplicacion.casos_de_uso import (
    ObtenerDetallePlanta,
    ObtenerDetallePublicoProductoPorSlug,
    ObtenerListadoHerbalNavegable,
    ObtenerListadoPublicoProductosPorSeccion,
    ObtenerRelacionesHerbalesPorIntencion,
    ObtenerResolucionComercialMinimaDePlanta,
)
from ...aplicacion.casos_de_uso_calendario_ritual import ConsultarCalendarioRitualPorFecha
from ...aplicacion.casos_de_uso_cuentas_demo import (
    AutenticarCuentaDemo,
    ObtenerHistorialPedidosDemoCuenta,
    ObtenerPerfilCuentaDemo,
    RegistrarCuentaDemo,
)
from ...aplicacion.casos_de_uso_email_demo import (
    ComponerEmailDemoPedido,
    ObtenerEmailDemoPedidoPorId,
)
from ...aplicacion.casos_de_uso_pedidos import ObtenerPedidoPorId, RegistrarPedido
from ...aplicacion.casos_de_uso_pago_pedidos import IniciarPagoPedido, ProcesarWebhookPagoPedido
from ...aplicacion.casos_de_uso_pedidos_demo import (
    ObtenerPedidoDemoPorId,
    RegistrarPedidoDemo,
)
from ...aplicacion.casos_de_uso_rituales import (
    ObtenerDetalleRitual,
    ObtenerListadoRitualNavegable,
    ObtenerPlantasRelacionadasDeRitual,
    ObtenerProductosRelacionadosDeRitual,
    ObtenerRitualesRelacionadosDePlantaPorSlug,
    ObtenerRitualesRelacionadosPorIntencion,
)
from ...infraestructura.persistencia_django.repositorios import (
    ProveedorHistorialPedidosDemoORM,
    RepositorioCuentasDemoORM,
    RepositorioReglasCalendarioORM,
    RepositorioPlantasORM,
    RepositorioProductosORM,
    RepositorioPedidosDemoORM,
    RepositorioRitualesORM,
)
from ...infraestructura.pagos_stripe import construir_pasarela_pago_stripe
from ...infraestructura.persistencia_django.repositorios_pedidos import RepositorioPedidosORM


@dataclass(frozen=True, slots=True)
class ServiciosPublicosHerbales:
    listado_herbal: ObtenerListadoHerbalNavegable
    detalle_planta: ObtenerDetallePlanta
    resolucion_comercial: ObtenerResolucionComercialMinimaDePlanta
    listado_productos_por_seccion: ObtenerListadoPublicoProductosPorSeccion
    detalle_producto: ObtenerDetallePublicoProductoPorSlug
    relaciones_por_intencion: ObtenerRelacionesHerbalesPorIntencion
    rituales_por_planta: ObtenerRitualesRelacionadosDePlantaPorSlug


@dataclass(frozen=True, slots=True)
class ServiciosPublicosRituales:
    listado_ritual: ObtenerListadoRitualNavegable
    detalle_ritual: ObtenerDetalleRitual
    plantas_por_ritual: ObtenerPlantasRelacionadasDeRitual
    productos_por_ritual: ObtenerProductosRelacionadosDeRitual
    rituales_por_intencion: ObtenerRitualesRelacionadosPorIntencion


@dataclass(frozen=True, slots=True)
class ServiciosPublicosCalendarioRitual:
    consultar_por_fecha: ConsultarCalendarioRitualPorFecha


@dataclass(frozen=True, slots=True)
class ServiciosPublicosPedidos:
    registrar_pedido: RegistrarPedido
    obtener_pedido: ObtenerPedidoPorId




@dataclass(frozen=True, slots=True)
class ServiciosPublicosPagoPedidos:
    iniciar_pago: IniciarPagoPedido
    procesar_webhook: ProcesarWebhookPagoPedido


@dataclass(frozen=True, slots=True)
class ServiciosPublicosPedidosDemo:
    registrar_pedido_demo: RegistrarPedidoDemo
    obtener_pedido_demo: ObtenerPedidoDemoPorId
    obtener_email_demo_pedido: ObtenerEmailDemoPedidoPorId


@dataclass(frozen=True, slots=True)
class ServiciosPublicosCuentaDemo:
    registrar_cuenta_demo: RegistrarCuentaDemo
    autenticar_cuenta_demo: AutenticarCuentaDemo
    obtener_perfil_cuenta_demo: ObtenerPerfilCuentaDemo
    obtener_historial_cuenta_demo: ObtenerHistorialPedidosDemoCuenta


def construir_servicios_publicos_herbales() -> ServiciosPublicosHerbales:
    repositorio_plantas = RepositorioPlantasORM()
    repositorio_productos = RepositorioProductosORM()
    return ServiciosPublicosHerbales(
        listado_herbal=ObtenerListadoHerbalNavegable(repositorio_plantas),
        detalle_planta=ObtenerDetallePlanta(repositorio_plantas),
        resolucion_comercial=ObtenerResolucionComercialMinimaDePlanta(
            repositorio_plantas,
            repositorio_productos,
        ),
        listado_productos_por_seccion=ObtenerListadoPublicoProductosPorSeccion(
            repositorio_productos
        ),
        detalle_producto=ObtenerDetallePublicoProductoPorSlug(repositorio_productos),
        relaciones_por_intencion=ObtenerRelacionesHerbalesPorIntencion(repositorio_plantas),
        rituales_por_planta=ObtenerRitualesRelacionadosDePlantaPorSlug(
            repositorio_plantas,
            RepositorioRitualesORM(),
        ),
    )


def construir_servicios_publicos_rituales() -> ServiciosPublicosRituales:
    repositorio_rituales = RepositorioRitualesORM()
    return ServiciosPublicosRituales(
        listado_ritual=ObtenerListadoRitualNavegable(repositorio_rituales),
        detalle_ritual=ObtenerDetalleRitual(repositorio_rituales),
        plantas_por_ritual=ObtenerPlantasRelacionadasDeRitual(repositorio_rituales),
        productos_por_ritual=ObtenerProductosRelacionadosDeRitual(repositorio_rituales),
        rituales_por_intencion=ObtenerRitualesRelacionadosPorIntencion(repositorio_rituales),
    )


def construir_servicios_publicos_calendario_ritual() -> ServiciosPublicosCalendarioRitual:
    return ServiciosPublicosCalendarioRitual(
        consultar_por_fecha=ConsultarCalendarioRitualPorFecha(
            repositorio_reglas=RepositorioReglasCalendarioORM(),
            repositorio_rituales=RepositorioRitualesORM(),
        )
    )


def construir_servicios_publicos_pedidos() -> ServiciosPublicosPedidos:
    repositorio = RepositorioPedidosORM()
    return ServiciosPublicosPedidos(
        registrar_pedido=RegistrarPedido(repositorio_pedidos=repositorio),
        obtener_pedido=ObtenerPedidoPorId(repositorio_pedidos=repositorio),
    )



def construir_servicios_publicos_pago_pedidos() -> ServiciosPublicosPagoPedidos:
    repositorio = RepositorioPedidosORM()
    pasarela = construir_pasarela_pago_stripe()
    return ServiciosPublicosPagoPedidos(
        iniciar_pago=IniciarPagoPedido(repositorio_pedidos=repositorio, pasarela_pago=pasarela),
        procesar_webhook=ProcesarWebhookPagoPedido(repositorio_pedidos=repositorio, pasarela_pago=pasarela),
    )

def construir_servicios_publicos_pedidos_demo() -> ServiciosPublicosPedidosDemo:
    repositorio = RepositorioPedidosDemoORM()
    return ServiciosPublicosPedidosDemo(
        registrar_pedido_demo=RegistrarPedidoDemo(repositorio_pedidos_demo=repositorio),
        obtener_pedido_demo=ObtenerPedidoDemoPorId(repositorio_pedidos_demo=repositorio),
        obtener_email_demo_pedido=ObtenerEmailDemoPedidoPorId(
            repositorio_pedidos_demo=repositorio,
            componer_email_demo=ComponerEmailDemoPedido(),
        ),
    )


def construir_servicios_publicos_cuenta_demo() -> ServiciosPublicosCuentaDemo:
    repositorio_cuentas_demo = RepositorioCuentasDemoORM()
    proveedor_historial = ProveedorHistorialPedidosDemoORM()
    return ServiciosPublicosCuentaDemo(
        registrar_cuenta_demo=RegistrarCuentaDemo(repositorio_cuentas_demo=repositorio_cuentas_demo),
        autenticar_cuenta_demo=AutenticarCuentaDemo(repositorio_cuentas_demo=repositorio_cuentas_demo),
        obtener_perfil_cuenta_demo=ObtenerPerfilCuentaDemo(
            repositorio_cuentas_demo=repositorio_cuentas_demo
        ),
        obtener_historial_cuenta_demo=ObtenerHistorialPedidosDemoCuenta(
            repositorio_cuentas_demo=repositorio_cuentas_demo,
            proveedor_historial_pedidos_demo=proveedor_historial,
        ),
    )
