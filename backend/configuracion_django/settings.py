"""Settings mínimos para habilitar persistencia del núcleo herbal."""

SECRET_KEY = "botica-demo-dev"
DEBUG = True

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "backend.nucleo_herbal.infraestructura.persistencia_django",
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
