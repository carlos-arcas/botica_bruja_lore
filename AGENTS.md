# AGENTS.md — Sistema operativo de gobernanza Codex para `botica_bruja_lore`

## 1) Propósito
Este archivo define reglas **permanentes, duras y ejecutables** para trabajo autónomo con Codex/automations en este repositorio.

No sustituye `docs/`; operacionaliza su uso diario.

## 2) Fase y rol por defecto del agente
- Fase del proyecto: **demo sólida y creíble** (sin compra real activa como premisa estratégica de fase).
- Rol por defecto del agente:
  - arquitecto documental,
  - generador de prompts,
  - detector de inconsistencias.
- Regla: no implementar ni modificar repositorio sin petición explícita.

## 3) Fuente de verdad y precedencia documental (obligatoria)
La fuente de verdad está en `docs/`, con precedencia operativa:
1. `docs/90_estado_implementacion.md` (estado real implementado).
2. `docs/08_decisiones_tecnicas_no_negociables.md` (norma técnica obligatoria).
3. `docs/05_modelo_de_dominio_y_entidades.md` (verdad de dominio).
4. `docs/07_arquitectura_tecnica.md` (verdad de arquitectura/stack).
5. `docs/02_alcance_y_fases.md` (secuencia y estados por ciclo).
6. `docs/00_vision_proyecto.md` (dirección estratégica/identidad).
7. `AGENTS.md` (contrato operativo diario, subordinado a `docs/`).

Si hay conflicto, prevalece el documento de mayor precedencia para ese ámbito.

## 4) Lectura obligatoria antes de actuar
Antes de proponer o ejecutar cualquier cambio, leer como mínimo:
1. `docs/00_vision_proyecto.md`
2. `docs/02_alcance_y_fases.md`
3. `docs/05_modelo_de_dominio_y_entidades.md`
4. `docs/07_arquitectura_tecnica.md`
5. `docs/08_decisiones_tecnicas_no_negociables.md`
6. `docs/90_estado_implementacion.md`
7. `docs/99_fuente_de_verdad.md`
8. este `AGENTS.md`

Sin esta lectura, la ejecución se considera fuera de norma.

## 5) Sistema operativo obligatorio por roadmap Codex
Toda ejecución autónoma debe gobernarse por `docs/roadmap_codex.md` y `docs/bitacora_codex.md`.

### 5.1 Regla de selección de trabajo
1. Elegir **siempre** la primera tarea en estado `TODO` que **no** esté `BLOCKED` en `docs/roadmap_codex.md`.
2. Ejecutar **una sola tarea por ejecución**.
3. Prohibido cambiar el orden del roadmap sin registrar justificación explícita en `docs/bitacora_codex.md`.
4. Prohibido marcar `DONE` sin evidencia verificable de cierre.

### 5.2 Regla de alcance
- No ampliar alcance respecto al objetivo de la tarea seleccionada.
- Hacer cambios mínimos, atómicos y de alta confianza.
- No mezclar refactors globales ni frentes no pedidos.

### 5.3 Regla de bloqueo (sin improvisación)
Si una tarea queda bloqueada:
1. Marcarla como `BLOCKED` en roadmap.
2. Registrar en bitácora:
   - diagnóstico concreto,
   - causa probable,
   - evidencia,
   - siguiente acción exacta para desbloquear.
3. No improvisar soluciones fuera del alcance aprobado.

## 6) Reglas de ingeniería no negociables
- Clean Architecture estricta.
- Separación real de capas: dominio, aplicación, infraestructura, presentación.
- Dominio desacoplado de framework.
- SRP, baja complejidad y sin duplicación.
- Objetivos de tamaño: archivo <300 LOC, función <40 LOC, complejidad ciclomática <=10.
- Validación de entradas obligatoria.
- Manejo explícito de errores.
- Logging estructurado cuando aplique.
- Prohibido `print()` como mecanismo operativo.
- Tests obligatorios en tareas de implementación.
- Cobertura core objetivo >=85%.
- Quality gate obligatorio (activación graduable por ciclo; carácter normativo no negociable).
- i18n preparada para cambio dinámico real.

## 7) Stack y límites técnicos congelados
- Backend: Django.
- Frontend: Next.js.
- Persistencia objetivo real: PostgreSQL.
- SQLite solo apoyo local.
- Enfoque PostgreSQL-first desde diseño.
- Backoffice v1: Django Admin customizado.

## 8) Identidad de producto y alcance de negocio
**La Botica de la Bruja Lore**: ecommerce editorial de hierbas a granel, sabiduría herbal tradicional, rituales, sinergias, herramientas esotéricas y packs/regalos.

Directrices obligatorias:
- enfoque portfolio-first, business-ready,
- progresión natural → místico,
- utilidad comercial + contexto editorial,
- prohibidos medical claims, promesas milagrosas y afirmaciones sanitarias impropias.

## 9) Anclas de dominio que no se rompen
- `Planta` y `Producto` son entidades separadas.
- Separación estricta plano editorial/conocimiento vs plano comercial/compra.
- `ReglaCalendario` separada de `Ritual`.
- Toda capacidad nueva declara explícitamente fronteras de capa y dominio.

## 10) Criterio de DONE y checks obligatorios por tarea
No se cierra en `DONE` sin evidencia verificable de:
1. implementación real (si aplica),
2. validación funcional,
3. respeto de arquitectura y decisiones congeladas,
4. tests/checks obligatorios ejecutados,
5. quality gate aplicable aprobado.

Como mínimo en cada ejecución:
- verificar archivos tocados y rutas referenciadas,
- validar que no se rompe precedencia documental,
- validar consistencia de estados en roadmap/bitácora,
- registrar comandos/checks ejecutados con resultado.

## 11) Actualización documental obligatoria al cerrar ejecución
Al finalizar cualquier ejecución, actualizar:
1. `docs/roadmap_codex.md` (estado de la tarea y evidencia de cierre/bloqueo).
2. `docs/bitacora_codex.md` (entrada trazable completa de ejecución).

Sin estas actualizaciones, la ejecución está incompleta.

## 12) Reglas de trabajo por ciclos
- Trabajar por ciclos con capacidades cerradas, navegables, coherentes y demostrables.
- Estados válidos por ítem: `definido`, `planificado`, `en progreso`, `done`, `bloqueado`, `descartado` (o equivalentes operativos explícitos).
- No presentar lo planificado como implementado.
- No mezclar demasiados objetivos en una sola entrega.

## 13) Reglas para prompts generados por Codex
Cada prompt debe:
- preservar acuerdos de `docs/`,
- ser atómico y entregado de uno en uno,
- incluir: contexto, objetivo, restricciones, implementación esperada, tests (si aplica), quality gate (si aplica), criterios de aceptación,
- evitar refactors masivos no pedidos,
- evitar degradaciones de arquitectura/calidad por atajo.

## 14) Prohibiciones explícitas
- Prohibido añadir/modificar binarios o artefactos compilados.
- Prohibido tocar/versionar: `*.mo`, `*.pyc`, `*.sqlite3`, `*.db`, imágenes generadas, zips, pdfs binarios y equivalentes.
- En i18n Django trabajar en `*.po`; si hace falta compilación, documentar `django-admin compilemessages` sin versionar compilados.
- Prohibido usar RepoLock.
- Prohibido declarar DONE por documentación si no hay implementación/validación exigible para la tarea.

## 15) Salida esperada del agente
Respuestas compactas, accionables y trazables a fuente de verdad, incluyendo:
- tarea ejecutada,
- archivos tocados,
- decisiones,
- checks con resultado,
- estado final (`DONE` o `BLOCKED`) y siguiente paso exacto.
