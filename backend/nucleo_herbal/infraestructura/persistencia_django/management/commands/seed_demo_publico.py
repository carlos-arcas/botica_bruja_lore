from django.core.management.base import BaseCommand
from django.db import transaction

from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
    IntencionModelo,
    PlantaModelo,
    ProductoModelo,
    RitualModelo,
)

INTENCIONES_DEMO = (
    {
        "id": "int-demo-calma",
        "slug": "calma-nocturna",
        "nombre": "Calma nocturna",
        "descripcion": "Intención editorial para rituales de cierre suave al final del día.",
        "es_publica": True,
    },
    {
        "id": "int-demo-limpieza",
        "slug": "limpieza-energetica",
        "nombre": "Limpieza energética",
        "descripcion": "Intención editorial para prácticas de limpieza y renovación del espacio.",
        "es_publica": True,
    },
)

PLANTAS_DEMO = (
    {
        "id": "pla-demo-melisa",
        "slug": "melisa",
        "nombre": "Melisa",
        "descripcion_breve": "Planta aromática tradicional asociada a calma y descanso.",
        "publicada": True,
        "intenciones": ("calma-nocturna",),
    },
    {
        "id": "pla-demo-romero",
        "slug": "romero",
        "nombre": "Romero",
        "descripcion_breve": "Planta de tradición mediterránea conectada a claridad y limpieza.",
        "publicada": True,
        "intenciones": ("limpieza-energetica",),
    },
)

PRODUCTOS_DEMO = (
    {
        "id": "pro-demo-melisa",
        "sku": "HERB-DEMO-001",
        "slug": "melisa-a-granel-50g",
        "nombre": "Melisa a granel 50g",
        "tipo_producto": "hierbas-a-granel",
        "categoria_comercial": "hierbas-a-granel",
        "planta_slug": "melisa",
        "publicado": True,
    },
    {
        "id": "pro-demo-romero",
        "sku": "HERB-DEMO-002",
        "slug": "romero-a-granel-50g",
        "nombre": "Romero a granel 50g",
        "tipo_producto": "hierbas-a-granel",
        "categoria_comercial": "hierbas-a-granel",
        "planta_slug": "romero",
        "publicado": True,
    },
)

RITUALES_DEMO = (
    {
        "id": "rit-demo-cierre",
        "slug": "cierre-sereno",
        "nombre": "Cierre sereno",
        "contexto_breve": "Ritual breve para cerrar el día con melisa y foco de calma nocturna.",
        "publicado": True,
        "intenciones": ("calma-nocturna",),
        "plantas_relacionadas": ("melisa",),
        "productos_relacionados": ("melisa-a-granel-50g",),
    },
)


class Command(BaseCommand):
    help = "Carga una base mínima de datos demo públicos para entorno local/staging."

    @transaction.atomic
    def handle(self, *args, **options):
        resumen = {
            "intenciones": self._seed_intenciones(),
            "plantas": self._seed_plantas(),
            "productos": self._seed_productos(),
            "rituales": self._seed_rituales(),
        }

        self.stdout.write(self.style.SUCCESS("Seed demo pública aplicada correctamente."))
        for entidad, estado in resumen.items():
            self.stdout.write(
                f"- {entidad}: creados={estado['creados']}, actualizados={estado['actualizados']}"
            )

    def _seed_intenciones(self):
        return self._upsert(IntencionModelo, INTENCIONES_DEMO, "slug")

    def _seed_plantas(self):
        estado = self._upsert(PlantaModelo, PLANTAS_DEMO, "slug", excluir=("intenciones",))
        for item in PLANTAS_DEMO:
            planta = PlantaModelo.objects.get(slug=item["slug"])
            intenciones = IntencionModelo.objects.filter(slug__in=item["intenciones"])
            planta.intenciones.set(intenciones)
        return estado

    def _seed_productos(self):
        estado = {"creados": 0, "actualizados": 0}
        for item in PRODUCTOS_DEMO:
            planta = PlantaModelo.objects.get(slug=item["planta_slug"])
            defaults = {
                "id": item["id"],
                "sku": item["sku"],
                "nombre": item["nombre"],
                "tipo_producto": item["tipo_producto"],
                "categoria_comercial": item["categoria_comercial"],
                "planta": planta,
                "publicado": item["publicado"],
            }
            _, creado = ProductoModelo.objects.update_or_create(
                slug=item["slug"], defaults=defaults
            )
            clave = "creados" if creado else "actualizados"
            estado[clave] += 1
        return estado

    def _seed_rituales(self):
        estado = self._upsert(
            RitualModelo,
            RITUALES_DEMO,
            "slug",
            excluir=("intenciones", "plantas_relacionadas", "productos_relacionados"),
        )
        for item in RITUALES_DEMO:
            ritual = RitualModelo.objects.get(slug=item["slug"])
            ritual.intenciones.set(IntencionModelo.objects.filter(slug__in=item["intenciones"]))
            ritual.plantas_relacionadas.set(
                PlantaModelo.objects.filter(slug__in=item["plantas_relacionadas"])
            )
            ritual.productos_relacionados.set(
                ProductoModelo.objects.filter(slug__in=item["productos_relacionados"])
            )
        return estado

    def _upsert(self, modelo, items, clave, excluir=()):
        estado = {"creados": 0, "actualizados": 0}
        for item in items:
            defaults = {k: v for k, v in item.items() if k != clave and k not in excluir}
            _, creado = modelo.objects.update_or_create(
                **{clave: item[clave]},
                defaults=defaults,
            )
            estado["creados" if creado else "actualizados"] += 1
        return estado
