"""Settings mínimos para backend Django ejecutable en desarrollo local."""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]
LOCAL_VAR_DIR = BASE_DIR / "var"
LOCAL_VAR_DIR.mkdir(exist_ok=True)

SECRET_KEY = "botica-demo-dev"
DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "testserver"]
ROOT_URLCONF = "backend.configuracion_django.urls"

INSTALLED_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "backend.nucleo_herbal.infraestructura.persistencia_django",
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": LOCAL_VAR_DIR / "dev.sqlite3",
    }
}

USE_TZ = True
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
