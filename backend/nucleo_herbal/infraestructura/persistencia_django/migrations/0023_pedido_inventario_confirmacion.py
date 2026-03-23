from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("persistencia_django", "0022_inventarioproductomodelo"),
    ]

    operations = [
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="inventario_descontado",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="incidencia_stock_confirmacion",
            field=models.BooleanField(default=False),
        ),
    ]
