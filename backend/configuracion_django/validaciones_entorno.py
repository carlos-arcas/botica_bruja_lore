from __future__ import annotations

from urllib.parse import urlparse

from django.core.exceptions import ImproperlyConfigured


_BACKENDS_NO_SEGUROS_PROD = {
    "django.core.mail.backends.locmem.EmailBackend",
    "django.core.mail.backends.console.EmailBackend",
    "django.core.mail.backends.filebased.EmailBackend",
}

_PROVEEDORES_PAGO_SOPORTADOS = {"simulado_local", "stripe"}


def _requiere_no_vacio(nombre: str, valor: str) -> None:
    if valor.strip():
        return
    raise ImproperlyConfigured(f"{nombre} es obligatoria cuando DEBUG=false.")


def _requiere_url_https(nombre: str, valor: str) -> None:
    _requiere_no_vacio(nombre, valor)
    parsed = urlparse(valor.strip())
    if parsed.scheme != "https" or not parsed.netloc:
        raise ImproperlyConfigured(f"{nombre} debe ser URL HTTPS absoluta cuando DEBUG=false.")


def validar_configuracion_produccion(*,
    debug: bool,
    public_site_url: str,
    payment_success_url: str,
    payment_cancel_url: str,
    default_from_email: str,
    email_backend: str,
) -> None:
    if debug:
        return

    _requiere_url_https("PUBLIC_SITE_URL", public_site_url)
    _requiere_url_https("PAYMENT_SUCCESS_URL", payment_success_url)
    _requiere_url_https("PAYMENT_CANCEL_URL", payment_cancel_url)
    _requiere_no_vacio("DEFAULT_FROM_EMAIL", default_from_email)

    if default_from_email.endswith(".local"):
        raise ImproperlyConfigured("DEFAULT_FROM_EMAIL no puede usar dominio .local cuando DEBUG=false.")

    if email_backend in _BACKENDS_NO_SEGUROS_PROD:
        raise ImproperlyConfigured(
            "EMAIL_BACKEND de desarrollo no permitida cuando DEBUG=false. Configura backend SMTP real."
        )


def validar_configuracion_pago(*,
    proveedor_pago: str,
    stripe_public_key: str,
    stripe_secret_key: str,
    stripe_webhook_secret: str,
    payment_success_url: str,
    payment_cancel_url: str,
) -> None:
    proveedor = proveedor_pago.strip().lower()
    if proveedor not in _PROVEEDORES_PAGO_SOPORTADOS:
        raise ImproperlyConfigured(
            "BOTICA_PAYMENT_PROVIDER debe ser simulado_local o stripe."
        )
    if proveedor != "stripe":
        return

    for nombre, valor in (
        ("STRIPE_PUBLIC_KEY", stripe_public_key),
        ("STRIPE_SECRET_KEY", stripe_secret_key),
        ("STRIPE_WEBHOOK_SECRET", stripe_webhook_secret),
        ("PAYMENT_SUCCESS_URL", payment_success_url),
        ("PAYMENT_CANCEL_URL", payment_cancel_url),
    ):
        if not valor.strip():
            raise ImproperlyConfigured(
                f"{nombre} es obligatoria cuando BOTICA_PAYMENT_PROVIDER=stripe."
            )
