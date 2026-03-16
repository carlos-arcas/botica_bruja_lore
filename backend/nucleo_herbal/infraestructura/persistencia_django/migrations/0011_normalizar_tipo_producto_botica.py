from django.db import migrations


TIPOS_VALIDOS = {
    "hierbas-a-granel",
    "inciensos-y-sahumerios",
    "herramientas-rituales",
    "tarot-y-oraculos",
    "minerales-y-piedras",
    "packs-y-cestas",
}

MAPEO_LEGACY = {
    "a-granel-25g": "hierbas-a-granel",
    "a-granel-50g": "hierbas-a-granel",
    "a-granel-100g": "hierbas-a-granel",
    "atado": "hierbas-a-granel",
    "bolsita-ritual": "inciensos-y-sahumerios",
    "personalizado": "herramientas-rituales",
}


def normalizar_tipo_producto_botica(apps, schema_editor):
    ProductoModelo = apps.get_model("persistencia_django", "ProductoModelo")
    queryset = ProductoModelo.objects.filter(seccion_publica__iexact="botica-natural")
    for producto in queryset.iterator():
        tipo_actual = (producto.tipo_producto or "").strip()
        if tipo_actual in TIPOS_VALIDOS:
            continue
        tipo_normalizado = MAPEO_LEGACY.get(tipo_actual, "herramientas-rituales")
        producto.tipo_producto = tipo_normalizado
        producto.save(update_fields=["tipo_producto"])


class Migration(migrations.Migration):

    dependencies = [
        ("persistencia_django", "0010_articuloeditorialmodelo_productos_relacionados"),
    ]

    operations = [
        migrations.RunPython(normalizar_tipo_producto_botica, migrations.RunPython.noop),
    ]
