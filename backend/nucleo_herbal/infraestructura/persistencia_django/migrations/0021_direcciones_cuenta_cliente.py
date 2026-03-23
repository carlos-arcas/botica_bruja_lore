from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("persistencia_django", "0020_recuperacion_password_cuenta_cliente")]

    operations = [
        migrations.CreateModel(
            name="DireccionCuentaClienteModelo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("alias", models.CharField(blank=True, default="", max_length=80)),
                ("nombre_destinatario", models.CharField(max_length=120)),
                ("telefono_contacto", models.CharField(max_length=40)),
                ("linea_1", models.CharField(max_length=160)),
                ("linea_2", models.CharField(blank=True, default="", max_length=160)),
                ("codigo_postal", models.CharField(max_length=24)),
                ("ciudad", models.CharField(max_length=120)),
                ("provincia", models.CharField(max_length=120)),
                ("pais_iso", models.CharField(default="ES", max_length=2)),
                ("predeterminada", models.BooleanField(default=False)),
                ("fecha_creacion", models.DateTimeField(auto_now_add=True)),
                ("fecha_actualizacion", models.DateTimeField(auto_now=True)),
                ("cuenta", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="direcciones", to="persistencia_django.cuentaclientemodelo")),
            ],
            options={
                "db_table": "nucleo_direccion_cuenta_cliente",
                "ordering": ("-predeterminada", "id"),
                "verbose_name": "dirección cuenta cliente",
                "verbose_name_plural": "direcciones cuenta cliente",
            },
        ),
        migrations.AddIndex(
            model_name="direccioncuentaclientemodelo",
            index=models.Index(fields=["cuenta", "predeterminada"], name="nucleo_dir_cta_pred_idx"),
        ),
        migrations.AddIndex(
            model_name="direccioncuentaclientemodelo",
            index=models.Index(fields=["cuenta", "codigo_postal"], name="nucleo_dir_cta_cp_idx"),
        ),
        migrations.AddConstraint(
            model_name="direccioncuentaclientemodelo",
            constraint=models.UniqueConstraint(condition=models.Q(("predeterminada", True)), fields=("cuenta",), name="uniq_direccion_predeterminada_por_cuenta"),
        ),
    ]
