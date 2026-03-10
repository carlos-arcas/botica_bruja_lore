# Ciclo 04 — Cierre oficial

## 1. Decisión
El **Ciclo 4 (cuenta de usuario con valor)** queda **oficialmente DONE**.

## 2. Base de la decisión
La declaración se sustenta en la trazabilidad consolidada en `docs/90_estado_implementacion.md` (secciones 27–31), con prompts 1–4 cubiertos y evidencia de no-regresión del flujo ecommerce demo de Ciclo 3.

## 3. Evidencia mínima reproducible
1. `python manage.py test tests.nucleo_herbal.test_api_cuentas_demo tests.nucleo_herbal.test_casos_de_uso_cuentas_demo tests.nucleo_herbal.infraestructura.test_admin_django`
2. `npm --prefix frontend run test:cuenta-demo`
3. `python scripts/check_release_gate.py`

## 4. Alcance congelado de cierre
Queda congelado como referencia histórica y de no-regresión:
- registro/autenticación demo sin auth productiva real,
- perfil mínimo de cuenta demo,
- historial de `PedidoDemo` asociado a cuenta,
- área de cuenta demo navegable en frontend,
- soporte admin mínimo de operación de cuenta demo.

## 5. Regla de continuidad
A partir de este cierre, el siguiente paso permitido es la apertura controlada del **Ciclo 5**, sin reabrir funcionalidades de Ciclo 4 salvo correcciones de defecto.
