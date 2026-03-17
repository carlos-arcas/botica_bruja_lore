"""Repositorios concretos Django para el núcleo herbal."""

import logging

from django.db import transaction

from ...aplicacion.puertos.proveedores_historial_pedidos_demo import ProveedorHistorialPedidosDemo
from ...aplicacion.puertos.repositorios import RepositorioPlantas, RepositorioProductos
from ...aplicacion.puertos.repositorios_calendario_ritual import RepositorioReglasCalendario
from ...aplicacion.puertos.repositorios_cuentas_demo import RepositorioCuentasDemo
from ...aplicacion.puertos.repositorios_pedidos_demo import RepositorioPedidosDemo
from ...aplicacion.puertos.repositorios_rituales import RepositorioRituales
from datetime import date

from ...dominio.entidades import Planta, Producto, TIPO_PRODUCTO_HERBAL
from ...dominio.excepciones import ErrorDominio
from ...dominio.calendario_ritual import ReglaCalendario
from ...dominio.cuentas_demo import CuentaDemo
from ...dominio.pedidos_demo import PedidoDemo
from ...dominio.rituales import Ritual
from .mapeadores import (
    a_cuenta_demo,
    a_datos_regla_calendario,
    a_datos_cuenta_demo,
    a_datos_linea_pedido,
    a_pedido_demo,
    a_planta,
    a_producto,
    a_ritual,
    a_regla_calendario,
)


logger = logging.getLogger(__name__)
from .models import (
    CuentaDemoModelo,
    LineaPedidoModelo,
    PedidoDemoModelo,
    PlantaModelo,
    ProductoModelo,
    RitualModelo,
    ReglaCalendarioModelo,
)


class RepositorioPlantasORM(RepositorioPlantas):
    def listar_navegables(self) -> tuple[Planta, ...]:
        queryset = PlantaModelo.objects.filter(publicada=True).prefetch_related("intenciones")
        return tuple(a_planta(planta) for planta in queryset)

    def obtener_por_slug(self, slug_planta: str) -> Planta | None:
        try:
            planta = PlantaModelo.objects.prefetch_related("intenciones").get(
                slug=slug_planta,
                publicada=True,
            )
        except PlantaModelo.DoesNotExist:
            return None
        return a_planta(planta)

    def listar_por_intencion(self, slug_intencion: str) -> tuple[Planta, ...]:
        queryset = (
            PlantaModelo.objects.filter(
                publicada=True,
                intenciones__slug=slug_intencion,
                intenciones__es_publica=True,
            )
            .prefetch_related("intenciones")
            .distinct()
        )
        return tuple(a_planta(planta) for planta in queryset)


class RepositorioProductosORM(RepositorioProductos):
    def listar_herbales_por_planta(self, id_planta: str) -> tuple[Producto, ...]:
        queryset = ProductoModelo.objects.filter(
            publicado=True,
            tipo_producto=TIPO_PRODUCTO_HERBAL,
            planta_id=id_planta,
        )
        return tuple(a_producto(producto) for producto in queryset)


    def listar_publicos_por_seccion(self, slug_seccion: str, filtros: dict[str, str]) -> tuple[Producto, ...]:
        seccion_normalizada = slug_seccion.strip().lower()
        queryset = ProductoModelo.objects.filter(
            publicado=True,
            seccion_publica__iexact=seccion_normalizada,
        ).order_by("slug")
        queryset = self._aplicar_filtros_publicos(queryset, filtros)
        return self._filtrar_por_precio(queryset, filtros)



    def _filtrar_por_precio(self, queryset, filtros: dict[str, str]) -> tuple[Producto, ...]:
        precio_min_raw = filtros.get("precio_min", "").strip().replace(",", ".")
        precio_max_raw = filtros.get("precio_max", "").strip().replace(",", ".")
        try:
            precio_min = float(precio_min_raw) if precio_min_raw else None
            precio_max = float(precio_max_raw) if precio_max_raw else None
        except ValueError:
            precio_min = None
            precio_max = None
        if precio_min is not None:
            queryset = queryset.filter(precio_numerico__gte=precio_min)
        if precio_max is not None:
            queryset = queryset.filter(precio_numerico__lte=precio_max)
        return self._mapear_productos_validos(queryset)
    def _aplicar_filtros_publicos(self, queryset, filtros: dict[str, str]):
        beneficio = filtros.get("beneficio", "").strip()
        formato = filtros.get("formato", "").strip()
        modo_uso = filtros.get("modo_uso", "").strip()
        if beneficio:
            queryset = queryset.filter(beneficio_principal=beneficio)
        if formato:
            queryset = queryset.filter(formato_comercial=formato)
        if modo_uso:
            queryset = queryset.filter(modo_uso=modo_uso)
        return queryset

    def obtener_publico_por_slug(self, slug_producto: str) -> Producto | None:
        try:
            producto = ProductoModelo.objects.get(slug=slug_producto, publicado=True)
        except ProductoModelo.DoesNotExist:
            return None
        try:
            return a_producto(producto)
        except (ErrorDominio, AttributeError, TypeError):
            logger.warning(
                "Producto público con datos inválidos omitido en detalle",
                extra={"producto_id": producto.id, "producto_slug": producto.slug},
            )
            return None

    def _mapear_productos_validos(self, productos_orm) -> tuple[Producto, ...]:
        productos_validos: list[Producto] = []
        for producto in productos_orm:
            try:
                productos_validos.append(a_producto(producto))
            except (ErrorDominio, AttributeError, TypeError):
                logger.warning(
                    "Producto público con datos inválidos omitido en listado",
                    extra={
                        "producto_id": producto.id,
                        "producto_slug": producto.slug,
                        "seccion_publica": producto.seccion_publica,
                    },
                )
        return tuple(productos_validos)


class RepositorioRitualesORM(RepositorioRituales):
    def listar_navegables(self) -> tuple[Ritual, ...]:
        queryset = self._base_queryset().filter(publicado=True)
        return tuple(a_ritual(ritual) for ritual in queryset)

    def obtener_por_slug(self, slug_ritual: str) -> Ritual | None:
        try:
            ritual = self._base_queryset().get(slug=slug_ritual, publicado=True)
        except RitualModelo.DoesNotExist:
            return None
        return a_ritual(ritual)

    def listar_por_intencion(self, slug_intencion: str) -> tuple[Ritual, ...]:
        queryset = self._base_queryset().filter(
            publicado=True,
            intenciones__slug=slug_intencion,
            intenciones__es_publica=True,
        )
        return tuple(a_ritual(ritual) for ritual in queryset.distinct())

    def listar_por_planta(self, id_planta: str) -> tuple[Ritual, ...]:
        queryset = self._base_queryset().filter(
            publicado=True,
            plantas_relacionadas__id=id_planta,
            plantas_relacionadas__publicada=True,
        )
        return tuple(a_ritual(ritual) for ritual in queryset.distinct())

    def listar_por_producto(self, id_producto: str) -> tuple[Ritual, ...]:
        queryset = self._base_queryset().filter(
            publicado=True,
            productos_relacionados__id=id_producto,
            productos_relacionados__publicado=True,
        )
        return tuple(a_ritual(ritual) for ritual in queryset.distinct())

    def listar_plantas_relacionadas(self, id_ritual: str) -> tuple[Planta, ...]:
        queryset = PlantaModelo.objects.filter(
            publicada=True,
            rituales__id=id_ritual,
            rituales__publicado=True,
        ).prefetch_related("intenciones")
        return tuple(a_planta(planta) for planta in queryset.distinct())

    def listar_productos_relacionados(self, id_ritual: str) -> tuple[Producto, ...]:
        queryset = ProductoModelo.objects.filter(
            publicado=True,
            rituales__id=id_ritual,
            rituales__publicado=True,
        )
        return tuple(a_producto(producto) for producto in queryset.distinct())

    def _base_queryset(self):
        return RitualModelo.objects.prefetch_related(
            "intenciones",
            "plantas_relacionadas",
            "productos_relacionados",
        )


class RepositorioReglasCalendarioORM(RepositorioReglasCalendario):
    def listar_vigentes_en(self, fecha_consulta: date) -> tuple[ReglaCalendario, ...]:
        queryset = ReglaCalendarioModelo.objects.filter(
            activa=True,
            fecha_inicio__lte=fecha_consulta,
            fecha_fin__gte=fecha_consulta,
            ritual__publicado=True,
        ).select_related("ritual")
        return tuple(a_regla_calendario(regla) for regla in queryset)

    def guardar(self, regla: ReglaCalendario) -> ReglaCalendario:
        ReglaCalendarioModelo.objects.update_or_create(
            id=regla.id,
            defaults=a_datos_regla_calendario(regla),
        )
        modelo = ReglaCalendarioModelo.objects.get(id=regla.id)
        return a_regla_calendario(modelo)


class RepositorioPedidosDemoORM(RepositorioPedidosDemo):
    @transaction.atomic
    def guardar(self, pedido: PedidoDemo) -> PedidoDemo:
        modelo, _ = PedidoDemoModelo.objects.update_or_create(
            id_pedido=pedido.id_pedido,
            defaults={
                "email_contacto": pedido.email_contacto,
                "canal_compra": pedido.canal_compra,
                "estado": pedido.estado,
                "fecha_creacion": pedido.fecha_creacion,
                "id_usuario": pedido.id_usuario,
            },
        )
        modelo.lineas.all().delete()
        LineaPedidoModelo.objects.bulk_create(
            [
                LineaPedidoModelo(pedido=modelo, **a_datos_linea_pedido(linea))
                for linea in pedido.lineas
            ]
        )
        return self._reconstruir(modelo.id_pedido)

    def obtener_por_id(self, id_pedido: str) -> PedidoDemo | None:
        try:
            modelo = self._base_queryset().get(id_pedido=id_pedido)
        except PedidoDemoModelo.DoesNotExist:
            return None
        return a_pedido_demo(modelo)

    @transaction.atomic
    def actualizar_estado(self, id_pedido: str, estado: str) -> PedidoDemo | None:
        actualizados = PedidoDemoModelo.objects.filter(id_pedido=id_pedido).update(estado=estado)
        if not actualizados:
            return None
        return self._reconstruir(id_pedido)

    def _reconstruir(self, id_pedido: str) -> PedidoDemo:
        return a_pedido_demo(self._base_queryset().get(id_pedido=id_pedido))

    def _base_queryset(self):
        return PedidoDemoModelo.objects.prefetch_related("lineas")


class RepositorioCuentasDemoORM(RepositorioCuentasDemo):
    def guardar(self, cuenta: CuentaDemo) -> CuentaDemo:
        CuentaDemoModelo.objects.update_or_create(
            id_usuario=cuenta.id_usuario,
            defaults=a_datos_cuenta_demo(cuenta),
        )
        cuenta_reconstruida = self.obtener_por_id_usuario(cuenta.id_usuario)
        assert cuenta_reconstruida is not None
        return cuenta_reconstruida

    def obtener_por_email(self, email: str) -> CuentaDemo | None:
        email_normalizado = email.strip().lower()
        try:
            modelo = CuentaDemoModelo.objects.get(email__iexact=email_normalizado)
        except CuentaDemoModelo.DoesNotExist:
            return None
        return a_cuenta_demo(modelo)

    def obtener_por_id_usuario(self, id_usuario: str) -> CuentaDemo | None:
        try:
            modelo = CuentaDemoModelo.objects.get(id_usuario=id_usuario)
        except CuentaDemoModelo.DoesNotExist:
            return None
        return a_cuenta_demo(modelo)


class ProveedorHistorialPedidosDemoORM(ProveedorHistorialPedidosDemo):
    def listar_por_vinculo_cuenta(
        self,
        *,
        id_usuario: str,
        email_contacto: str,
    ) -> tuple[PedidoDemo, ...]:
        queryset = PedidoDemoModelo.objects.filter(
            id_usuario=id_usuario
        ) | PedidoDemoModelo.objects.filter(email_contacto__iexact=email_contacto.strip())
        pedidos = queryset.order_by("-fecha_creacion").prefetch_related("lineas").distinct()
        return tuple(a_pedido_demo(modelo) for modelo in pedidos)
