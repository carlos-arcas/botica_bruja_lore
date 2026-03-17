from decimal import Decimal, InvalidOperation

from django.db import migrations, models


def poblar_precio_numerico(apps, schema_editor):
    ProductoModelo = apps.get_model("persistencia_django", "ProductoModelo")
    for producto in ProductoModelo.objects.all().iterator():
        texto = (producto.precio_visible or "").strip().replace("€", "").replace(" ", "").replace(",", ".")
        if not texto:
            producto.precio_numerico = None
        else:
            try:
                producto.precio_numerico = Decimal(texto)
            except InvalidOperation:
                producto.precio_numerico = None
        producto.save(update_fields=["precio_numerico"])


class Migration(migrations.Migration):

    dependencies = [
        ("persistencia_django", "0012_producto_botica_campos_filtros"),
    ]

    operations = [
        migrations.AddField(
            model_name="productomodelo",
            name="precio_numerico",
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True),
        ),
        migrations.RunPython(poblar_precio_numerico, migrations.RunPython.noop),
    ]
