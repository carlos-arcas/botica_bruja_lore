from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("persistencia_django", "0005_reglacalendariomodelo"),
    ]

    operations = [
        migrations.AddField(
            model_name="productomodelo",
            name="descripcion_corta",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="productomodelo",
            name="imagen_url",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="productomodelo",
            name="precio_visible",
            field=models.CharField(blank=True, default="", max_length=80),
        ),
        migrations.AddField(
            model_name="productomodelo",
            name="seccion_publica",
            field=models.SlugField(default="catalogo-general", max_length=80),
        ),
        migrations.AddIndex(
            model_name="productomodelo",
            index=models.Index(
                fields=["seccion_publica", "publicado", "slug"],
                name="nucleo_prod_seccion_public_idx",
            ),
        ),
    ]
