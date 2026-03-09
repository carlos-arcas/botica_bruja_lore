"""Configuración WSGI para despliegue del backend Django."""

import os

from django.core.wsgi import get_wsgi_application


os.environ["DJANGO_SETTINGS_MODULE"] = "backend.configuracion_django.settings"

application = get_wsgi_application()
