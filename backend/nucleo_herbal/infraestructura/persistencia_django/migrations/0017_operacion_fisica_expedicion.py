from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("persistencia_django", "0016_post_pago_operativo"),
    ]

    operations = [
        migrations.AddField(model_name="pedidorealmodelo", name="codigo_seguimiento", field=models.CharField(blank=True, default="", max_length=120)),
        migrations.AddField(model_name="pedidorealmodelo", name="email_envio_enviado", field=models.BooleanField(default=False)),
        migrations.AddField(model_name="pedidorealmodelo", name="envio_sin_seguimiento", field=models.BooleanField(default=False)),
        migrations.AddField(model_name="pedidorealmodelo", name="fecha_email_envio", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="pedidorealmodelo", name="fecha_entrega", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="pedidorealmodelo", name="fecha_envio", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="pedidorealmodelo", name="fecha_preparacion", field=models.DateTimeField(blank=True, null=True)),
        migrations.AddField(model_name="pedidorealmodelo", name="observaciones_operativas", field=models.TextField(blank=True, default="")),
        migrations.AddField(model_name="pedidorealmodelo", name="transportista", field=models.CharField(blank=True, default="", max_length=120)),
    ]
