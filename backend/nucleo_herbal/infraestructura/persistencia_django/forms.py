"""Forms de backoffice para importación masiva."""

from django import forms

from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.esquemas import ESQUEMAS_IMPORTACION
from backend.nucleo_herbal.infraestructura.persistencia_django.importacion.servicio import (
    MODO_SOLO_CREAR,
    MODO_SOLO_VALIDAR,
    MODO_UPSERT,
)

MAX_FILE_SIZE = 10 * 1024 * 1024
VALID_MIME = {
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}


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
    imagenes = forms.FileField(required=False, widget=MultipleFileInput())

    def clean_archivo(self):
        archivo = self.cleaned_data["archivo"]
        nombre = archivo.name.lower()
        if not (nombre.endswith(".csv") or nombre.endswith(".xlsx")):
            raise forms.ValidationError("Archivo no válido: usa CSV o XLSX.")
        if archivo.size > MAX_FILE_SIZE:
            raise forms.ValidationError("Archivo demasiado grande (máximo 10MB).")
        ctype = getattr(archivo, "content_type", "")
        if ctype and ctype not in VALID_MIME:
            raise forms.ValidationError("MIME no soportado para importación.")
        return archivo
