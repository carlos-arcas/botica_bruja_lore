"""Settings base para backend Django con soporte local y despliegue en Railway."""

import importlib.util
import os
from pathlib import Path
from urllib.parse import unquote, urlparse

from django.core.exceptions import ImproperlyConfigured


BASE_DIR = Path(__file__).resolve().parents[2]
LOCAL_VAR_DIR = BASE_DIR / "var"
LOCAL_VAR_DIR.mkdir(exist_ok=True)


def _leer_booleano(nombre: str, valor_por_defecto: bool = False) -> bool:
    valor = os.getenv(nombre)
    if valor is None:
        return valor_por_defecto
    return valor.strip().lower() in {"1", "true", "t", "yes", "y", "on"}


def _leer_lista(nombre: str, valor_por_defecto: list[str]) -> list[str]:
    valor = os.getenv(nombre)
    if not valor:
        return valor_por_defecto
    return [item.strip() for item in valor.split(",") if item.strip()]


def _agregar_sin_duplicados(destino: list[str], valores: list[str]) -> list[str]:
    existentes = {item for item in destino}
    for valor in valores:
        limpio = valor.strip()
        if limpio and limpio not in existentes:
            destino.append(limpio)
            existentes.add(limpio)
    return destino


def _configuracion_db_desde_url(database_url: str) -> dict[str, str | int]:
    parsed = urlparse(database_url)
    esquema = parsed.scheme

    if esquema in {"postgres", "postgresql", "postgresql+psycopg", "postgresql+psycopg2"}:
        return {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": parsed.path.lstrip("/"),
            "USER": unquote(parsed.username or ""),
            "PASSWORD": unquote(parsed.password or ""),
            "HOST": parsed.hostname or "",
            "PORT": str(parsed.port or 5432),
            "CONN_MAX_AGE": 600,
            "OPTIONS": {"sslmode": "require"},
        }

    if esquema == "sqlite":
        ruta_sqlite = parsed.path or str(LOCAL_VAR_DIR / "dev.sqlite3")
        return {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": ruta_sqlite,
        }

    raise ValueError(f"DATABASE_URL no soportada: {esquema}")


def _configuracion_base_de_datos() -> dict[str, dict[str, str | int]]:
    database_url = os.getenv("DATABASE_URL")
    if not database_url and _en_entorno_railway():
        raise ImproperlyConfigured("DATABASE_URL es obligatoria en Railway/producción.")
    if database_url:
        return {"default": _configuracion_db_desde_url(database_url)}
    return {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": LOCAL_VAR_DIR / "dev.sqlite3",
        }
    }


def _en_entorno_railway() -> bool:
    return any(
        os.getenv(variable)
        for variable in (
            "RAILWAY_PUBLIC_DOMAIN",
            "RAILWAY_ENVIRONMENT_ID",
            "RAILWAY_PROJECT_ID",
        )
    )


DEBUG = _leer_booleano("DEBUG", os.getenv("DATABASE_URL") is None)


def _configurar_secret_key() -> str:
    secret_key = os.getenv("SECRET_KEY")
    if secret_key:
        return secret_key
    if _en_entorno_railway() or not DEBUG:
        raise ImproperlyConfigured(
            "SECRET_KEY es obligatoria cuando DEBUG=false o en Railway/producción."
        )
    return "botica-demo-dev"


SECRET_KEY = _configurar_secret_key()

ALLOWED_HOSTS = _leer_lista("ALLOWED_HOSTS", ["localhost", "127.0.0.1", "testserver"])

railway_public_domain = os.getenv("RAILWAY_PUBLIC_DOMAIN", "")
railway_private_domain = os.getenv("RAILWAY_PRIVATE_DOMAIN", "")

_agregar_sin_duplicados(
    ALLOWED_HOSTS,
    [
        railway_public_domain,
        railway_private_domain,
        ".up.railway.app",
        ".railway.internal",
        "localhost",
        "127.0.0.1",
        "testserver",
    ],
)

CSRF_TRUSTED_ORIGINS = _leer_lista("CSRF_TRUSTED_ORIGINS", [])
if railway_public_domain:
    _agregar_sin_duplicados(
        CSRF_TRUSTED_ORIGINS,
        [f"https://{railway_public_domain}", f"http://{railway_public_domain}"],
    )

ROOT_URLCONF = "backend.configuracion_django.urls"
WSGI_APPLICATION = "backend.configuracion_django.wsgi.application"

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "backend.nucleo_herbal.infraestructura.persistencia_django",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

if importlib.util.find_spec("whitenoise"):
    MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

DATABASES = _configuracion_base_de_datos()

LANGUAGE_CODE = "es-es"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "var" / "staticfiles"
STATIC_ROOT.mkdir(parents=True, exist_ok=True)

if importlib.util.find_spec("whitenoise"):
    STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
USE_X_FORWARDED_HOST = True

PUBLIC_SITE_URL = os.getenv("PUBLIC_SITE_URL", "").strip().rstrip("/")

if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_REFERRER_POLICY = "same-origin"
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
