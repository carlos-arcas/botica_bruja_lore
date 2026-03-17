from django.urls import path

from .views import limpiar_logs_view, obtener_logs

urlpatterns = [
    path("logs", obtener_logs, name="debug-obtener-logs"),
    path("logs/clear", limpiar_logs_view, name="debug-limpiar-logs"),
]
