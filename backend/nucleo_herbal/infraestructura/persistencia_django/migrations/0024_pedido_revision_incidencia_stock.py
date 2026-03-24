from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("persistencia_django", "0023_pedido_inventario_confirmacion"),
    ]

    operations = [
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="incidencia_stock_revisada",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="fecha_revision_incidencia_stock",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
