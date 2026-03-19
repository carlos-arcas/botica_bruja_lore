from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("persistencia_django", "0015_pago_real_v1"),
    ]

    operations = [
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="email_post_pago_enviado",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="fecha_email_post_pago",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="pedidorealmodelo",
            name="requiere_revision_manual",
            field=models.BooleanField(default=False),
        ),
    ]
