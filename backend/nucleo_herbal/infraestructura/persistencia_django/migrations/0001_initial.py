from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="IntencionModelo",
            fields=[
                ("id", models.CharField(max_length=36, primary_key=True, serialize=False)),
                ("slug", models.SlugField(max_length=80, unique=True)),
                ("nombre", models.CharField(max_length=120)),
                ("descripcion", models.TextField(blank=True)),
                ("es_publica", models.BooleanField(default=True)),
            ],
            options={"db_table": "nucleo_intencion", "ordering": ("nombre",)},
        ),
        migrations.CreateModel(
            name="PlantaModelo",
            fields=[
                ("id", models.CharField(max_length=36, primary_key=True, serialize=False)),
                ("slug", models.SlugField(max_length=80, unique=True)),
                ("nombre", models.CharField(max_length=120)),
                ("descripcion_breve", models.TextField()),
                ("publicada", models.BooleanField(default=True)),
                (
                    "intenciones",
                    models.ManyToManyField(
                        related_name="plantas",
                        to="persistencia_django.intencionmodelo",
                    ),
                ),
            ],
            options={"db_table": "nucleo_planta", "ordering": ("nombre",)},
        ),
        migrations.CreateModel(
            name="ProductoModelo",
            fields=[
                ("id", models.CharField(max_length=36, primary_key=True, serialize=False)),
                ("sku", models.CharField(max_length=40, unique=True)),
                ("slug", models.SlugField(max_length=120, unique=True)),
                ("nombre", models.CharField(max_length=180)),
                ("tipo_producto", models.CharField(max_length=80)),
                ("categoria_comercial", models.CharField(max_length=80)),
                ("publicado", models.BooleanField(default=True)),
                (
                    "planta",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="productos",
                        to="persistencia_django.plantamodelo",
                    ),
                ),
            ],
            options={"db_table": "nucleo_producto", "ordering": ("nombre",)},
        ),
    ]
