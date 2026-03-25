"""Mapeadores de ORM Django a entidades de dominio."""

from ...dominio.entidades import Intencion, Planta, Producto
from ...dominio.cuentas_cliente import CuentaCliente, DireccionCuentaCliente, SolicitudRecuperacionPassword, SolicitudVerificacionEmail
from ...dominio.cuentas_demo import CuentaDemo, CredencialCuentaDemo, PerfilCuentaDemo
from ...dominio.calendario_ritual import ReglaCalendario
from ...dominio.pedidos_demo import LineaPedido, PedidoDemo
from ...dominio.rituales import Ritual
from .models import (
    CuentaClienteModelo,
    CuentaDemoModelo,
    DireccionCuentaClienteModelo,
    RecuperacionPasswordCuentaClienteModelo,
    VerificacionEmailCuentaClienteModelo,
    IntencionModelo,
    LineaPedidoModelo,
    PedidoDemoModelo,
    PlantaModelo,
    ProductoModelo,
    RitualModelo,
    ReglaCalendarioModelo,
)


def a_intencion(modelo: IntencionModelo) -> Intencion:
    return Intencion(
        id=modelo.id,
        slug=modelo.slug,
        nombre=modelo.nombre,
        descripcion=modelo.descripcion,
    )


def a_planta(modelo: PlantaModelo) -> Planta:
    intenciones = tuple(
        a_intencion(item)
        for item in modelo.intenciones.filter(es_publica=True).order_by("nombre")
    )
    return Planta(
        id=modelo.id,
        slug=modelo.slug,
        nombre=modelo.nombre,
        descripcion_breve=modelo.descripcion_breve,
        intenciones=intenciones,
    )


def _parsear_beneficios_secundarios(valor: str) -> tuple[str, ...]:
    return tuple(item.strip() for item in valor.split(",") if item.strip())


def a_producto(modelo: ProductoModelo) -> Producto:
    return Producto(
        id=modelo.id,
        sku=modelo.sku,
        slug=modelo.slug,
        nombre=modelo.nombre,
        tipo_producto=modelo.tipo_producto,
        categoria_comercial=modelo.categoria_comercial,
        planta_id=modelo.planta_id,
        seccion_publica=modelo.seccion_publica,
        descripcion_corta=modelo.descripcion_corta,
        precio_visible=modelo.precio_visible,
        imagen_url=modelo.imagen_url,
        beneficio_principal=modelo.beneficio_principal,
        beneficios_secundarios=_parsear_beneficios_secundarios(modelo.beneficios_secundarios),
        formato_comercial=modelo.formato_comercial,
        modo_uso=modelo.modo_uso,
        categoria_visible=modelo.categoria_visible,
        unidad_comercial=modelo.unidad_comercial,
        incremento_minimo_venta=modelo.incremento_minimo_venta,
        cantidad_minima_compra=modelo.cantidad_minima_compra,
        tipo_fiscal=modelo.tipo_fiscal,
    )


def a_ritual(modelo: RitualModelo) -> Ritual:
    intenciones = tuple(
        a_intencion(item)
        for item in modelo.intenciones.filter(es_publica=True).order_by("nombre")
    )
    ids_plantas = tuple(modelo.plantas_relacionadas.order_by("nombre").values_list("id", flat=True))
    ids_productos = tuple(modelo.productos_relacionados.order_by("nombre").values_list("id", flat=True))
    return Ritual(
        id=modelo.id,
        slug=modelo.slug,
        nombre=modelo.nombre,
        contexto_breve=modelo.contexto_breve,
        intenciones=intenciones,
        ids_plantas_relacionadas=ids_plantas,
        ids_productos_relacionados=ids_productos,
    )


def a_regla_calendario(modelo: ReglaCalendarioModelo) -> ReglaCalendario:
    return ReglaCalendario(
        id=modelo.id,
        id_ritual=modelo.ritual_id,
        nombre=modelo.nombre,
        fecha_inicio=modelo.fecha_inicio,
        fecha_fin=modelo.fecha_fin,
        prioridad=modelo.prioridad,
        activa=modelo.activa,
    )


def a_datos_regla_calendario(regla: ReglaCalendario) -> dict[str, object]:
    return {
        "ritual_id": regla.id_ritual,
        "nombre": regla.nombre,
        "fecha_inicio": regla.fecha_inicio,
        "fecha_fin": regla.fecha_fin,
        "prioridad": regla.prioridad,
        "activa": regla.activa,
    }


def a_cuenta_cliente(modelo: CuentaClienteModelo) -> CuentaCliente:
    usuario = modelo.usuario
    return CuentaCliente(
        id_usuario=str(usuario.id),
        email=modelo.email,
        nombre_visible=modelo.nombre_visible,
        hash_password=usuario.password,
        activo=usuario.is_active,
        email_verificado=modelo.email_verificado,
        fecha_creacion=modelo.fecha_creacion,
        fecha_actualizacion=modelo.fecha_actualizacion,
    )


def a_direccion_cuenta_cliente(modelo: DireccionCuentaClienteModelo) -> DireccionCuentaCliente:
    return DireccionCuentaCliente(
        id_direccion=str(modelo.id),
        id_usuario=str(modelo.cuenta.usuario_id),
        alias=modelo.alias,
        nombre_destinatario=modelo.nombre_destinatario,
        telefono_contacto=modelo.telefono_contacto,
        linea_1=modelo.linea_1,
        linea_2=modelo.linea_2,
        codigo_postal=modelo.codigo_postal,
        ciudad=modelo.ciudad,
        provincia=modelo.provincia,
        pais_iso=modelo.pais_iso,
        predeterminada=modelo.predeterminada,
        fecha_creacion=modelo.fecha_creacion,
        fecha_actualizacion=modelo.fecha_actualizacion,
    )


def a_cuenta_demo(modelo: CuentaDemoModelo) -> CuentaDemo:
    return CuentaDemo(
        id_usuario=modelo.id_usuario,
        email=modelo.email,
        perfil=PerfilCuentaDemo(nombre_visible=modelo.nombre_visible),
        credencial=CredencialCuentaDemo(clave_acceso_demo=modelo.clave_acceso_demo),
    )


def a_datos_cuenta_demo(cuenta: CuentaDemo) -> dict[str, object]:
    return {
        "email": cuenta.email,
        "nombre_visible": cuenta.perfil.nombre_visible,
        "clave_acceso_demo": cuenta.credencial.clave_acceso_demo,
    }


def a_pedido_demo(modelo: PedidoDemoModelo) -> PedidoDemo:
    lineas = tuple(a_linea_pedido(linea) for linea in modelo.lineas.order_by("id"))
    return PedidoDemo(
        id_pedido=modelo.id_pedido,
        email_contacto=modelo.email_contacto,
        canal_compra=modelo.canal_compra,
        lineas=lineas,
        estado=modelo.estado,
        fecha_creacion=modelo.fecha_creacion,
        id_usuario=modelo.id_usuario,
    )


def a_linea_pedido(modelo: LineaPedidoModelo) -> LineaPedido:
    return LineaPedido(
        id_producto=modelo.id_producto,
        slug_producto=modelo.slug_producto,
        nombre_producto=modelo.nombre_producto,
        cantidad=modelo.cantidad,
        precio_unitario_demo=modelo.precio_unitario_demo,
    )


def a_datos_linea_pedido(linea: LineaPedido) -> dict[str, object]:
    return {
        "id_producto": linea.id_producto,
        "slug_producto": linea.slug_producto,
        "nombre_producto": linea.nombre_producto,
        "cantidad": linea.cantidad,
        "precio_unitario_demo": linea.precio_unitario_demo,
    }


def a_solicitud_verificacion_email(modelo: VerificacionEmailCuentaClienteModelo) -> SolicitudVerificacionEmail:
    return SolicitudVerificacionEmail(
        id_solicitud=str(modelo.id),
        id_usuario=str(modelo.cuenta.usuario_id),
        email=modelo.cuenta.email,
        token_hash=modelo.token_hash,
        expira_en=modelo.expira_en,
        fecha_creacion=modelo.fecha_creacion,
        fecha_envio=modelo.fecha_envio,
        fecha_confirmacion=modelo.fecha_confirmacion,
    )


def a_solicitud_recuperacion_password(modelo: RecuperacionPasswordCuentaClienteModelo) -> SolicitudRecuperacionPassword:
    return SolicitudRecuperacionPassword(
        id_solicitud=str(modelo.id),
        id_usuario=str(modelo.cuenta.usuario_id),
        email=modelo.cuenta.email,
        token_hash=modelo.token_hash,
        expira_en=modelo.expira_en,
        fecha_creacion=modelo.fecha_creacion,
        fecha_envio=modelo.fecha_envio,
        fecha_uso=modelo.fecha_uso,
    )
