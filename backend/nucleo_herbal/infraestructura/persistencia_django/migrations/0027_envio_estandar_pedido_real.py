from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("persistencia_django", "0026_reembolso_manual_pedido_incidencia"),
    ]

    operations = [
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="importe_envio",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="metodo_envio",
            field=models.CharField(default="envio_estandar", max_length=32),
        ),
    ]
