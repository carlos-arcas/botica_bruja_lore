from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("persistencia_django", "0036_lineapedidorealmodelo_importe_impuestos_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="cuentaclientemodelo",
            name="google_sub",
            field=models.CharField(blank=True, max_length=191, null=True, unique=True),
        ),
    ]
