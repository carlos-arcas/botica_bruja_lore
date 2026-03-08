from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("persistencia_django", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="RitualModelo",
            fields=[
                ("id", models.CharField(max_length=36, primary_key=True, serialize=False)),
                ("slug", models.SlugField(max_length=120, unique=True)),
                ("nombre", models.CharField(max_length=180)),
                ("contexto_breve", models.TextField()),
                ("publicado", models.BooleanField(default=True)),
                (
                    "intenciones",
                    models.ManyToManyField(
                        help_text="Intenciones editoriales que guían el descubrimiento del ritual.",
                        related_name="rituales",
                        to="persistencia_django.intencionmodelo",
                    ),
                ),
                (
                    "plantas_relacionadas",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Plantas conectadas editorialmente al ritual.",
                        related_name="rituales",
                        to="persistencia_django.plantamodelo",
                    ),
                ),
                (
                    "productos_relacionados",
                    models.ManyToManyField(
                        blank=True,
                        help_text="Productos conectados al ritual sin convertirlo en categoría comercial.",
                        related_name="rituales",
                        to="persistencia_django.productomodelo",
                    ),
                ),
            ],
            options={"db_table": "nucleo_ritual", "ordering": ("nombre",)},
        ),
    ]
