from django.contrib.auth import get_user_model
from django.test import TestCase

from backend.nucleo_herbal.infraestructura.persistencia_django.models import ProductoModelo


class ApiBackofficeTests(TestCase):
    def setUp(self) -> None:
        self.user_model = get_user_model()
        self.staff = self.user_model.objects.create_user(
            username="staff",
            password="clave-segura",
            is_staff=True,
        )
        ProductoModelo.objects.create(
            id="pro-1",
            sku="SKU-001",
            slug="producto-demo-1",
            nombre="Producto Demo 1",
            tipo_producto="hierba",
            categoria_comercial="botica",
            seccion_publica="botica-natural",
            precio_visible="8,90 €",
            publicado=True,
        )
        ProductoModelo.objects.create(
            id="pro-2",
            sku="SKU-002",
            slug="producto-demo-2",
            nombre="Producto Demo 2",
            tipo_producto="ritual",
            categoria_comercial="esoterico",
            seccion_publica="rituales",
            precio_visible="12,00 €",
            publicado=False,
        )

    def test_estado_backoffice_rechaza_usuario_no_autenticado(self) -> None:
        response = self.client.get("/api/v1/backoffice/estado/")

        self.assertIn(response.status_code, (302, 403))

    def test_estado_backoffice_permite_staff(self) -> None:
        self.client.force_login(self.staff)

        response = self.client.get("/api/v1/backoffice/estado/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["autorizado"])

    def test_listado_productos_aplica_filtro_publicado(self) -> None:
        self.client.force_login(self.staff)

        response = self.client.get("/api/v1/backoffice/productos/?publicado=true")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["metricas"]["total"], 1)
        self.assertEqual(data["productos"][0]["slug"], "producto-demo-1")

    def test_listado_productos_busqueda_sin_resultados(self) -> None:
        self.client.force_login(self.staff)

        response = self.client.get("/api/v1/backoffice/productos/?q=inexistente")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["productos"], [])

    def test_publicacion_producto_exige_staff(self) -> None:
        response = self.client.post(
            "/api/v1/backoffice/productos/pro-2/publicacion/",
            data="{\"publicado\": true}",
            content_type="application/json",
        )

        self.assertIn(response.status_code, (302, 403))

    def test_publicacion_producto_actualiza_estado(self) -> None:
        self.client.force_login(self.staff)

        response = self.client.post(
            "/api/v1/backoffice/productos/pro-2/publicacion/",
            data="{\"publicado\": true}",
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["producto"]["publicado"])

    def test_guardar_producto_botica_persiste_campos_catalogo(self) -> None:
        self.client.force_login(self.staff)

        response = self.client.post(
            "/api/v1/backoffice/productos/guardar/",
            data='{"nombre":"Melisa","seccion_publica":"botica-natural","tipo_producto":"herramientas-rituales","categoria_comercial":"hierbas","beneficio_principal":"calma","beneficios_secundarios":"energia","formato_comercial":"hoja-seca","modo_uso":"infusion","categoria_visible":"hierbas","publicado":true}',
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        item = response.json()["item"]
        self.assertEqual(item["beneficio_principal"], "calma")
        self.assertEqual(item["formato_comercial"], "hoja-seca")
        self.assertEqual(item["modo_uso"], "infusion")

    def test_editar_producto_botica_conserva_campos_catalogo(self) -> None:
        self.client.force_login(self.staff)
        producto = ProductoModelo.objects.create(
            id="pro-edit-botica",
            sku="BOT-EDIT-001",
            slug="botica-edit-1",
            nombre="Botica Edit",
            tipo_producto="herramientas-rituales",
            categoria_comercial="hierbas",
            seccion_publica="botica-natural",
            beneficio_principal="calma",
            formato_comercial="hoja-seca",
            modo_uso="infusion",
            categoria_visible="hierbas",
            publicado=True,
        )

        response = self.client.post(
            "/api/v1/backoffice/productos/guardar/",
            data=f'{{"id":"{producto.id}","nombre":"Botica Edit 2","seccion_publica":"botica-natural","tipo_producto":"herramientas-rituales","categoria_comercial":"mezclas","beneficio_principal":"energia","formato_comercial":"mezcla-herbal","modo_uso":"altar","categoria_visible":"mezclas","publicado":true}}',
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        item = response.json()["item"]
        self.assertEqual(item["beneficio_principal"], "energia")
        self.assertEqual(item["formato_comercial"], "mezcla-herbal")


    def test_listado_plantas_asociables_backoffice_devuelve_nombres_humanos(self) -> None:
        from backend.nucleo_herbal.infraestructura.persistencia_django.models import PlantaModelo

        PlantaModelo.objects.create(
            id="pla-010",
            slug="menta",
            nombre="Menta",
            descripcion_breve="fresca",
            publicada=True,
        )
        self.client.force_login(self.staff)

        response = self.client.get("/api/v1/backoffice/productos/plantas-asociables/")

        self.assertEqual(response.status_code, 200)
        items = response.json()["items"]
        self.assertTrue(any(item["id"] == "pla-010" and item["nombre"] == "Menta" for item in items))

    def test_guardar_producto_invalido_hierba_sin_planta_devuelve_error(self) -> None:
        self.client.force_login(self.staff)

        response = self.client.post(
            "/api/v1/backoffice/productos/guardar/",
            data='{"nombre":"Menta","seccion_publica":"botica-natural","tipo_producto":"hierbas-a-granel","categoria_comercial":"hierbas","publicado":true}',
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(ProductoModelo.objects.filter(nombre="Menta").count(), 0)

    def test_guardar_producto_valido_hierba_con_planta_funciona(self) -> None:
        from backend.nucleo_herbal.infraestructura.persistencia_django.models import PlantaModelo

        self.client.force_login(self.staff)
        planta = PlantaModelo.objects.create(
            id="pla-001",
            slug="melisa",
            nombre="Melisa",
            descripcion_breve="calma",
            publicada=True,
        )

        response = self.client.post(
            "/api/v1/backoffice/productos/guardar/",
            data=(
                '{"nombre":"Melisa 25g","seccion_publica":"botica-natural","tipo_producto":"hierbas-a-granel",'
                '"categoria_comercial":"hierbas","planta_id":"%s","beneficio_principal":"calma",'
                '"formato_comercial":"hoja-seca","modo_uso":"infusion","categoria_visible":"hierbas","publicado":true}'
            )
            % planta.id,
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["item"]["planta_id"], planta.id)
