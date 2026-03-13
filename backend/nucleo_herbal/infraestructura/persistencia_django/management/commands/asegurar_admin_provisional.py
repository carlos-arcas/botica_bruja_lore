import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction


class Command(BaseCommand):
    help = "Crea o ajusta un superusuario provisional usando variables de entorno."

    @transaction.atomic
    def handle(self, *args, **options):
        username = self._leer_variable("ADMIN_USUARIO_PROVISIONAL")
        password = self._leer_variable("ADMIN_PASSWORD_PROVISIONAL")

        UserModel = get_user_model()
        usuario, creado = UserModel.objects.get_or_create(username=username)
        usuario.is_staff = True
        usuario.is_superuser = True
        usuario.is_active = True
        usuario.set_password(password)
        usuario.save(
            update_fields=["is_staff", "is_superuser", "is_active", "password"]
        )

        if creado:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Usuario admin provisional '{username}' creado y asegurado con privilegios."
                )
            )
            return

        self.stdout.write(
            self.style.SUCCESS(
                f"Usuario admin provisional '{username}' actualizado y asegurado con privilegios."
            )
        )

    def _leer_variable(self, nombre: str) -> str:
        valor = os.getenv(nombre, "")
        limpio = valor.strip()
        if limpio:
            return limpio
        raise CommandError(f"Falta {nombre} o está vacía. Configura la variable y reintenta.")
