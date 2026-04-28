#!/usr/bin/env python3
"""Bootstrap local de datos comprables para ecommerce simulado."""

import argparse
import json
import os
import sys
from dataclasses import dataclass
from decimal import Decimal
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))


@dataclass(frozen=True)
class ProductoSeed:
    id: str
    sku: str
    slug: str
    nombre: str
    seccion_publica: str
    tipo_producto: str
    categoria_comercial: str
    precio: Decimal
    unidad: str
    stock: int
    planta_slug: str | None = None


def _p(
    indice: int,
    slug: str,
    nombre: str,
    seccion: str,
    tipo: str,
    categoria: str,
    precio: str,
    unidad: str = "ud",
    stock: int = 12,
    planta_slug: str | None = None,
) -> ProductoSeed:
    return ProductoSeed(
        id=f"pro-local-{slug}",
        sku=f"LOCAL-ECOM-{indice:03d}",
        slug=f"{slug}-local",
        nombre=nombre,
        seccion_publica=seccion,
        tipo_producto=tipo,
        categoria_comercial=categoria,
        precio=Decimal(precio),
        unidad=unidad,
        stock=stock,
        planta_slug=planta_slug,
    )


SECCIONES = (
    ("botica-natural", "Botica Natural"),
    ("velas-e-incienso", "Velas e Incienso"),
    ("minerales-y-energia", "Minerales y Energia"),
    ("herramientas-esotericas", "Herramientas Esotericas"),
)

PRODUCTOS = (
    _p(1, "melisa-50g", "Melisa local 50g", "botica-natural", "hierbas-a-granel", "hierbas", "6.90", "g", 500, "melisa-local"),
    _p(2, "lavanda-50g", "Lavanda local 50g", "botica-natural", "hierbas-a-granel", "hierbas", "7.20", "g", 450, "melisa-local"),
    _p(3, "romero-50g", "Romero local 50g", "botica-natural", "hierbas-a-granel", "hierbas", "5.80", "g", 600, "melisa-local"),
    _p(4, "salvia-50g", "Salvia local 50g", "botica-natural", "hierbas-a-granel", "hierbas", "6.40", "g", 420, "melisa-local"),
    _p(5, "menta-50g", "Menta local 50g", "botica-natural", "hierbas-a-granel", "hierbas", "5.90", "g", 520, "melisa-local"),
    _p(6, "sahumo-calma", "Sahumo calma local", "velas-e-incienso", "inciensos-y-sahumerios", "sahumerios", "8.50"),
    _p(7, "vela-proteccion", "Vela proteccion local", "velas-e-incienso", "inciensos-y-sahumerios", "velas", "9.90"),
    _p(8, "incienso-copal", "Incienso copal local", "velas-e-incienso", "inciensos-y-sahumerios", "inciensos", "4.80"),
    _p(9, "cuarzo-rosa", "Cuarzo rosa local", "minerales-y-energia", "minerales-y-piedras", "minerales", "5.20"),
    _p(10, "amatista-pulida", "Amatista pulida local", "minerales-y-energia", "minerales-y-piedras", "minerales", "7.40"),
    _p(11, "obsidiana-negra", "Obsidiana negra local", "minerales-y-energia", "minerales-y-piedras", "minerales", "6.60"),
    _p(12, "cuenco-ritual", "Cuenco ritual local", "herramientas-esotericas", "herramientas-rituales", "altar", "14.90", stock=6),
    _p(13, "bolsa-tela-ritual", "Bolsa de tela ritual local", "herramientas-esotericas", "herramientas-rituales", "altar", "6.30"),
    _p(14, "cuchara-madera", "Cuchara de madera local", "herramientas-esotericas", "herramientas-rituales", "altar", "5.50"),
)


def configurar_django() -> None:
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.configuracion_django.settings")
    import django

    django.setup()


def ejecutar_bootstrap(*, dry_run: bool) -> dict[str, dict[str, int]]:
    from django.db import transaction

    with transaction.atomic():
        resumen = _aplicar_datos()
        if dry_run:
            transaction.set_rollback(True)
        return resumen


def _aplicar_datos() -> dict[str, dict[str, int]]:
    resumen = {
        "secciones": _seed_secciones(),
        "intenciones": _seed_intenciones(),
        "plantas": _seed_plantas(),
        "productos": _seed_productos(),
        "inventario": _seed_inventario(),
        "cuenta": _seed_cuenta(),
    }
    return resumen


def _estado(creado: bool) -> dict[str, int]:
    return {"creados": 1 if creado else 0, "actualizados": 0 if creado else 1}


def _sumar(total: dict[str, int], parcial: dict[str, int]) -> None:
    total["creados"] += parcial["creados"]
    total["actualizados"] += parcial["actualizados"]


def _seed_secciones() -> dict[str, int]:
    from backend.nucleo_herbal.infraestructura.persistencia_django.models import SeccionPublicaModelo

    total = {"creados": 0, "actualizados": 0}
    for orden, (slug, nombre) in enumerate(SECCIONES, start=10):
        _, creado = SeccionPublicaModelo.objects.update_or_create(
            slug=slug,
            defaults={"nombre": nombre, "orden": orden, "publicada": True},
        )
        _sumar(total, _estado(creado))
    return total


def _seed_intenciones() -> dict[str, int]:
    from backend.nucleo_herbal.infraestructura.persistencia_django.models import IntencionModelo

    _, creado = IntencionModelo.objects.update_or_create(
        slug="calma-local",
        defaults={
            "id": "int-local-calma",
            "nombre": "Calma local",
            "descripcion": "Intencion editorial local para probar compra sin claims sanitarios.",
            "es_publica": True,
        },
    )
    return _estado(creado)


def _seed_plantas() -> dict[str, int]:
    from backend.nucleo_herbal.infraestructura.persistencia_django.models import IntencionModelo, PlantaModelo

    planta, creado = PlantaModelo.objects.update_or_create(
        slug="melisa-local",
        defaults={
            "id": "pla-local-melisa",
            "nombre": "Melisa local",
            "descripcion_breve": "Planta aromatica tradicional para contenido editorial local.",
            "publicada": True,
        },
    )
    planta.intenciones.set(IntencionModelo.objects.filter(slug="calma-local"))
    return _estado(creado)


def _seed_productos() -> dict[str, int]:
    from backend.nucleo_herbal.infraestructura.persistencia_django.models import PlantaModelo, ProductoModelo

    total = {"creados": 0, "actualizados": 0}
    for orden, seed in enumerate(PRODUCTOS, start=10):
        planta = PlantaModelo.objects.filter(slug=seed.planta_slug).first() if seed.planta_slug else None
        _, creado = ProductoModelo.objects.update_or_create(
            sku=seed.sku,
            defaults=_datos_producto(seed, planta, orden),
        )
        _sumar(total, _estado(creado))
    return total


def _datos_producto(seed: ProductoSeed, planta: object, orden: int) -> dict[str, object]:
    return {
        "id": seed.id,
        "slug": seed.slug,
        "nombre": seed.nombre,
        "tipo_producto": seed.tipo_producto,
        "categoria_comercial": seed.categoria_comercial,
        "seccion_publica": seed.seccion_publica,
        "descripcion_corta": "Producto local comprable para validar checkout con pago de prueba.",
        "precio_numerico": seed.precio,
        "precio_visible": f"{seed.precio:.2f}".replace(".", ",") + " EUR",
        "imagen_url": "",
        "beneficio_principal": "calma" if seed.seccion_publica == "botica-natural" else "",
        "formato_comercial": "hoja-seca" if seed.seccion_publica == "botica-natural" else "",
        "modo_uso": "infusion" if seed.seccion_publica == "botica-natural" else "",
        "unidad_comercial": seed.unidad,
        "incremento_minimo_venta": 1,
        "cantidad_minima_compra": 1,
        "tipo_fiscal": "iva_reducido" if seed.seccion_publica == "botica-natural" else "iva_general",
        "orden_publicacion": orden,
        "planta": planta,
        "publicado": True,
    }


def _seed_inventario() -> dict[str, int]:
    from backend.nucleo_herbal.infraestructura.persistencia_django.models import ProductoModelo
    from backend.nucleo_herbal.infraestructura.persistencia_django.models_inventario import InventarioProductoModelo

    total = {"creados": 0, "actualizados": 0}
    for seed in PRODUCTOS:
        producto = ProductoModelo.objects.get(sku=seed.sku)
        _, creado = InventarioProductoModelo.objects.update_or_create(
            producto=producto,
            defaults={
                "cantidad_disponible": seed.stock,
                "unidad_base": seed.unidad,
                "umbral_bajo_stock": max(1, seed.stock // 5),
            },
        )
        _sumar(total, _estado(creado))
    return total


def _seed_cuenta() -> dict[str, int]:
    from django.contrib.auth import get_user_model
    from backend.nucleo_herbal.infraestructura.persistencia_django.models import CuentaClienteModelo

    usuario, creado_usuario = get_user_model().objects.get_or_create(
        username="cliente.local",
        defaults={"email": "cliente.local@botica.test", "first_name": "Cliente"},
    )
    if creado_usuario:
        usuario.set_password("botica-local-1234")
        usuario.save(update_fields=["password"])
    cuenta, creado_cuenta = CuentaClienteModelo.objects.update_or_create(
        email="cliente.local@botica.test",
        defaults={"usuario": usuario, "nombre_visible": "Cliente local", "email_verificado": True},
    )
    _upsert_direccion(cuenta)
    return {"creados": int(creado_usuario or creado_cuenta), "actualizados": int(not (creado_usuario or creado_cuenta))}


def _upsert_direccion(cuenta: object) -> None:
    from backend.nucleo_herbal.infraestructura.persistencia_django.models import DireccionCuentaClienteModelo

    direccion = DireccionCuentaClienteModelo.objects.filter(cuenta=cuenta, alias="Casa local").first()
    datos = {
        "nombre_destinatario": "Cliente local",
        "telefono_contacto": "+34999000000",
        "linea_1": "Calle Botica Local 1",
        "linea_2": "",
        "codigo_postal": "28000",
        "ciudad": "Madrid",
        "provincia": "Madrid",
        "pais_iso": "ES",
        "predeterminada": True,
    }
    if direccion is None:
        DireccionCuentaClienteModelo.objects.filter(cuenta=cuenta, predeterminada=True).update(predeterminada=False)
        DireccionCuentaClienteModelo.objects.create(cuenta=cuenta, alias="Casa local", **datos)
        return
    for campo, valor in datos.items():
        setattr(direccion, campo, valor)
    direccion.save()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Bootstrap local para ecommerce real con pago simulado.")
    parser.add_argument("--dry-run", action="store_true", help="calcula y revierte los cambios.")
    parser.add_argument("--json", action="store_true", help="emite JSON.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    configurar_django()
    resumen = ejecutar_bootstrap(dry_run=args.dry_run)
    if args.json:
        print(json.dumps({"dry_run": args.dry_run, "resumen": resumen}, ensure_ascii=False, indent=2))
        return 0
    modo = "DRY-RUN" if args.dry_run else "MUTANTE"
    print(f"== Bootstrap ecommerce local simulado ({modo}) ==")
    for entidad, estado in resumen.items():
        print(f"- {entidad}: creados={estado['creados']}, actualizados={estado['actualizados']}")
    print("Datos locales comprables preparados para checkout con pago de prueba.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
