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
        "seccion_publica": "botica-natural",
        "descripcion_corta": "Hoja cortada para infusión suave de tarde y descanso ritual.",
        "precio_visible": "9,90 €",
        "imagen_url": "/imagenes/productos/melisa-a-granel.webp",
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
        "seccion_publica": "botica-natural",
        "descripcion_corta": "Romero de corte fino para baños herbales y limpieza del hogar.",
        "precio_visible": "8,50 €",
        "imagen_url": "/imagenes/productos/romero-a-granel.webp",
        "planta_slug": "romero",
        "publicado": True,
    },
    {
        "id": "pro-demo-lavanda",
        "sku": "HERB-DEMO-003",
        "slug": "lavanda-flores-40g",
        "nombre": "Lavanda flores 40g",
        "tipo_producto": "inciensos-y-sahumerios",
        "categoria_comercial": "flores-herbales",
        "seccion_publica": "botica-natural",
        "descripcion_corta": "Flores secas de lavanda para sahumo suave y bolsitas aromáticas.",
        "precio_visible": "7,20 €",
        "imagen_url": "/imagenes/productos/lavanda-flores.webp",
        "planta_slug": None,
        "publicado": True,
    },
    {
        "id": "pro-demo-manazanilla",
        "sku": "HERB-DEMO-004",
        "slug": "manzanilla-dulce-60g",
        "nombre": "Manzanilla dulce 60g",
        "tipo_producto": "hierbas-a-granel",
        "categoria_comercial": "hierbas-a-granel",
        "seccion_publica": "botica-natural",
        "descripcion_corta": "Capítulos florales seleccionados para infusión y baños de vapor.",
        "precio_visible": "8,90 €",
        "imagen_url": "",
        "planta_slug": "melisa",
        "publicado": True,
    },
    {
        "id": "pro-demo-ruda",
        "sku": "HERB-DEMO-005",
        "slug": "ruda-rama-seca-30g",
        "nombre": "Ruda rama seca 30g",
        "tipo_producto": "herramientas-rituales",
        "categoria_comercial": "proteccion-del-hogar",
        "seccion_publica": "botica-natural",
        "descripcion_corta": "Atado ritual para limpieza del umbral y protección simbólica.",
        "precio_visible": "6,40 €",
        "imagen_url": "/imagenes/productos/ruda-rama-seca.webp",
        "planta_slug": None,
        "publicado": True,
    },
    {
        "id": "pro-demo-vela",
        "sku": "HERB-DEMO-900",
        "slug": "vela-lunar-blanca",
        "nombre": "Vela lunar blanca",
        "tipo_producto": "herramientas-rituales",
        "categoria_comercial": "velas",
        "seccion_publica": "velas-e-incienso",
        "descripcion_corta": "Pieza de apoyo para altar lunar.",
        "precio_visible": "5,00 €",
        "imagen_url": "/imagenes/productos/vela-lunar-blanca.webp",
        "planta_slug": None,
        "publicado": True,
    },
    {
        "id": "pro-demo-incienso-ruda",
        "sku": "HERB-DEMO-901",
        "slug": "incienso-ruda-proteccion",
        "nombre": "Incienso de ruda protección",
        "tipo_producto": "inciensos-y-sahumerios",
        "categoria_comercial": "inciensos",
        "seccion_publica": "velas-e-incienso",
        "descripcion_corta": "Varillas de ruda para limpiar el ambiente y acompañar aperturas rituales.",
        "precio_visible": "4,80 €",
        "imagen_url": "/imagenes/productos/incienso-ruda-proteccion.webp",
        "planta_slug": None,
        "publicado": True,
    },
    {
        "id": "pro-demo-vela-miel",
        "sku": "HERB-DEMO-902",
        "slug": "vela-miel-dorada",
        "nombre": "Vela miel dorada",
        "tipo_producto": "herramientas-rituales",
        "categoria_comercial": "velas",
        "seccion_publica": "velas-e-incienso",
        "descripcion_corta": "Vela de cera para altares cálidos y prácticas de abundancia cotidiana.",
        "precio_visible": "6,20 €",
        "imagen_url": "/imagenes/productos/vela-miel-dorada.webp",
        "planta_slug": None,
        "publicado": True,
    },
    {
        "id": "pro-demo-cuarzo",
        "sku": "HERB-DEMO-950",
        "slug": "cuarzo-cristal-rodado",
        "nombre": "Cuarzo cristal rodado",
        "tipo_producto": "minerales-y-piedras",
        "categoria_comercial": "rodados",
        "seccion_publica": "minerales-y-energia",
        "descripcion_corta": "Pieza pulida de cuarzo transparente para altar, bolsillo ritual o escritorio.",
        "precio_visible": "7,50 €",
        "imagen_url": "/imagenes/productos/cuarzo-cristal-rodado.webp",
        "planta_slug": None,
        "publicado": True,
    },
    {
        "id": "pro-demo-amatista",
        "sku": "HERB-DEMO-951",
        "slug": "amatista-punta-suave",
        "nombre": "Amatista punta suave",
        "tipo_producto": "minerales-y-piedras",
        "categoria_comercial": "puntas",
        "seccion_publica": "minerales-y-energia",
        "descripcion_corta": "Punta de amatista de pequeño formato para espacios de pausa y contemplación.",
        "precio_visible": "12,90 €",
        "imagen_url": "/imagenes/productos/amatista-punta-suave.webp",
        "planta_slug": None,
        "publicado": True,
    },
    {
        "id": "pro-demo-obsidiana",
        "sku": "HERB-DEMO-952",
        "slug": "obsidiana-negra-bruta",
        "nombre": "Obsidiana negra bruta",
        "tipo_producto": "minerales-y-piedras",
        "categoria_comercial": "piedra-bruta",
        "seccion_publica": "minerales-y-energia",
        "descripcion_corta": "Fragmento mineral en bruto para composiciones de altar y contraste matérico.",
        "precio_visible": "9,80 €",
        "imagen_url": "/imagenes/productos/obsidiana-negra-bruta.webp",
        "planta_slug": None,
        "publicado": True,
    },
    {
        "id": "pro-demo-pendulo",
        "sku": "HERB-DEMO-980",
        "slug": "pendulo-laton-dorado",
        "nombre": "Pendulo de laton dorado",
        "tipo_producto": "herramientas-rituales",
        "categoria_comercial": "radiestesia",
        "seccion_publica": "herramientas-esotericas",
        "descripcion_corta": "Herramienta de consulta simbolica para altar, diario ritual o mesa de trabajo.",
        "precio_visible": "14,90 â‚¬",
        "imagen_url": "/imagenes/productos/pendulo-laton-dorado.webp",
        "planta_slug": None,
        "publicado": True,
    },
    {
        "id": "pro-demo-cuenco-selenita",
        "sku": "HERB-DEMO-981",
        "slug": "cuenco-selenita-pulido",
        "nombre": "Cuenco de selenita pulido",
        "tipo_producto": "herramientas-rituales",
        "categoria_comercial": "altar-y-soportes",
        "seccion_publica": "herramientas-esotericas",
        "descripcion_corta": "Pieza de apoyo para guardar amuletos, mezclas secas o pequenas piedras del altar.",
        "precio_visible": "18,50 â‚¬",
        "imagen_url": "/imagenes/productos/cuenco-selenita-pulido.webp",
        "planta_slug": None,
        "publicado": True,
    },
    {
        "id": "pro-demo-caldero",
        "sku": "HERB-DEMO-982",
        "slug": "caldero-hierro-mini",
        "nombre": "Caldero de hierro mini",
        "tipo_producto": "herramientas-rituales",
        "categoria_comercial": "altares-y-fuego",
        "seccion_publica": "herramientas-esotericas",
        "descripcion_corta": "Recipiente de mesa para carbon, resinas o pequenas preparaciones rituales secas.",
        "precio_visible": "16,80 â‚¬",
        "imagen_url": "/imagenes/productos/caldero-hierro-mini.webp",
        "planta_slug": None,
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
            planta = None
            if item["planta_slug"]:
                planta = PlantaModelo.objects.get(slug=item["planta_slug"])
            defaults = {
                "id": item["id"],
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
