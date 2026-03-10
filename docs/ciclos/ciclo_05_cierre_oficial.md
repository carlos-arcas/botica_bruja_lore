# Ciclo 05 — Cierre oficial

## 1. Decisión
El **Ciclo 5 (calendario ritual y capa editorial diferencial)** queda **oficialmente DONE**.

## 2. Base de la decisión
La declaración se sustenta en la trazabilidad consolidada en `docs/90_estado_implementacion.md` (secciones 32–35), con prompts 1–3 cubiertos y evidencia de no-regresión del recorrido ecommerce demo y cuenta demo de ciclos anteriores.

## 3. Evidencia mínima reproducible
1. `python manage.py test tests.nucleo_herbal.test_entidades_calendario_ritual tests.nucleo_herbal.test_casos_de_uso_calendario_ritual tests.nucleo_herbal.test_exposicion_publica`
2. `npm --prefix frontend run test:calendario-ritual`
3. `python scripts/check_release_gate.py`

## 4. Alcance congelado de cierre
Queda congelado como referencia histórica y de no-regresión:
- entidad `ReglaCalendario` separada de `Ritual` con reglas temporales verificables,
- consulta pública por fecha de calendario ritual,
- superficie frontend editorial mínima y navegable en `/calendario-ritual`,
- refuerzo del gate canónico con prueba específica de calendario ritual.

## 5. Regla de continuidad
A partir de este cierre, el siguiente paso permitido es la apertura controlada del **Ciclo 6**, sin reabrir funcionalidades de Ciclo 5 salvo correcciones de defecto.
