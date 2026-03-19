from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("persistencia_django", "0014_pedidorealmodelo_lineapedidorealmodelo")]

    operations = [
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="estado_pago",
            field=models.CharField(default="pendiente", max_length=32),
        ),
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="proveedor_pago",
            field=models.CharField(blank=True, default="", max_length=32),
        ),
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="id_externo_pago",
            field=models.CharField(blank=True, default="", max_length=128),
        ),
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="url_pago",
            field=models.URLField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="fecha_pago_confirmado",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddIndex(
            model_name="pedidorealmodelo",
            index=models.Index(fields=["proveedor_pago", "id_externo_pago"], name="nucleo_pedido_pago_ext_idx"),
        ),
        migrations.CreateModel(
            name="EventoWebhookPagoModelo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("proveedor_pago", models.CharField(max_length=32)),
                ("id_evento", models.CharField(max_length=128)),
                ("payload_crudo", models.TextField()),
                ("fecha_registro", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "db_table": "nucleo_evento_webhook_pago",
                "verbose_name": "evento webhook pago",
                "verbose_name_plural": "eventos webhook pago",
            },
        ),
        migrations.AddConstraint(
            model_name="eventowebhookpagomodelo",
            constraint=models.UniqueConstraint(fields=("proveedor_pago", "id_evento"), name="nucleo_webhook_pago_unique_idx"),
        ),
    ]
