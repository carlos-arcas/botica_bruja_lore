import os
import unittest
from datetime import UTC, datetime
from decimal import Decimal
from importlib.util import find_spec

DJANGO_DISPONIBLE = find_spec("django") is not None


@unittest.skipUnless(DJANGO_DISPONIBLE, "Django no está instalado en el entorno de pruebas.")
class TestRepositoriosDjango(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.configuracion_django.settings")

        import django
        from django.core.management import call_command

        django.setup()
        call_command("migrate", run_syncdb=True, verbosity=0)

        from backend.nucleo_herbal.infraestructura.persistencia_django.models import (
            CuentaDemoModelo,
            IntencionModelo,
            LineaPedidoModelo,
            PedidoDemoModelo,
            PlantaModelo,
            ProductoModelo,
            RitualModelo,
        )

        cls.CuentaDemoModelo = CuentaDemoModelo
        cls.IntencionModelo = IntencionModelo
        cls.PlantaModelo = PlantaModelo
        cls.ProductoModelo = ProductoModelo
        cls.RitualModelo = RitualModelo
        cls.PedidoDemoModelo = PedidoDemoModelo
        cls.LineaPedidoModelo = LineaPedidoModelo

    def setUp(self) -> None:
        from backend.nucleo_herbal.infraestructura.persistencia_django.repositorios import (
            ProveedorHistorialPedidosDemoORM,
            RepositorioCuentasDemoORM,
            RepositorioPedidosDemoORM,
            RepositorioPlantasORM,
            RepositorioProductosORM,
            RepositorioRitualesORM,
        )

        self.CuentaDemoModelo.objects.all().delete()
        self.LineaPedidoModelo.objects.all().delete()
        self.PedidoDemoModelo.objects.all().delete()
        self.RitualModelo.objects.all().delete()
        self.ProductoModelo.objects.all().delete()
        self.PlantaModelo.objects.all().delete()
        self.IntencionModelo.objects.all().delete()

        self.intencion_calma = self.IntencionModelo.objects.create(
            id="int-1",
            slug="calma",
            nombre="Calma",
            descripcion="Equilibrio suave",
        )
        self.IntencionModelo.objects.create(
            id="int-2",
            slug="descanso",
            nombre="Descanso",
            descripcion="Intención nocturna",
            es_publica=False,
        )
        self.planta = self.PlantaModelo.objects.create(
            id="pla-1",
            slug="melisa",
            nombre="Melisa",
            descripcion_breve="Planta aromática de tradición herbal.",
            publicada=True,
        )
        self.planta.intenciones.add(self.intencion_calma)

        self.producto = self.ProductoModelo.objects.create(
            id="prod-1",
            sku="HERB-001",
            slug="melisa-a-granel-50g",
            nombre="Melisa a granel 50g",
            tipo_producto="hierbas-a-granel",
            categoria_comercial="hierbas-a-granel",
            planta=self.planta,
            publicado=True,
        )
        self.ProductoModelo.objects.create(
            id="prod-2",
            sku="HERB-002",
            slug="melisa-a-granel-100g",
            nombre="Melisa a granel 100g",
            tipo_producto="hierbas-a-granel",
            categoria_comercial="hierbas-a-granel",
            planta=self.planta,
            publicado=False,
        )
        self.ProductoModelo.objects.create(
            id="prod-3",
            sku="ESC-001",
            slug="vela-ritual",
            nombre="Vela ritual",
            tipo_producto="herramientas-rituales",
            categoria_comercial="herramientas-esotericas",
            planta=None,
            publicado=True,
        )

        ritual_publicado = self.RitualModelo.objects.create(
            id="rit-1",
            slug="cierre-sereno",
            nombre="Cierre sereno",
            contexto_breve="Secuencia breve para descanso.",
            publicado=True,
        )
        ritual_publicado.intenciones.add(self.intencion_calma)
        ritual_publicado.plantas_relacionadas.add(self.planta)
        ritual_publicado.productos_relacionados.add(self.producto)

        ritual_no_publicado = self.RitualModelo.objects.create(
            id="rit-2",
            slug="ritual-oculto",
            nombre="Ritual oculto",
            contexto_breve="No debe salir en navegación pública.",
            publicado=False,
        )
        ritual_no_publicado.intenciones.add(self.intencion_calma)

        self.repo_plantas = RepositorioPlantasORM()
        self.repo_productos = RepositorioProductosORM()
        self.repo_rituales = RepositorioRitualesORM()
        self.repo_pedidos_demo = RepositorioPedidosDemoORM()
        self.repo_cuentas_demo = RepositorioCuentasDemoORM()
        self.proveedor_historial_cuentas = ProveedorHistorialPedidosDemoORM()

    def test_listar_navegables(self) -> None:
        plantas = self.repo_plantas.listar_navegables()

        self.assertEqual(len(plantas), 1)
        self.assertEqual(plantas[0].slug, "melisa")
        self.assertEqual(plantas[0].intenciones[0].slug, "calma")

    def test_obtener_por_slug(self) -> None:
        planta = self.repo_plantas.obtener_por_slug("melisa")

        self.assertIsNotNone(planta)
        assert planta is not None
        self.assertEqual(planta.nombre, "Melisa")

    def test_listar_por_intencion(self) -> None:
        plantas = self.repo_plantas.listar_por_intencion("calma")

        self.assertEqual(len(plantas), 1)
        self.assertEqual(plantas[0].slug, "melisa")

    def test_listar_herbales_por_planta(self) -> None:
        productos = self.repo_productos.listar_herbales_por_planta("pla-1")

        self.assertEqual(len(productos), 1)
        self.assertEqual(productos[0].sku, "HERB-001")

    def test_rituales_listar_navegables(self) -> None:
        rituales = self.repo_rituales.listar_navegables()

        self.assertEqual(len(rituales), 1)
        self.assertEqual(rituales[0].slug, "cierre-sereno")

    def test_rituales_obtener_por_slug(self) -> None:
        ritual = self.repo_rituales.obtener_por_slug("cierre-sereno")

        self.assertIsNotNone(ritual)
        assert ritual is not None
        self.assertEqual(ritual.nombre, "Cierre sereno")

    def test_rituales_filtrar_por_intencion(self) -> None:
        rituales = self.repo_rituales.listar_por_intencion("calma")

        self.assertEqual(len(rituales), 1)
        self.assertEqual(rituales[0].slug, "cierre-sereno")

    def test_rituales_filtrar_por_planta(self) -> None:
        rituales = self.repo_rituales.listar_por_planta("pla-1")

        self.assertEqual(len(rituales), 1)
        self.assertEqual(rituales[0].slug, "cierre-sereno")

    def test_rituales_filtrar_por_producto(self) -> None:
        rituales = self.repo_rituales.listar_por_producto("prod-1")

        self.assertEqual(len(rituales), 1)
        self.assertEqual(rituales[0].slug, "cierre-sereno")

    def test_rituales_listar_plantas_relacionadas(self) -> None:
        plantas = self.repo_rituales.listar_plantas_relacionadas("rit-1")

        self.assertEqual(len(plantas), 1)
        self.assertEqual(plantas[0].slug, "melisa")

    def test_rituales_listar_productos_relacionados(self) -> None:
        productos = self.repo_rituales.listar_productos_relacionados("rit-1")

        self.assertEqual(len(productos), 1)
        self.assertEqual(productos[0].sku, "HERB-001")

    def test_pedidos_demo_guardar_y_obtener_por_id(self) -> None:
        from backend.nucleo_herbal.dominio.pedidos_demo import LineaPedido, PedidoDemo

        pedido = PedidoDemo(
            id_pedido="PD-20260101010101-demo0001",
            email_contacto="demo@lore.test",
            canal_compra="invitado",
            lineas=(
                LineaPedido(
                    id_producto="prod-1",
                    slug_producto="melisa-a-granel-50g",
                    nombre_producto="Melisa a granel 50g",
                    cantidad=2,
                    precio_unitario_demo=Decimal("5.00"),
                ),
            ),
        )

        persistido = self.repo_pedidos_demo.guardar(pedido)
        recuperado = self.repo_pedidos_demo.obtener_por_id("PD-20260101010101-demo0001")

        self.assertEqual(persistido.id_pedido, pedido.id_pedido)
        self.assertIsNotNone(recuperado)
        assert recuperado is not None
        self.assertEqual(recuperado.subtotal_demo, Decimal("10.00"))
        self.assertEqual(recuperado.estado, "creado")
        self.assertEqual(recuperado.canal_compra, "invitado")

    def test_pedidos_demo_reconstruye_lineas_y_total_demo(self) -> None:
        from backend.nucleo_herbal.dominio.pedidos_demo import LineaPedido, PedidoDemo

        pedido = PedidoDemo(
            id_pedido="PD-20260101010101-demo0002",
            email_contacto="demo@lore.test",
            canal_compra="autenticado",
            id_usuario="usr-123",
            lineas=(
                LineaPedido(
                    id_producto="prod-1",
                    slug_producto="melisa-a-granel-50g",
                    nombre_producto="Melisa a granel 50g",
                    cantidad=2,
                    precio_unitario_demo=Decimal("5.00"),
                ),
                LineaPedido(
                    id_producto="prod-2",
                    slug_producto="lavanda-a-granel-50g",
                    nombre_producto="Lavanda a granel 50g",
                    cantidad=1,
                    precio_unitario_demo=Decimal("7.00"),
                ),
            ),
        )

        self.repo_pedidos_demo.guardar(pedido)
        recuperado = self.repo_pedidos_demo.obtener_por_id("PD-20260101010101-demo0002")

        self.assertIsNotNone(recuperado)
        assert recuperado is not None
        self.assertEqual(len(recuperado.lineas), 2)
        self.assertEqual(recuperado.subtotal_demo, Decimal("17.00"))
        self.assertEqual(recuperado.canal_compra, "autenticado")
        self.assertEqual(recuperado.id_usuario, "usr-123")

    def test_pedidos_demo_actualizar_estado(self) -> None:
        from backend.nucleo_herbal.dominio.pedidos_demo import LineaPedido, PedidoDemo

        pedido = PedidoDemo(
            id_pedido="PD-20260101010101-demo0003",
            email_contacto="demo@lore.test",
            canal_compra="invitado",
            lineas=(
                LineaPedido(
                    id_producto="prod-1",
                    slug_producto="melisa-a-granel-50g",
                    nombre_producto="Melisa a granel 50g",
                    cantidad=1,
                    precio_unitario_demo=Decimal("5.00"),
                ),
            ),
        )

        self.repo_pedidos_demo.guardar(pedido)
        actualizado = self.repo_pedidos_demo.actualizar_estado(
            "PD-20260101010101-demo0003", "confirmado"
        )

        self.assertIsNotNone(actualizado)
        assert actualizado is not None
        self.assertEqual(actualizado.estado, "confirmado")

    def test_pedidos_demo_estado_inconsistente_lanza_error_dominio(self) -> None:
        from backend.nucleo_herbal.dominio.excepciones import ErrorDominio

        self.PedidoDemoModelo.objects.create(
            id_pedido="PD-inconsistente",
            email_contacto="demo@lore.test",
            canal_compra="invitado",
            estado="estado-invalido",
            fecha_creacion=datetime(2026, 1, 1, tzinfo=UTC),
        )
        self.LineaPedidoModelo.objects.create(
            pedido_id="PD-inconsistente",
            id_producto="prod-1",
            slug_producto="melisa-a-granel-50g",
            nombre_producto="Melisa a granel 50g",
            cantidad=1,
            precio_unitario_demo=Decimal("5.00"),
        )

        with self.assertRaises(ErrorDominio):
            self.repo_pedidos_demo.obtener_por_id("PD-inconsistente")


    def test_cuentas_demo_guardar_y_buscar_por_id_y_email(self) -> None:
        from backend.nucleo_herbal.dominio.cuentas_demo import CuentaDemo, CredencialCuentaDemo, PerfilCuentaDemo

        cuenta = CuentaDemo(
            id_usuario="USR-123",
            email="Lore@Test.Dev",
            perfil=PerfilCuentaDemo(nombre_visible="Lore"),
            credencial=CredencialCuentaDemo(clave_acceso_demo="clave-demo"),
        )

        self.repo_cuentas_demo.guardar(cuenta)
        por_id = self.repo_cuentas_demo.obtener_por_id_usuario("USR-123")
        por_email = self.repo_cuentas_demo.obtener_por_email("lore@test.dev")

        self.assertIsNotNone(por_id)
        self.assertIsNotNone(por_email)
        assert por_id is not None
        assert por_email is not None
        self.assertEqual(por_id.perfil.nombre_visible, "Lore")
        self.assertEqual(por_email.id_usuario, "USR-123")

    def test_cuentas_demo_actualiza_datos_minimos(self) -> None:
        from backend.nucleo_herbal.dominio.cuentas_demo import CuentaDemo, CredencialCuentaDemo, PerfilCuentaDemo

        original = CuentaDemo(
            id_usuario="USR-123",
            email="lore@test.dev",
            perfil=PerfilCuentaDemo(nombre_visible="Lore"),
            credencial=CredencialCuentaDemo(clave_acceso_demo="clave-demo"),
        )
        actualizado = CuentaDemo(
            id_usuario="USR-123",
            email="lore@test.dev",
            perfil=PerfilCuentaDemo(nombre_visible="Lore Bruja"),
            credencial=CredencialCuentaDemo(clave_acceso_demo="clave-nueva"),
        )

        self.repo_cuentas_demo.guardar(original)
        self.repo_cuentas_demo.guardar(actualizado)

        recuperado = self.repo_cuentas_demo.obtener_por_id_usuario("USR-123")

        self.assertIsNotNone(recuperado)
        assert recuperado is not None
        self.assertEqual(recuperado.perfil.nombre_visible, "Lore Bruja")
        self.assertTrue(recuperado.validar_credencial_demo("clave-nueva"))

    def test_proveedor_historial_por_vinculo_devuelve_vacio(self) -> None:
        pedidos = self.proveedor_historial_cuentas.listar_por_vinculo_cuenta(
            id_usuario="USR-falta",
            email_contacto="falta@test.dev",
        )

        self.assertEqual(pedidos, ())

    def test_proveedor_historial_por_vinculo_combina_id_usuario_y_email(self) -> None:
        from backend.nucleo_herbal.dominio.pedidos_demo import LineaPedido, PedidoDemo

        self.repo_pedidos_demo.guardar(
            PedidoDemo(
                id_pedido="PD-H1",
                email_contacto="otro@test.dev",
                canal_compra="autenticado",
                id_usuario="USR-123",
                lineas=(
                    LineaPedido(
                        id_producto="prod-1",
                        slug_producto="melisa-a-granel-50g",
                        nombre_producto="Melisa",
                        cantidad=1,
                        precio_unitario_demo=Decimal("5.00"),
                    ),
                ),
            )
        )
        self.repo_pedidos_demo.guardar(
            PedidoDemo(
                id_pedido="PD-H2",
                email_contacto="lore@test.dev",
                canal_compra="invitado",
                lineas=(
                    LineaPedido(
                        id_producto="prod-1",
                        slug_producto="melisa-a-granel-50g",
                        nombre_producto="Melisa",
                        cantidad=2,
                        precio_unitario_demo=Decimal("5.00"),
                    ),
                ),
            )
        )
        self.repo_pedidos_demo.guardar(
            PedidoDemo(
                id_pedido="PD-H3",
                email_contacto="x@test.dev",
                canal_compra="autenticado",
                id_usuario="USR-otro",
                lineas=(
                    LineaPedido(
                        id_producto="prod-1",
                        slug_producto="melisa-a-granel-50g",
                        nombre_producto="Melisa",
                        cantidad=1,
                        precio_unitario_demo=Decimal("5.00"),
                    ),
                ),
            )
        )

        pedidos = self.proveedor_historial_cuentas.listar_por_vinculo_cuenta(
            id_usuario="USR-123",
            email_contacto="lore@test.dev",
        )

        self.assertEqual({pedido.id_pedido for pedido in pedidos}, {"PD-H1", "PD-H2"})


if __name__ == "__main__":
    unittest.main()
