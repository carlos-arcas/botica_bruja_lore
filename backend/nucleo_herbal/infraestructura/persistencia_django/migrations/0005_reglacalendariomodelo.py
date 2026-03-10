from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("persistencia_django", "0004_cuentademomodelo"),
    ]

    operations = [
        migrations.CreateModel(
            name="ReglaCalendarioModelo",
            fields=[
                ("id", models.CharField(max_length=36, primary_key=True, serialize=False)),
                ("nombre", models.CharField(max_length=180)),
                ("fecha_inicio", models.DateField()),
                ("fecha_fin", models.DateField()),
                ("prioridad", models.PositiveIntegerField(default=100)),
                ("activa", models.BooleanField(default=True)),
                (
                    "ritual",
                    models.ForeignKey(
                        on_delete=models.deletion.PROTECT,
                        related_name="reglas_calendario",
                        to="persistencia_django.ritualmodelo",
                    ),
                ),
            ],
            options={
                "db_table": "nucleo_regla_calendario",
                "ordering": ("prioridad", "id"),
            },
        ),
        migrations.AddConstraint(
            model_name="reglacalendariomodelo",
            constraint=models.CheckConstraint(
                check=models.Q(("fecha_fin__gte", models.F("fecha_inicio"))),
                name="nucleo_regla_calendario_rango_valido",
            ),
        ),
        migrations.AddIndex(
            model_name="reglacalendariomodelo",
            index=models.Index(
                fields=["activa", "fecha_inicio", "fecha_fin"],
                name="nucleo_regl_activa_c83a4f_idx",
            ),
        ),
        migrations.AddIndex(
            model_name="reglacalendariomodelo",
            index=models.Index(
                fields=["ritual", "activa", "prioridad"],
                name="nucleo_regl_ritual__1999ce_idx",
            ),
        ),
    ]
