from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("persistencia_django", "0018_cuenta_cliente_real_v1"),
    ]

    operations = [
        migrations.CreateModel(
            name="VerificacionEmailCuentaClienteModelo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("token_hash", models.CharField(max_length=64, unique=True)),
                ("expira_en", models.DateTimeField()),
                ("fecha_creacion", models.DateTimeField(auto_now_add=True)),
                ("fecha_envio", models.DateTimeField(auto_now=True)),
                ("fecha_confirmacion", models.DateTimeField(blank=True, null=True)),
                (
                    "cuenta",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="verificacion_email",
                        to="persistencia_django.cuentaclientemodelo",
                    ),
                ),
            ],
            options={
                "db_table": "nucleo_verificacion_email_cuenta_cliente",
                "ordering": ("-fecha_envio",),
                "verbose_name": "verificación email cuenta cliente",
                "verbose_name_plural": "verificaciones email cuenta cliente",
            },
        ),
        migrations.AddIndex(
            model_name="verificacionemailcuentaclientemodelo",
            index=models.Index(fields=["expira_en", "fecha_confirmacion"], name="nucleo_verif_email_exp_idx"),
        ),
    ]
