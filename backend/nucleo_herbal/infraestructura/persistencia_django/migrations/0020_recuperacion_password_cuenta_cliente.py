from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("persistencia_django", "0019_verificacion_email_cuenta_cliente"),
    ]

    operations = [
        migrations.CreateModel(
            name="RecuperacionPasswordCuentaClienteModelo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("token_hash", models.CharField(max_length=64, unique=True)),
                ("expira_en", models.DateTimeField()),
                ("fecha_creacion", models.DateTimeField(auto_now_add=True)),
                ("fecha_envio", models.DateTimeField(auto_now=True)),
                ("fecha_uso", models.DateTimeField(blank=True, null=True)),
                (
                    "cuenta",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="recuperaciones_password",
                        to="persistencia_django.cuentaclientemodelo",
                    ),
                ),
            ],
            options={
                "verbose_name": "recuperación password cuenta cliente",
                "verbose_name_plural": "recuperaciones password cuenta cliente",
                "db_table": "nucleo_recuperacion_password_cuenta_cliente",
                "ordering": ("-fecha_envio",),
            },
        ),
        migrations.AddIndex(
            model_name="recuperacionpasswordcuentaclientemodelo",
            index=models.Index(fields=["expira_en", "fecha_uso"], name="nucleo_recovery_pass_exp_idx"),
        ),
        migrations.AddIndex(
            model_name="recuperacionpasswordcuentaclientemodelo",
            index=models.Index(fields=["cuenta", "fecha_uso"], name="nucleo_recovery_pass_cta_idx"),
        ),
    ]
