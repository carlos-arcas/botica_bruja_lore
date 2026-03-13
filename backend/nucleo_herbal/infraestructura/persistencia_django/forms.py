"""Forms de backoffice para importación masiva."""

from django import forms

from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.esquemas import ESQUEMAS_IMPORTACION
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.servicio import (
    MODO_SOLO_CREAR,
    MODO_SOLO_VALIDAR,
    MODO_UPSERT,
)




class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True


class ImportacionMasivaForm(forms.Form):
    entidad = forms.ChoiceField(
        required=False,
        choices=[("", "Auto-detectar")] + [(k, k.replace("_", " ").title()) for k in ESQUEMAS_IMPORTACION],
    )
    modo = forms.ChoiceField(
        choices=(
            (MODO_SOLO_VALIDAR, "Solo validar"),
            (MODO_SOLO_CREAR, "Solo crear"),
            (MODO_UPSERT, "Crear o actualizar"),
        ),
        initial=MODO_SOLO_VALIDAR,
    )
    archivo = forms.FileField(help_text="Sube CSV o XLSX")
    imagenes = forms.FileField(
        required=False,
        widget=MultipleFileInput(),
    )
