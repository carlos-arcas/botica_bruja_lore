from django.core.management.base import BaseCommand
from django.db import transaction

from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
    IntencionModelo,
    PlantaModelo,
    ProductoModelo,
    ReglaCalendarioModelo,
    RitualModelo,
)

from .seed_demo_publico_catalogo import INTENCIONES_DEMO, PLANTAS_DEMO, PRODUCTOS_DEMO
from .seed_demo_publico_rituales import REGLAS_CALENDARIO_DEMO, RITUALES_DEMO


class Command(BaseCommand):
    help = "Carga una base minima de datos demo publicos para entorno local/staging."

    @transaction.atomic
    def handle(self, *args, **options):
        resumen = {
            "intenciones": self._seed_intenciones(),
            "plantas": self._seed_plantas(),
            "productos": self._seed_productos(),
            "rituales": self._seed_rituales(),
            "reglas_calendario": self._seed_reglas_calendario(),
        }

        self.stdout.write(self.style.SUCCESS("Seed demo publica aplicada correctamente."))
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
            planta = None
            if item["planta_slug"]:
                planta = PlantaModelo.objects.get(slug=item["planta_slug"])
            defaults = {
                "sku": item["sku"],
                "nombre": item["nombre"],
                "tipo_producto": item["tipo_producto"],
                "categoria_comercial": item["categoria_comercial"],
                "seccion_publica": item["seccion_publica"],
                "descripcion_corta": item["descripcion_corta"],
                "precio_visible": item["precio_visible"],
                "imagen_url": item["imagen_url"],
                "planta": planta,
                "publicado": item["publicado"],
            }
            producto = ProductoModelo.objects.filter(slug=item["slug"]).first()
            creado = producto is None
            if creado:
                ProductoModelo.objects.create(id=item["id"], slug=item["slug"], **defaults)
            else:
                for campo, valor in defaults.items():
                    setattr(producto, campo, valor)
                producto.save()
            estado["creados" if creado else "actualizados"] += 1
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

    def _seed_reglas_calendario(self):
        estado = {"creados": 0, "actualizados": 0}
        for item in REGLAS_CALENDARIO_DEMO:
            ritual = RitualModelo.objects.get(slug=item["ritual_slug"])
            defaults = {
                "ritual": ritual,
                "nombre": item["nombre"],
                "fecha_inicio": item["fecha_inicio"],
                "fecha_fin": item["fecha_fin"],
                "prioridad": item["prioridad"],
                "activa": item["activa"],
            }
            _, creado = ReglaCalendarioModelo.objects.update_or_create(
                id=item["id"], defaults=defaults
            )
            estado["creados" if creado else "actualizados"] += 1
        return estado

    def _upsert(self, modelo, items, clave, excluir=()):
        estado = {"creados": 0, "actualizados": 0}
        for item in items:
            defaults = {k: v for k, v in item.items() if k != clave and k not in excluir}
            objeto = modelo.objects.filter(**{clave: item[clave]}).first()
            creado = objeto is None
            if creado:
                modelo.objects.create(**{clave: item[clave], **defaults})
            else:
                # Si la identidad operativa es el slug, no intentamos reescribir la PK.
                for campo, valor in defaults.items():
                    if campo == "id" and clave != "id":
                        continue
                    setattr(objeto, campo, valor)
                objeto.save()
            estado["creados" if creado else "actualizados"] += 1
        return estado
