"""Adaptador HTTP para validar Google Identity en backend."""

from __future__ import annotations

import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from django.conf import settings

from ..aplicacion.puertos.verificador_google_identity import (
    IdentidadGoogleVerificada,
    VerificadorGoogleIdentity,
)
from ..dominio.excepciones import ErrorDominio

GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo"
GOOGLE_ISSUERS_VALIDOS = {"accounts.google.com", "https://accounts.google.com"}


class VerificadorGoogleIdentityHttp(VerificadorGoogleIdentity):
    def __init__(self, client_id: str | None = None) -> None:
        self.client_id = (client_id or settings.GOOGLE_CLIENT_ID).strip()

    def verificar(self, *, credential: str) -> IdentidadGoogleVerificada:
        token = credential.strip()
        if not token:
            raise ErrorDominio("La credencial de Google es obligatoria.")
        if not self.client_id:
            raise ErrorDominio("El acceso con Google no está configurado.")

        try:
            with urlopen(f"{GOOGLE_TOKENINFO_URL}?{urlencode({'id_token': token})}", timeout=5) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as exc:
            raise ErrorDominio("No se pudo validar la credencial de Google.") from exc

        aud = str(payload.get("aud", "")).strip()
        iss = str(payload.get("iss", "")).strip()
        if aud != self.client_id:
            raise ErrorDominio("La credencial de Google no pertenece a esta aplicación.")
        if iss and iss not in GOOGLE_ISSUERS_VALIDOS:
            raise ErrorDominio("El emisor de Google no es válido para esta aplicación.")

        email = str(payload.get("email", "")).strip().lower()
        google_sub = str(payload.get("sub", "")).strip()
        nombre_visible = str(payload.get("name", "")).strip()
        email_verificado = str(payload.get("email_verified", "")).strip().lower() == "true"
        if not email or not google_sub:
            raise ErrorDominio("La respuesta de Google no incluye identidad suficiente.")

        return IdentidadGoogleVerificada(
            google_sub=google_sub,
            email=email,
            nombre_visible=nombre_visible,
            email_verificado=email_verificado,
        )
