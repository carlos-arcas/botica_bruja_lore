from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("persistencia_django", "0013_producto_precio_numerico")]

    operations = [
        migrations.CreateModel(
            name="PedidoRealModelo",
            fields=[
                ("id_pedido", models.CharField(max_length=64, primary_key=True, serialize=False)),
                ("estado", models.CharField(max_length=32)),
                ("canal_checkout", models.CharField(max_length=32)),
                ("email_contacto", models.EmailField(max_length=254)),
                ("nombre_contacto", models.CharField(max_length=160)),
                ("telefono_contacto", models.CharField(max_length=40)),
                ("id_usuario", models.CharField(blank=True, max_length=64, null=True)),
                ("es_invitado", models.BooleanField(default=True)),
                ("moneda", models.CharField(default="EUR", max_length=8)),
                ("subtotal", models.DecimalField(decimal_places=2, max_digits=10)),
                ("notas_cliente", models.TextField(blank=True, default="")),
                ("direccion_entrega", models.JSONField(default=dict)),
                ("fecha_creacion", models.DateTimeField()),
            ],
            options={
                "db_table": "nucleo_pedido",
                "ordering": ("-fecha_creacion",),
                "verbose_name": "pedido",
                "verbose_name_plural": "pedidos",
            },
        ),
        migrations.CreateModel(
            name="LineaPedidoRealModelo",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("id_producto", models.CharField(max_length=64)),
                ("slug_producto", models.SlugField(max_length=140)),
                ("nombre_producto", models.CharField(max_length=180)),
                ("cantidad", models.PositiveIntegerField()),
                ("precio_unitario", models.DecimalField(decimal_places=2, max_digits=10)),
                ("moneda", models.CharField(default="EUR", max_length=8)),
                ("pedido", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="lineas", to="persistencia_django.pedidorealmodelo")),
            ],
            options={
                "db_table": "nucleo_linea_pedido",
                "ordering": ("id",),
                "verbose_name": "línea de pedido",
                "verbose_name_plural": "líneas de pedido",
            },
        ),
        migrations.AddIndex(
            model_name="pedidorealmodelo",
            index=models.Index(fields=["estado", "fecha_creacion"], name="nucleo_pedido_estado_fecha_idx"),
        ),
        migrations.AddIndex(
            model_name="pedidorealmodelo",
            index=models.Index(fields=["email_contacto", "fecha_creacion"], name="nucleo_pedido_email_fecha_idx"),
        ),
    ]
