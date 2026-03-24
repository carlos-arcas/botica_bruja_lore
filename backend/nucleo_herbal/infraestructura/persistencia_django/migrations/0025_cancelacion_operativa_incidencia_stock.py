from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("persistencia_django", "0024_pedido_revision_incidencia_stock"),
    ]

    operations = [
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="cancelado_operativa_incidencia_stock",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="fecha_cancelacion_operativa",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="motivo_cancelacion_operativa",
            field=models.CharField(blank=True, default="", max_length=280),
        ),
    ]
