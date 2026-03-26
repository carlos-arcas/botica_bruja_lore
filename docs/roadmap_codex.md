# Roadmap operativo Codex (fuente de ejecución atómica)

## Reglas de uso obligatorias
1. Este archivo gobierna la ejecución autónoma diaria de Codex en este repo.
2. Codex debe seleccionar siempre la **primera tarea `TODO` no `BLOCKED`**.
3. Se ejecuta **una sola tarea por corrida**.
4. Está prohibido cambiar el orden sin justificarlo en `docs/bitacora_codex.md`.
5. No se marca `DONE` sin evidencia verificable y checks registrados.

## Estados permitidos
- `TODO`: pendiente y ejecutable.
- `DONE`: cerrada con evidencia.
- `BLOCKED`: detenida por dependencia o contradicción documentada.

---

## CRX-001 — Bootstrap de gobernanza Codex
- **Estado**: `DONE`
- **Objetivo**: dejar operativo el sistema AGENTS + roadmap + bitácora para ejecución autónoma disciplinada.
- **Alcance permitido**: `AGENTS.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: código de producto, pipelines, modelos, migraciones, frontend/backend funcional.
- **Capas permitidas/prohibidas**: solo gobernanza documental; prohibido tocar dominio/aplicación/infraestructura/presentación del producto.
- **Archivos o zonas probables**: rutas anteriores y referencias a `docs/99_fuente_de_verdad.md`, `docs/08_decisiones_tecnicas_no_negociables.md`, `docs/90_estado_implementacion.md`.
- **Checks obligatorios**:
  - existencia de archivos de gobernanza,
  - referencias a rutas reales,
  - consistencia de estados en roadmap,
  - diff dentro del perímetro permitido.
- **Criterio de cierre**: sistema operativo de gobernanza creado y trazado en bitácora.
- **Bloqueo conocido**: ninguno.

## CRX-002 — Matriz de trazabilidad roadmap Codex ↔ fuentes base
- **Estado**: `TODO`
- **Objetivo**: añadir en `docs/roadmap_codex.md` una matriz breve que vincule cada tarea activa con su documento rector (`99`, `08`, `90`, roadmaps de ciclo/V2).
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: cambios de estado ficticios en `docs/90_estado_implementacion.md`; cambios de código.
- **Capas permitidas/prohibidas**: solo gobernanza documental.
- **Archivos o zonas probables**: sección nueva “Trazabilidad documental por tarea” en este roadmap.
- **Checks obligatorios**:
  - todas las tareas `TODO` con fuente rectora explícita,
  - rutas citadas existentes,
  - sin contradicción con precedencia de `docs/99_fuente_de_verdad.md`.
- **Criterio de cierre**: matriz creada y validada, con registro en bitácora.
- **Bloqueo conocido**: ninguno.

## CRX-003 — Política de bloqueo y desbloqueo operativo
- **Estado**: `TODO`
- **Objetivo**: endurecer el protocolo `BLOCKED` en roadmap + bitácora (campos mínimos, SLA de revisión, acción exacta siguiente).
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, `AGENTS.md`.
- **Fuera de alcance**: crear tooling nuevo, modificar gates de código.
- **Capas permitidas/prohibidas**: solo gobernanza documental.
- **Archivos o zonas probables**: secciones de reglas operativas y plantilla de entrada de bloqueo.
- **Checks obligatorios**:
  - definición explícita de diagnóstico/causa/evidencia/siguiente paso,
  - consistencia entre AGENTS y bitácora.
- **Criterio de cierre**: protocolo único de bloqueo documentado y aplicado al menos en un ejemplo de plantilla.
- **Bloqueo conocido**: ninguno.

## CRX-004 — Resolución de tensiones documentales prioritarias
- **Estado**: `TODO`
- **Objetivo**: identificar y documentar contradicciones de alto impacto entre estado real (`docs/90`) y planes (`docs/14`, `docs/roadmap_*`) sin declarar cierres no implementados.
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md` y, solo si es imprescindible, nota puntual en un doc de roadmap existente.
- **Fuera de alcance**: reescritura masiva de documentos históricos.
- **Capas permitidas/prohibidas**: solo gobernanza documental.
- **Archivos o zonas probables**: secciones de “conflictos abiertos” y “decisión aplicada por precedencia”.
- **Checks obligatorios**:
  - cada tensión con evidencia textual concreta,
  - decisión trazada a regla de precedencia de `docs/99_fuente_de_verdad.md`.
- **Criterio de cierre**: lista priorizada de tensiones y acción exacta para cada una.
- **Bloqueo conocido**: posible necesidad de decisión humana en conflictos de producto no resolubles por precedencia automática.

## CRX-005 — Checklist mínimo de cierre por ejecución Codex
- **Estado**: `TODO`
- **Objetivo**: estandarizar checklist final reutilizable para ejecuciones (selección de tarea, evidencia, checks, actualización de bitácora/roadmap).
- **Alcance permitido**: `AGENTS.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: cambios de CI o scripts.
- **Capas permitidas/prohibidas**: solo gobernanza documental.
- **Archivos o zonas probables**: sección “checklist de salida” en AGENTS o bitácora.
- **Checks obligatorios**:
  - checklist sin ambigüedades,
  - alineado con criterios DONE del repo.
- **Criterio de cierre**: checklist operativo añadido y usado en una entrada real de bitácora.
- **Bloqueo conocido**: ninguno.
