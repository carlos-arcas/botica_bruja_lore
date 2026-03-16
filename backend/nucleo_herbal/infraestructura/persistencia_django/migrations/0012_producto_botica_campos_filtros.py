from django.db import migrations, models


BENEFICIOS_LEGACY = {
    "calma": "calma",
    "descanso": "descanso",
    "digestivo": "digestivo",
    "energia": "energia",
    "enfoque": "claridad",
}

FORMATOS_LEGACY = {
    "a-granel-25g": "granel",
    "a-granel-50g": "granel",
    "a-granel-100g": "granel",
    "atado": "granel",
    "bolsita-ritual": "polvo",
}


def normalizar_beneficio(valor: str) -> str:
    limpio = (valor or "").strip().lower().replace(" ", "-")
    return BENEFICIOS_LEGACY.get(limpio, limpio)


def normalizar_formato(valor: str) -> str:
    limpio = (valor or "").strip().lower().replace(" ", "-")
    return FORMATOS_LEGACY.get(limpio, limpio)


def migrar_datos_legacy(apps, schema_editor):
    ProductoModelo = apps.get_model("persistencia_django", "ProductoModelo")
    for producto in ProductoModelo.objects.filter(seccion_publica="botica-natural"):
        categoria = (producto.categoria_comercial or "").strip().lower().replace(" ", "-")
        if not producto.beneficio_principal:
            producto.beneficio_principal = normalizar_beneficio(categoria)
        if not producto.formato_comercial:
            producto.formato_comercial = normalizar_formato(categoria)
        if not producto.modo_uso:
            producto.modo_uso = "infusion"
        if not producto.categoria_visible:
            producto.categoria_visible = categoria or "hierbas-a-granel"
        producto.save(
            update_fields=[
                "beneficio_principal",
                "formato_comercial",
                "modo_uso",
                "categoria_visible",
            ]
        )


class Migration(migrations.Migration):

    dependencies = [
        ("persistencia_django", "0011_normalizar_tipo_producto_botica"),
    ]

    operations = [
        migrations.AddField(
            model_name="productomodelo",
            name="beneficio_principal",
            field=models.SlugField(blank=True, default="", max_length=80),
        ),
        migrations.AddField(
            model_name="productomodelo",
            name="beneficios_secundarios",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="productomodelo",
            name="formato_comercial",
            field=models.SlugField(blank=True, default="", max_length=80),
        ),
        migrations.AddField(
            model_name="productomodelo",
            name="modo_uso",
            field=models.SlugField(blank=True, default="", max_length=80),
        ),
        migrations.AddField(
            model_name="productomodelo",
            name="categoria_visible",
            field=models.SlugField(blank=True, default="", max_length=80),
        ),
        migrations.RunPython(migrar_datos_legacy, migrations.RunPython.noop),
    ]
