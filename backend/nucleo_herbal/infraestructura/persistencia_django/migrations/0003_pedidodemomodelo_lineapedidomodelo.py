from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("persistencia_django", "0002_ritualmodelo"),
    ]

    operations = [
        migrations.CreateModel(
            name="PedidoDemoModelo",
            fields=[
                ("id_pedido", models.CharField(max_length=64, primary_key=True, serialize=False)),
                ("email_contacto", models.EmailField(max_length=254)),
                ("canal_compra", models.CharField(max_length=20)),
                ("estado", models.CharField(max_length=20)),
                ("fecha_creacion", models.DateTimeField()),
                ("id_usuario", models.CharField(blank=True, max_length=64, null=True)),
            ],
            options={
                "db_table": "nucleo_pedido_demo",
                "ordering": ("-fecha_creacion",),
            },
        ),
        migrations.CreateModel(
            name="LineaPedidoModelo",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("id_producto", models.CharField(max_length=64)),
                ("slug_producto", models.SlugField(max_length=140)),
                ("nombre_producto", models.CharField(max_length=180)),
                ("cantidad", models.PositiveIntegerField()),
                ("precio_unitario_demo", models.DecimalField(decimal_places=2, max_digits=10)),
                (
                    "pedido",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="lineas",
                        to="persistencia_django.pedidodemomodelo",
                    ),
                ),
            ],
            options={
                "db_table": "nucleo_linea_pedido_demo",
                "ordering": ("id",),
            },
        ),
    ]
