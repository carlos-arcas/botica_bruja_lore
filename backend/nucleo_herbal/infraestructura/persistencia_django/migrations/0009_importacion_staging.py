from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("persistencia_django", "0008_alter_cuentademomodelo_options_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ImportacionLoteModelo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("entidad", models.CharField(max_length=64)),
                ("modo", models.CharField(max_length=32)),
                ("nombre_archivo", models.CharField(max_length=255)),
                ("columnas_detectadas", models.JSONField(default=list)),
                ("total_filas", models.PositiveIntegerField(default=0)),
                ("fecha_creacion", models.DateTimeField(auto_now_add=True)),
                ("fecha_actualizacion", models.DateTimeField(auto_now=True)),
                (
                    "usuario",
                    models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="lotes_importacion", to=settings.AUTH_USER_MODEL),
                ),
            ],
            options={
                "verbose_name": "lote de importación",
                "verbose_name_plural": "lotes de importación",
                "db_table": "nucleo_importacion_lote",
                "ordering": ("-fecha_creacion",),
            },
        ),
        migrations.CreateModel(
            name="ImportacionFilaModelo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("numero_fila_original", models.PositiveIntegerField()),
                ("datos", models.JSONField(default=dict)),
                ("errores", models.JSONField(default=list)),
                ("warnings", models.JSONField(default=list)),
                (
                    "estado",
                    models.CharField(
                        choices=[
                            ("valida", "Válida"),
                            ("valida_warning", "Válida con warning"),
                            ("invalida", "Inválida"),
                            ("descartada", "Descartada"),
                            ("confirmada", "Confirmada"),
                        ],
                        default="invalida",
                        max_length=24,
                    ),
                ),
                ("seleccionado", models.BooleanField(default=True)),
                ("imagen", models.CharField(blank=True, default="", max_length=255)),
                ("resultado_confirmacion", models.CharField(blank=True, default="", max_length=255)),
                (
                    "lote",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="filas", to="persistencia_django.importacionlotemodelo"),
                ),
            ],
            options={
                "verbose_name": "fila de importación",
                "verbose_name_plural": "filas de importación",
                "db_table": "nucleo_importacion_fila",
                "ordering": ("numero_fila_original", "id"),
            },
        ),
    ]
