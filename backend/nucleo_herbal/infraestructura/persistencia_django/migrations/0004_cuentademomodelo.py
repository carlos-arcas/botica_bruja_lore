from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("persistencia_django", "0003_pedidodemomodelo_lineapedidomodelo"),
    ]

    operations = [
        migrations.CreateModel(
            name="CuentaDemoModelo",
            fields=[
                ("id_usuario", models.CharField(max_length=64, primary_key=True, serialize=False)),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("nombre_visible", models.CharField(max_length=120)),
                ("clave_acceso_demo", models.CharField(max_length=120)),
                ("fecha_creacion", models.DateTimeField(auto_now_add=True)),
                ("fecha_actualizacion", models.DateTimeField(auto_now=True)),
            ],
            options={
                "db_table": "nucleo_cuenta_demo",
                "ordering": ("email",),
            },
        ),
    ]
