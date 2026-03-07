# 08 — Decisiones técnicas no negociables

## 1. Propósito del documento
Este documento establece el contrato técnico firme de **La Botica de la Bruja Lore**. Su función es gobernar decisiones de arquitectura, implementación, revisión técnica y cierre de ciclos sin ambigüedades.

Su contenido **prevalece sobre improvisaciones tácticas** y debe usarse como base literal para `AGENTS.md`, prompts de implementación, revisiones de código y criterios de aceptación por ciclo.

## 2. Principios de ingeniería no negociables
- Se aplica **Clean Architecture estricta** en todo el sistema.
- Se mantiene separación real de responsabilidades entre dominio, aplicación, infraestructura y presentación.
- El proyecto avanza por ciclos, pero los principios estructurales no se relajan por urgencia de entrega.
- El enfoque es **portfolio-first, business-ready**: calidad técnica demostrable hoy y evolución viable mañana.
- Se distingue explícitamente entre **definido** e **implementado**: documentar o diseñar no equivale a entregar capacidad operativa.
- Se priorizan mantenibilidad, escalabilidad y coherencia de dominio por encima de atajos.

## 3. Reglas de arquitectura
- Stack congelado:
  - Backend: **Django**.
  - Frontend: **Next.js**.
  - Base de datos real objetivo: **PostgreSQL**.
  - SQLite: solo apoyo local.
- **PostgreSQL-first desde el inicio**: modelo de datos, consultas, restricciones e índices se diseñan para PostgreSQL.
- Está prohibido diseñar el sistema desde limitaciones de SQLite.
- El dominio no depende de framework, ORM, HTTP ni UI.
- Se conserva la separación entre plano editorial/conocimiento y plano comercial/compra.
- La separación entre `Planta` y `Producto` está congelada y no se negocia.
- `Ritual` y `ReglaCalendario` mantienen su separación semántica y técnica.
- Ninguna feature nueva puede implementarse sin declarar su ubicación de capa y sus límites.

## 4. Reglas de calidad de código
- Tamaño objetivo por archivo: **<300 LOC**.
- Tamaño objetivo por función: **<40 LOC**.
- Complejidad ciclomática máxima objetivo: **<=10**.
- Responsabilidad única obligatoria por módulo y función.
- Duplicación prohibida: se refactoriza antes de consolidar deuda.
- Nombres en español técnico coherente con el dominio.
- Validación fuerte de entradas en todos los bordes del sistema.
- Logging estructurado cuando aplique al flujo funcional u operativo.
- La documentación técnica se mantiene viva y alineada con el estado real.
- En conflicto entre velocidad y calidad estructural, prevalece la calidad estructural.

## 5. Reglas de testing y criterio de DONE
- Toda implementación de código exige tests obligatorios.
- Cobertura mínima en core: **>=85%**.
- Una capacidad no puede marcarse como DONE si no cumple simultáneamente:
  - implementación real,
  - verificación funcional,
  - navegabilidad/demostrabilidad cuando corresponda,
  - respeto de arquitectura,
  - y paso de quality gate cuando aplique.
- “Pensado”, “diseñado” o “documentado” no se considera “implementado”.

## 6. Reglas de quality gate
- El quality gate es **regla no negociable del proyecto** y parte del contrato técnico desde fase documental.
- Su activación operativa completa puede introducirse por ciclos, sin perder carácter obligatorio.
- Ningún cierre de capacidad que requiera validación técnica puede declararse completo sin pasar los controles de calidad definidos para su fase.
- El quality gate se usa para evitar deriva técnica, no como formalidad opcional.

## 7. Reglas de persistencia y entornos
- PostgreSQL es la referencia de diseño para persistencia, rendimiento e integridad.
- SQLite se limita a soporte local, pruebas rápidas o demos internas sin paridad completa.
- Está prohibido justificar decisiones estructurales por conveniencia local de SQLite.
- Las decisiones de datos deben sostener evolución a escenarios business-ready sin rediseño de capas.

## 8. Reglas de documentación e i18n
- La documentación de arquitectura, alcance y dominio debe mantenerse consistente entre ciclos.
- Toda decisión nueva debe indicar si está definida, planificada, en progreso, done, bloqueada o descartada.
- i18n debe quedar preparada para cambio dinámico real.
- Se prohíbe hardcodear decisiones de texto, rutas o modelo que bloqueen i18n futura.
- En Django i18n se trabaja sobre `*.po`; los compilados no forman parte del flujo documental/técnico versionado.

## 9. Regla obligatoria sobre binarios y artefactos
- Está prohibido crear, modificar o añadir binarios y artefactos compilados en el repositorio.
- Prohibiciones explícitas:
  - `*.mo`
  - `*.pyc`
  - `*.sqlite3`
  - `*.db`
  - imágenes generadas
  - zips
  - pdfs binarios
  - y equivalentes
- Si hicieran falta compilados de i18n para ejecución, se documenta el comando `django-admin compilemessages` sin versionar el resultado.

## 10. Prohibiciones explícitas
- Prohibido romper Clean Architecture por atajos de ciclo.
- Prohibido acoplar dominio a Django, ORM, componentes de UI o detalles de infraestructura.
- Prohibido mezclar semánticas editoriales y comerciales en modelos o casos de uso sin frontera clara.
- Prohibido declarar DONE sobre entregables no implementados o no verificables.
- Prohibido degradar estándares de calidad por presión de calendario.
- Prohibido introducir decisiones que impidan escalado técnico futuro.
- **RepoLock está en desuso y no debe aparecer en este proyecto.**

## 11. Cómo debe usarse este documento en prompts, revisiones y ciclos
- En prompts de implementación, este documento actúa como bloque normativo base y no se resume de forma que pierda fuerza.
- En code reviews, se evalúa cumplimiento explícito de estas reglas junto con arquitectura, calidad y criterio de DONE.
- En planificación por ciclos, define límites técnicos que no pueden negociarse aunque cambie la prioridad funcional.
- En decisiones de conflicto, este documento prevalece sobre preferencias tácticas del momento.
- Cualquier excepción requiere decisión arquitectónica explícita y trazable; sin esa decisión, la excepción se considera incumplimiento.

## 12. Alcance de congelación de decisiones
Quedan congeladas como no negociables durante el avance del proyecto: Clean Architecture estricta, separación de capas, dominio desacoplado de framework, PostgreSQL-first, separación editorial/comercial, distinción `Planta`/`Producto`, criterio de DONE verificable y contrato de quality gate.

La ejecución operativa de algunas prácticas (como la activación completa del quality gate en fases tempranas) puede graduarse por ciclo, pero su estatus de regla del proyecto no se discute ni se rebaja.
