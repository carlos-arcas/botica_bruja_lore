"""Cableado de dependencias de aplicación para la API pública."""

from dataclasses import dataclass

from django.conf import settings

from ...aplicacion.casos_de_uso import (
    ObtenerDetallePlanta,
    ObtenerDetallePublicoProductoPorSlug,
    ObtenerListadoHerbalNavegable,
    ObtenerListadoPublicoProductosPorSeccion,
    ObtenerRelacionesHerbalesPorIntencion,
    ObtenerResolucionComercialMinimaDePlanta,
)
from ...aplicacion.casos_de_uso_backoffice_pedidos import (
    ListarPedidosBackoffice,
    MarcarPedidoEntregado,
    MarcarPedidoEnviado,
    MarcarPedidoPreparando,
)
from ...aplicacion.casos_de_uso_calendario_ritual import ConsultarCalendarioRitualPorFecha
from ...aplicacion.casos_de_uso_cuentas_cliente import (
    AutenticarCuentaCliente,
    ConfirmarRecuperacionPasswordCuentaCliente,
    ConfirmarVerificacionEmail,
    ConsultarEstadoVerificacionEmail,
    GenerarSolicitudVerificacionEmail,
    ListarPedidosCuentaCliente,
    ObtenerPedidoCuentaCliente,
    ObtenerSesionCuentaCliente,
    ReenviarVerificacionEmail,
    RegistrarCuentaCliente,
    SolicitarRecuperacionPasswordCuentaCliente,
)
from ...aplicacion.casos_de_uso_direcciones_cuenta_cliente import (
    ActualizarDireccionCuentaCliente,
    CrearDireccionCuentaCliente,
    EliminarDireccionCuentaCliente,
    ListarDireccionesCuentaCliente,
    MarcarDireccionPredeterminadaCuentaCliente,
)
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
from ...aplicacion.casos_de_uso_pago_pedidos import ConfirmarPagoSimuladoPedido, IniciarPagoPedido, ProcesarWebhookPagoPedido
from ...aplicacion.casos_de_uso_pedidos import ObtenerPedidoPorId, RegistrarPedido
from ...aplicacion.casos_de_uso_post_pago_pedidos import ProcesarPostPagoPedido
from ...aplicacion.stock_preventivo_pedidos import ValidarStockPreventivoPedido
from ...aplicacion.casos_de_uso_pedidos_demo import (
    ObtenerPedidoDemoPorId,
    RegistrarPedidoDemo,
)
from ...aplicacion.puertos.pasarela_pago import PuertoPasarelaPago
from ...dominio.excepciones import ErrorDominio
from ...aplicacion.casos_de_uso_rituales import (
    ObtenerDetalleRitual,
    ObtenerListadoRitualNavegable,
    ObtenerPlantasRelacionadasDeRitual,
    ObtenerProductosRelacionadosDeRitual,
    ObtenerRitualesRelacionadosDePlantaPorSlug,
    ObtenerRitualesRelacionadosPorIntencion,
)
from ...infraestructura.notificaciones_email import NotificadorEmailPostPago
from ...infraestructura.notificaciones_email_recuperacion_password import NotificadorEmailRecuperacionPasswordCuenta
from ...infraestructura.notificaciones_email_verificacion import NotificadorEmailVerificacionCuenta
from ...infraestructura.validacion_password_cuenta import ValidadorPasswordCuentaClienteDjango
from ...infraestructura.proveedor_envio_estandar import ProveedorEnvioEstandarFijo
from ...infraestructura.pagos_simulados import construir_pasarela_pago_simulada_local
from ...infraestructura.pagos_stripe import construir_pasarela_pago_stripe
from ...infraestructura.persistencia_django.repositorios import (
    ProveedorHistorialPedidosDemoORM,
    RepositorioCuentasDemoORM,
    RepositorioPedidosDemoORM,
    RepositorioPlantasORM,
    RepositorioProductosORM,
    RepositorioReglasCalendarioORM,
    RepositorioRitualesORM,
)
from ...infraestructura.persistencia_django.repositorios_cuentas_cliente import RepositorioCuentasClienteORM
from ...infraestructura.persistencia_django.repositorios_inventario import RepositorioInventarioORM, RepositorioMovimientosInventarioORM
from ...infraestructura.persistencia_django.repositorios_pedidos import RepositorioPedidosORM
from ...infraestructura.persistencia_django.repositorios_productos_checkout import RepositorioProductosCheckoutORM
from ...infraestructura.persistencia_django.transacciones import TransaccionesDjango


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
    confirmar_pago_simulado: ConfirmarPagoSimuladoPedido
    procesar_webhook: ProcesarWebhookPagoPedido


@dataclass(frozen=True, slots=True)
class ServiciosPublicosPedidosDemo:
    registrar_pedido_demo: RegistrarPedidoDemo
    obtener_pedido_demo: ObtenerPedidoDemoPorId
    obtener_email_demo_pedido: ObtenerEmailDemoPedidoPorId




@dataclass(frozen=True, slots=True)
class ServiciosPublicosCuentaCliente:
    registrar_cuenta_cliente: RegistrarCuentaCliente
    autenticar_cuenta_cliente: AutenticarCuentaCliente
    obtener_sesion_cuenta_cliente: ObtenerSesionCuentaCliente
    listar_direcciones_cuenta_cliente: ListarDireccionesCuentaCliente
    crear_direccion_cuenta_cliente: CrearDireccionCuentaCliente
    actualizar_direccion_cuenta_cliente: ActualizarDireccionCuentaCliente
    eliminar_direccion_cuenta_cliente: EliminarDireccionCuentaCliente
    marcar_direccion_predeterminada_cuenta_cliente: MarcarDireccionPredeterminadaCuentaCliente
    listar_pedidos_cuenta_cliente: ListarPedidosCuentaCliente
    obtener_pedido_cuenta_cliente: ObtenerPedidoCuentaCliente
    confirmar_verificacion_email: ConfirmarVerificacionEmail
    reenviar_verificacion_email: ReenviarVerificacionEmail
    consultar_estado_verificacion_email: ConsultarEstadoVerificacionEmail
    solicitar_recuperacion_password: SolicitarRecuperacionPasswordCuentaCliente
    confirmar_recuperacion_password: ConfirmarRecuperacionPasswordCuentaCliente

@dataclass(frozen=True, slots=True)
class ServiciosPublicosCuentaDemo:
    registrar_cuenta_demo: RegistrarCuentaDemo
    autenticar_cuenta_demo: AutenticarCuentaDemo
    obtener_perfil_cuenta_demo: ObtenerPerfilCuentaDemo
    obtener_historial_cuenta_demo: ObtenerHistorialPedidosDemoCuenta


@dataclass(frozen=True, slots=True)
class ServiciosBackofficePedidos:
    listar_pedidos: ListarPedidosBackoffice
    marcar_preparando: MarcarPedidoPreparando
    marcar_enviado: MarcarPedidoEnviado
    marcar_entregado: MarcarPedidoEntregado


def construir_servicios_publicos_herbales() -> ServiciosPublicosHerbales:
    repositorio_plantas = RepositorioPlantasORM()
    repositorio_productos = RepositorioProductosORM()
    repositorio_inventario = RepositorioInventarioORM()
    return ServiciosPublicosHerbales(
        listado_herbal=ObtenerListadoHerbalNavegable(repositorio_plantas),
        detalle_planta=ObtenerDetallePlanta(repositorio_plantas),
        resolucion_comercial=ObtenerResolucionComercialMinimaDePlanta(
            repositorio_plantas,
            repositorio_productos,
            repositorio_inventario,
        ),
        listado_productos_por_seccion=ObtenerListadoPublicoProductosPorSeccion(
            repositorio_productos,
            repositorio_inventario,
        ),
        detalle_producto=ObtenerDetallePublicoProductoPorSlug(repositorio_productos, repositorio_inventario),
        relaciones_por_intencion=ObtenerRelacionesHerbalesPorIntencion(repositorio_plantas),
        rituales_por_planta=ObtenerRitualesRelacionadosDePlantaPorSlug(
            repositorio_plantas,
            RepositorioRitualesORM(),
        ),
    )


def construir_servicios_publicos_rituales() -> ServiciosPublicosRituales:
    repositorio_rituales = RepositorioRitualesORM()
    repositorio_inventario = RepositorioInventarioORM()
    return ServiciosPublicosRituales(
        listado_ritual=ObtenerListadoRitualNavegable(repositorio_rituales),
        detalle_ritual=ObtenerDetalleRitual(repositorio_rituales),
        plantas_por_ritual=ObtenerPlantasRelacionadasDeRitual(repositorio_rituales),
        productos_por_ritual=ObtenerProductosRelacionadosDeRitual(repositorio_rituales, repositorio_inventario),
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
    repositorio_cuentas = RepositorioCuentasClienteORM()
    return ServiciosPublicosPedidos(
        registrar_pedido=RegistrarPedido(
            repositorio_pedidos=repositorio,
            repositorio_cuentas_cliente=repositorio_cuentas,
            repositorio_inventario=RepositorioInventarioORM(),
            repositorio_productos_checkout=RepositorioProductosCheckoutORM(),
            proveedor_envio=ProveedorEnvioEstandarFijo(),
        ),
        obtener_pedido=ObtenerPedidoPorId(repositorio_pedidos=repositorio),
    )


def construir_servicios_publicos_pago_pedidos() -> ServiciosPublicosPagoPedidos:
    repositorio = RepositorioPedidosORM()
    pasarela = resolver_pasarela_pago_configurada()
    validador_stock = ValidarStockPreventivoPedido(RepositorioInventarioORM())
    procesador_post_pago = _construir_procesador_post_pago(repositorio)
    return ServiciosPublicosPagoPedidos(
        iniciar_pago=IniciarPagoPedido(
            repositorio_pedidos=repositorio,
            pasarela_pago=pasarela,
            validador_stock_preventivo=validador_stock,
        ),
        confirmar_pago_simulado=ConfirmarPagoSimuladoPedido(
            repositorio_pedidos=repositorio,
            procesador_post_pago=procesador_post_pago,
            validador_stock_preventivo=validador_stock,
        ),
        procesar_webhook=ProcesarWebhookPagoPedido(
            repositorio_pedidos=repositorio,
            pasarela_pago=pasarela,
            procesador_post_pago=procesador_post_pago,
        ),
    )


def _construir_procesador_post_pago(repositorio: RepositorioPedidosORM) -> ProcesarPostPagoPedido:
    return ProcesarPostPagoPedido(
        repositorio_pedidos=repositorio,
        repositorio_inventario=RepositorioInventarioORM(),
        repositorio_movimientos=RepositorioMovimientosInventarioORM(),
        transacciones=TransaccionesDjango(),
        notificador=NotificadorEmailPostPago(),
    )


def resolver_pasarela_pago_configurada() -> PuertoPasarelaPago:
    proveedor = getattr(settings, "BOTICA_PAYMENT_PROVIDER", "simulado_local").strip().lower()
    if proveedor == "simulado_local":
        return construir_pasarela_pago_simulada_local()
    if proveedor == "stripe":
        return construir_pasarela_pago_stripe()
    raise ErrorDominio("Proveedor de pago no soportado. Usa simulado_local o stripe.")


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


def construir_servicios_publicos_cuenta_cliente() -> ServiciosPublicosCuentaCliente:
    repositorio_cuentas = RepositorioCuentasClienteORM()
    repositorio_pedidos = RepositorioPedidosORM()
    notificador_verificacion = NotificadorEmailVerificacionCuenta()
    notificador_recuperacion = NotificadorEmailRecuperacionPasswordCuenta()
    validador_password = ValidadorPasswordCuentaClienteDjango()
    return ServiciosPublicosCuentaCliente(
        registrar_cuenta_cliente=RegistrarCuentaCliente(
            repositorio_cuentas_cliente=repositorio_cuentas,
            notificador_verificacion_email=notificador_verificacion,
        ),
        autenticar_cuenta_cliente=AutenticarCuentaCliente(repositorio_cuentas_cliente=repositorio_cuentas),
        obtener_sesion_cuenta_cliente=ObtenerSesionCuentaCliente(repositorio_cuentas_cliente=repositorio_cuentas),
        listar_direcciones_cuenta_cliente=ListarDireccionesCuentaCliente(repositorio_cuentas_cliente=repositorio_cuentas),
        crear_direccion_cuenta_cliente=CrearDireccionCuentaCliente(repositorio_cuentas_cliente=repositorio_cuentas),
        actualizar_direccion_cuenta_cliente=ActualizarDireccionCuentaCliente(repositorio_cuentas_cliente=repositorio_cuentas),
        eliminar_direccion_cuenta_cliente=EliminarDireccionCuentaCliente(repositorio_cuentas_cliente=repositorio_cuentas),
        marcar_direccion_predeterminada_cuenta_cliente=MarcarDireccionPredeterminadaCuentaCliente(repositorio_cuentas_cliente=repositorio_cuentas),
        listar_pedidos_cuenta_cliente=ListarPedidosCuentaCliente(
            repositorio_cuentas_cliente=repositorio_cuentas,
            repositorio_pedidos=repositorio_pedidos,
        ),
        obtener_pedido_cuenta_cliente=ObtenerPedidoCuentaCliente(
            repositorio_cuentas_cliente=repositorio_cuentas,
            repositorio_pedidos=repositorio_pedidos,
        ),
        confirmar_verificacion_email=ConfirmarVerificacionEmail(repositorio_cuentas_cliente=repositorio_cuentas),
        reenviar_verificacion_email=ReenviarVerificacionEmail(
            repositorio_cuentas_cliente=repositorio_cuentas,
            notificador_verificacion_email=notificador_verificacion,
        ),
        consultar_estado_verificacion_email=ConsultarEstadoVerificacionEmail(
            repositorio_cuentas_cliente=repositorio_cuentas,
        ),
        solicitar_recuperacion_password=SolicitarRecuperacionPasswordCuentaCliente(
            repositorio_cuentas_cliente=repositorio_cuentas,
            notificador_recuperacion_password=notificador_recuperacion,
        ),
        confirmar_recuperacion_password=ConfirmarRecuperacionPasswordCuentaCliente(
            repositorio_cuentas_cliente=repositorio_cuentas,
            validador_password=validador_password,
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


def construir_servicios_backoffice_pedidos() -> ServiciosBackofficePedidos:
    repositorio = RepositorioPedidosORM()
    notificador = NotificadorEmailPostPago()
    return ServiciosBackofficePedidos(
        listar_pedidos=ListarPedidosBackoffice(repositorio_pedidos=repositorio),
        marcar_preparando=MarcarPedidoPreparando(repositorio_pedidos=repositorio),
        marcar_enviado=MarcarPedidoEnviado(repositorio_pedidos=repositorio, notificador=notificador),
        marcar_entregado=MarcarPedidoEntregado(repositorio_pedidos=repositorio),
    )
