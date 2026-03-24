from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("persistencia_django", "0025_cancelacion_operativa_incidencia_stock"),
    ]

    operations = [
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="estado_reembolso",
            field=models.CharField(default="no_iniciado", max_length=24),
        ),
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="fecha_reembolso",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="id_externo_reembolso",
            field=models.CharField(blank=True, default="", max_length=128),
        ),
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="motivo_fallo_reembolso",
            field=models.CharField(blank=True, default="", max_length=280),
        ),
    ]
