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

### Contrato operativo del estado `BLOCKED`
Una tarea puede pasar a `BLOCKED` solo cuando no puede cerrarse con seguridad sin salir del alcance aprobado.

Condiciones mínimas obligatorias para marcar `BLOCKED`:
1. Existe impedimento verificable (dependencia, contradicción documental o restricción externa concreta).
2. La entrada correspondiente en `docs/bitacora_codex.md` queda registrada con plantilla `BLOCKED` completa.
3. Se define una única siguiente acción exacta y verificable (no genérica).
4. Se fija criterio explícito de desbloqueo y fecha/punto de revisión.

Uso prohibido:
- Marcar `BLOCKED` por incertidumbre vaga o falta de análisis.
- Marcar `BLOCKED` sin evidencia verificable y sin dependencia identificada.

---

## Matriz de trazabilidad documental por tarea

| Tarea | Título corto | Documento rector principal | Documentos secundarios de apoyo | Ámbito gobernado | Motivo de asignación | Nota operativa |
|---|---|---|---|---|---|---|
| `CRX-001` | Bootstrap gobernanza | `AGENTS.md` | `docs/99_fuente_de_verdad.md`, `docs/08_decisiones_tecnicas_no_negociables.md`, `docs/90_estado_implementacion.md` | marco operativo diario, definición de DONE documental, límites de ejecución | La tarea crea el sistema operativo de Codex; el contrato directo de ejecución está en `AGENTS.md` y debe alinearse con precedencia/estado real. | Cierre válido solo con evidencia verificable en roadmap + bitácora. |
| `CRX-002` | Matriz de trazabilidad | `docs/99_fuente_de_verdad.md` | `docs/90_estado_implementacion.md`, `docs/08_decisiones_tecnicas_no_negociables.md`, `docs/14_roadmap.md`, `docs/roadmap_cierre_ecommerce_real_incremental.md`, `docs/roadmap_ecommerce_real_v2.md` | precedencia documental por tarea y relación plan vs estado | `99` define jerarquía y resolución de conflictos; esta tarea depende de mapear qué documento manda por ámbito y cuándo prevalece estado real. | Si emerge tensión, se registra para `CRX-004` sin resolverla aquí. |
| `CRX-003` | Política `BLOCKED` | `AGENTS.md` | `docs/99_fuente_de_verdad.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md` | protocolo de bloqueo/desbloqueo, campos mínimos, trazabilidad operativa | El protocolo `BLOCKED` está normado explícitamente en `AGENTS.md` (diagnóstico, causa, evidencia, siguiente acción) y debe heredarse en roadmap/bitácora. | No habilita cambios de producto ni de CI; solo gobierno documental. |
| `CRX-004` | Tensiones documentales | `docs/99_fuente_de_verdad.md` | `docs/90_estado_implementacion.md`, `docs/14_roadmap.md`, `docs/roadmap_cierre_ecommerce_real_incremental.md`, `docs/roadmap_ecommerce_real_v2.md`, `docs/ciclos/ciclo_03_reencauce_control.md` | identificación/priorización de contradicciones, decisión por precedencia, preparación de resolución | El mandato de `99` exige resolver por ámbito y especificidad; en conflicto planificado vs implementado prevalece `90`. | Tensión preparada: `docs/14_roadmap.md` fija secuencia macro C1→C6, mientras `docs/90_estado_implementacion.md` declara ciclos/evoluciones posteriores ya implementadas; tratar en `CRX-004`. |
| `CRX-005` | Checklist de cierre | `AGENTS.md` | `docs/08_decisiones_tecnicas_no_negociables.md`, `docs/99_fuente_de_verdad.md`, `docs/90_estado_implementacion.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md` | checklist de salida por ejecución (selección, evidencia, checks, estado final) | `AGENTS.md` fija checks mínimos por corrida y actualización obligatoria de roadmap/bitácora; `08` y `99` acotan calidad y precedencia. | Debe incluir verificación explícita de “definido vs implementado” usando `90`. |
| `CRX-006` | Reencuadre V2-R10 | `docs/roadmap_ecommerce_real_v2.md` | `AGENTS.md`, `docs/90_estado_implementacion.md`, `docs/13_testing_ci_y_quality_gate.md`, `docs/release_readiness_minima.md`, `docs/deploy_railway.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md` | reactivación del roadmap atómico y alineación con el siguiente incremento vivo | `docs/roadmap_codex.md` quedó sin tareas `TODO` mientras `V2-R10` sigue `PLANNED`; antes de implementar hace falta restaurar una fuente de ejecución atómica vigente. | Cierre válido solo si queda una primera `TODO` no `BLOCKED` con perímetro claro y trazado en bitácora. |
| `V2G-001` | Auditoría cierre go-live v2 | `docs/roadmap_ecommerce_real_v2.md` | `docs/release_readiness_minima.md`, `docs/13_testing_ci_y_quality_gate.md`, `docs/deploy_railway.md`, `docs/90_estado_implementacion.md`, `scripts/check_release_gate.py`, `scripts/check_release_readiness.py`, `scripts/check_deployed_stack.py`, `scripts/backup_restore_postgres.py`, `tests/scripts/` | auditoría de cierre y brecha real del incremento `V2-R10` | `V2-R10` está `PLANNED`, pero no desglosado a nivel atómico; primero hay que decidir con evidencia qué parte ya existe y qué falta realmente. | Si el cierre depende de entorno desplegado real, documentar `BLOCKED` con criterio de desbloqueo externo y sin improvisar cambios de producto. |
| `AUT-001` | Gate frontend Windows | `docs/13_testing_ci_y_quality_gate.md` | `scripts/check_release_gate.py`, `scripts/check_seo_contract.py`, `.github/workflows/quality_gate.yml`, `tests/scripts/` | wiring del gate frontend en Windows | La auditoría detectó que el bloque frontend del gate canónico puede quedar en `SKIP` aunque `npm.cmd` exista y el runner Windows sí tenga Node. | Va primero porque hoy el gate puede omitir lint/build/tests frontend y dar una lectura falsa de readiness. |
| `AUT-002` | Contrato del gate canónico | `docs/13_testing_ci_y_quality_gate.md` | `docs/release_readiness_minima.md`, `scripts/check_release_gate.py`, `tests/scripts/`, `docs/90_estado_implementacion.md` | deriva doc↔script en el gate de release | La documentación promete bloques operativos (readiness mínimo, alertas v2, retry dry-run, backup dry-run) que el script canónico no invoca. | Resolver por una sola fuente de verdad: o se implementa la cobertura prometida o se corrige la documentación. |
| `AUT-003` | Smoke real V2-R10 | `docs/release_readiness_minima.md` | `docs/roadmap_ecommerce_real_v2.md`, `docs/deploy_railway.md`, `scripts/check_deployed_stack.py`, `scripts/backup_restore_postgres.py` | cierre externo de go-live sobre entorno desplegado real | El cierre de `V2-R10` sigue dependiendo de URLs reales desplegadas y de un restore drill fuera de este runner. | Mantener `BLOCKED` hasta contar con URLs/credenciales reales y entorno seguro para restore drill. |

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
- **Estado**: `DONE`
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
- **Estado**: `DONE`
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
- **Estado**: `DONE`
- **Objetivo**: identificar y documentar contradicciones de alto impacto entre estado real (`docs/90`) y planes (`docs/14`, `docs/roadmap_*`) sin declarar cierres no implementados.
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md` y, solo si es imprescindible, nota puntual en un doc de roadmap existente.
- **Fuera de alcance**: reescritura masiva de documentos históricos.
- **Capas permitidas/prohibidas**: solo gobernanza documental.
- **Archivos o zonas probables**: secciones de “conflictos abiertos” y “decisión aplicada por precedencia”.
- **Checks obligatorios**:
  - cada tensión con evidencia textual concreta,
  - decisión trazada a regla de precedencia de `docs/99_fuente_de_verdad.md`.
- **Criterio de cierre**: lista priorizada de tensiones y acción exacta para cada una.
- **Evidencia de cierre CRX-004**: sección `Tensiones documentales prioritarias y decisión aplicada` con fichas TDX-01 a TDX-03 y precedencia explícita aplicada.
- **Bloqueo conocido**: posible necesidad de decisión humana en conflictos de producto no resolubles por precedencia automática.


## Tensiones documentales prioritarias y decisión aplicada

> Criterio aplicado: resolver por precedencia de `docs/99_fuente_de_verdad.md`; en conflicto planificado vs implementado, manda `docs/90_estado_implementacion.md`; en conflicto normativo/técnico, manda `docs/08_decisiones_tecnicas_no_negociables.md`.

### TDX-01 — Secuencia macro histórica C1→C6 vs estado real implementado posterior
- **Prioridad**: `P0` (crítica).
- **Documentos en conflicto**: `docs/14_roadmap.md` vs `docs/90_estado_implementacion.md`.
- **Evidencia concreta**:
  - `docs/14_roadmap.md` fija la secuencia fuerte C1→C6 y sitúa C3/C4/C5 como pasos futuros de esa progresión.
  - `docs/90_estado_implementacion.md` declara capacidades/evoluciones posteriores ya implementadas (por ejemplo cuenta real, pago real, incrementos V2) y no solo planificación.
- **Ámbito del conflicto**: interpretación del estado real y selección correcta de trabajo.
- **Documento que prevalece**: `docs/90_estado_implementacion.md` (estado real implementado).
- **Decisión operativa aplicada**: para decidir qué está hecho y qué falta, Codex debe tratar `docs/14_roadmap.md` como marco histórico de secuencia y usar `docs/90_estado_implementacion.md` como verdad factual vigente.
- **Impacto práctico para futuros agentes**: queda prohibido rebajar capacidades reales a “planificadas” por seguir literalidad histórica de C1→C6.
- **Acción siguiente exacta**: al iniciar cada tarea, validar el estado de la capacidad en `docs/90_estado_implementacion.md` antes de interpretar cualquier roadmap histórico.
- **¿Requiere decisión humana adicional?**: `No`.

### TDX-02 — Criterio de DONE entre roadmaps históricos (PLANNED/IN_PROGRESS/DONE) y tablero operativo Codex
- **Prioridad**: `P1` (alta).
- **Documentos en conflicto**: `docs/roadmap_cierre_ecommerce_real_incremental.md`, `docs/roadmap_ecommerce_real_v2.md` vs `docs/90_estado_implementacion.md` y `AGENTS.md`.
- **Evidencia concreta**:
  - Los roadmaps históricos documentan cierres por incremento (`Rxx`, `V2-Rxx`) con narrativa propia.
  - `docs/90_estado_implementacion.md` define el tablero factual de capacidades y estados oficiales del proyecto.
  - `AGENTS.md` prohíbe declarar `DONE` sin evidencia verificable.
- **Ámbito del conflicto**: criterio de DONE y coherencia entre documentación de ejecución histórica y estado operativo vigente.
- **Documento que prevalece**: `docs/90_estado_implementacion.md` para estado de implementación; `AGENTS.md` + `docs/08_decisiones_tecnicas_no_negociables.md` para regla de cierre verificable.
- **Decisión operativa aplicada**: un `DONE` en roadmap histórico se acepta solo como antecedente; la lectura operativa final del estado vigente se toma de `docs/90_estado_implementacion.md`.
- **Impacto práctico para futuros agentes**: evita declarar cierre ficticio por arrastre de narrativa histórica sin confirmar estado factual vigente.
- **Acción siguiente exacta**: cuando un histórico indique `DONE`, contrastarlo con la capacidad equivalente en `docs/90_estado_implementacion.md` antes de usarlo como base de ejecución.
- **¿Requiere decisión humana adicional?**: `No`.

### TDX-03 — Deriva de alcance del Ciclo 3 vs reglas de continuidad actuales
- **Prioridad**: `P1` (alta).
- **Documentos en conflicto**: `docs/ciclos/ciclo_03_reencauce_control.md` vs trazas de avance acumulado en `docs/90_estado_implementacion.md`.
- **Evidencia concreta**:
  - `docs/ciclos/ciclo_03_reencauce_control.md` fija que no se abre nueva feature fuera del roadmap oficial de Ciclo 3.
  - `docs/90_estado_implementacion.md` registra múltiples evoluciones posteriores (ecommerce real/V2) ya ejecutadas.
- **Ámbito del conflicto**: coherencia de selección de trabajo por ciclo frente a evolución real posterior.
- **Documento que prevalece**: `docs/90_estado_implementacion.md` para estado implementado; `docs/ciclos/ciclo_03_reencauce_control.md` se interpreta como control histórico puntual de reencauce.
- **Decisión operativa aplicada**: la regla “no abrir nueva feature” se aplica al contexto de su microciclo de reencauce, no como bloqueo perpetuo de todas las evoluciones posteriores ya implementadas y registradas en `docs/90`.
- **Impacto práctico para futuros agentes**: elimina bloqueo falso por lectura descontextualizada del reencauce de Ciclo 3.
- **Acción siguiente exacta**: usar `docs/roadmap_codex.md` para selección de tarea actual y `docs/90` para validar que no se contradice estado real.
- **¿Requiere decisión humana adicional?**: `Sí`, solo para definir si se desea una nota aclaratoria en el propio documento de reencauce (fuera del alcance de CRX-004).


## CRX-005 — Checklist mínimo de cierre por ejecución Codex
- **Estado**: `DONE`
- **Objetivo**: estandarizar checklist final reutilizable para ejecuciones (selección de tarea, evidencia, checks, actualización de bitácora/roadmap).
- **Alcance permitido**: `AGENTS.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: cambios de CI o scripts.
- **Capas permitidas/prohibidas**: solo gobernanza documental.
- **Archivos o zonas probables**: sección “checklist de salida” en AGENTS o bitácora.
- **Checks obligatorios**:
  - checklist sin ambigüedades,
  - alineado con criterios DONE del repo.
- **Criterio de cierre**: checklist operativo añadido y usado en una entrada real de bitácora.
- **Contrato operativo aplicado**:
  1. `AGENTS.md` define la norma obligatoria de cierre por checklist mínima;
  2. `docs/bitacora_codex.md` contiene la plantilla operativa reutilizable y su uso real en esta ejecución;
  3. la validación `definido vs implementado` se contrasta con `docs/90_estado_implementacion.md` cuando aplica.
- **Evidencia de cierre CRX-005**:
  - sección `Checklist mínimo de cierre por ejecución (uso obligatorio)` en `docs/bitacora_codex.md`;
  - entrada `2026-03-26-CRX-005` cerrada en `DONE` usando la checklist completa;
  - diff restringido al perímetro permitido (`AGENTS.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`).
- **Bloqueo conocido**: ninguno.

## CRX-006 — Reencuadre del roadmap Codex hacia V2-R10
- **Estado**: `DONE`
- **Objetivo**: reactivar `docs/roadmap_codex.md` como fuente de ejecución atómica tras quedar sin `TODO` y alinear el siguiente paso con `V2-R10`.
- **Alcance permitido**: `AGENTS.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: código de producto, scripts, tests, migraciones y cambios funcionales de backend/frontend.
- **Capas permitidas/prohibidas**: solo gobernanza documental; prohibido tocar dominio/aplicación/infraestructura/presentación.
- **Archivos o zonas probables**: matriz de trazabilidad y bloque final de `docs/roadmap_codex.md`, más entrada de cierre en `docs/bitacora_codex.md`.
- **Checks obligatorios**:
  - confirmar ausencia de `TODO` en `docs/roadmap_codex.md`,
  - confirmar `V2-R10` como siguiente incremento `PLANNED` en `docs/roadmap_ecommerce_real_v2.md`,
  - dejar una primera `TODO` no `BLOCKED` con perímetro claro,
  - diff dentro del perímetro permitido.
- **Criterio de cierre**: el roadmap Codex deja de estar obsoleto y expone una primera tarea ejecutable alineada con V2.
- **Evidencia de cierre CRX-006**:
  - matriz de trazabilidad ampliada con `CRX-006` y `V2G-001`;
  - `V2G-001` queda como primera `TODO` no `BLOCKED`;
  - entrada `2026-03-26-CRX-006` registrada en `docs/bitacora_codex.md`.
- **Bloqueo conocido**: ninguno.

## V2G-001 — Auditoría de cierre de `V2-R10` (go-live checklist v2)
- **Estado**: `DONE`
- **Objetivo**: contrastar el alcance pendiente de `V2-R10` con scripts, tests y documentación reales para decidir con evidencia si puede cerrarse, qué brecha exacta queda o si existe bloqueo externo.
- **Alcance permitido**: `AGENTS.md`, `docs/roadmap_ecommerce_real_v2.md`, `docs/release_readiness_minima.md`, `docs/13_testing_ci_y_quality_gate.md`, `docs/deploy_railway.md`, `docs/90_estado_implementacion.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, con lectura de `scripts/` y `tests/scripts/`.
- **Fuera de alcance**: tocar backend/frontend funcional, ejecutar deploy real, backups reales, restores reales o cambios de negocio.
- **Capas permitidas/prohibidas**: gobernanza documental y auditoría de scripts; prohibido mutar producto.
- **Archivos o zonas probables**: `docs/release_readiness_minima.md`, `docs/13_testing_ci_y_quality_gate.md`, `docs/deploy_railway.md`, `scripts/check_release_gate.py`, `scripts/check_release_readiness.py`, `scripts/check_deployed_stack.py`, `scripts/backup_restore_postgres.py`, `tests/scripts/`.
- **Checks obligatorios**:
  - verificar cobertura y trazabilidad de `check_release_gate.py`, `check_release_readiness.py`, `check_deployed_stack.py`, `backup_restore_postgres.py`, `check_operational_alerts_v2.py` y `retry_operational_tasks_v2.py`,
  - contrastar `V2-R10` con `docs/90_estado_implementacion.md` para no reabrir cierres ya implementados,
  - dejar un único resultado explícito: `DONE`, nueva tarea atómica siguiente o `BLOCKED` con causa externa verificable.
- **Criterio de cierre**: evidencia documental suficiente para decidir el siguiente paso exacto de `V2-R10` sin implementar a ciegas.
- **Evidencia de cierre V2G-001**:
  - `python scripts/check_release_readiness.py` devuelve `OK`, así que el checklist documental mínimo existe y no era la brecha principal.
  - `python scripts/check_release_gate.py` falla en este runner por dos causas distintas: entorno local sin Django/node_modules y, además, bloque frontend `G` en `SKIP` aunque `npm.cmd` está disponible.
  - Reproducción directa en Windows: `subprocess.run(['npm','--version'])` lanza `FileNotFoundError`, mientras `subprocess.run(['npm.cmd','--version'])` devuelve `0`; `scripts/check_seo_contract.py` ya resuelve `npm.cmd`, `scripts/check_release_gate.py` no.
  - Inspección de fuente: `scripts/check_release_gate.py` no invoca `check_release_readiness.py`, `check_operational_alerts_v2.py`, `retry_operational_tasks_v2.py` ni `backup_restore_postgres.py`, aunque `docs/13_testing_ci_y_quality_gate.md` y `docs/release_readiness_minima.md` los describen como parte del flujo canónico/pre-flight.
  - `.github/workflows/quality_gate.yml` instala dependencias backend/frontend antes del gate; por tanto, la ausencia de `.venv` y `frontend/node_modules` en este runner no se abre como bug de producto, pero sí justifica separar prerrequisito de entorno frente a wiring roto del repo.
  - El cierre final de `V2-R10` sigue dependiendo de smoke post-deploy y restore drill real con URLs/credenciales externas; eso se deriva a una tarea `BLOCKED` explícita.
- **Resultado de la auditoría**:
  1. `AUT-001` como siguiente `TODO` no `BLOCKED` para corregir el wiring frontend del gate en Windows.
  2. `AUT-002` como segundo `TODO` para reconciliar la cobertura real del gate con la documentación vigente.
  3. `AUT-003` como tarea `BLOCKED` hasta disponer de entorno desplegado y credenciales operativas reales.
- **Bloqueo conocido**: ninguno para la auditoría; el bloqueo externo queda encapsulado en `AUT-003`.

## AUT-001 — Resolver ejecución frontend del gate canónico en Windows
- **Tipo**: `FIX`
- **Prioridad**: `P0`
- **Estado**: `DONE`
- **Objetivo**: hacer que `scripts/check_release_gate.py` ejecute de forma fiable lint, tests frontend y build en runners Windows cuando `npm.cmd` exista.
- **Evidencia o síntoma**:
  - `python scripts/check_release_gate.py` deja el bloque `G) Frontend` en `SKIP` con “comando no disponible”.
  - `python -c "import subprocess; subprocess.run(['npm','--version'])"` reproduce `FileNotFoundError` en este entorno.
  - `python -c "import subprocess; subprocess.run(['npm.cmd','--version'])"` devuelve `0`.
  - `scripts/check_seo_contract.py` ya implementa un resolvedor compatible con `npm.cmd`; el gate canónico no.
- **Alcance permitido**: `scripts/check_release_gate.py`, `tests/scripts/test_check_release_gate_snapshot.py`, nuevos tests unitarios en `tests/scripts/`, y ajustes documentales mínimos si el contrato operativo visible cambia.
- **Fuera de alcance**: cambios en frontend de producto, cambios de negocio, instalación de dependencias en el runner o reescritura del gate SEO.
- **Zonas probables**: `scripts/check_release_gate.py`, `scripts/check_seo_contract.py`, `tests/scripts/test_check_release_gate_snapshot.py`, nuevo test dedicado al resolvedor frontend del gate.
- **Checks obligatorios**:
  - añadir prueba unitaria que cubra resolución `npm.cmd` en Windows para el gate;
  - ejecutar `python -m unittest tests.scripts.test_check_release_gate_snapshot tests.scripts.test_check_seo_contract <nuevo_test_gate_frontend>`;
  - verificar que el bloque frontend deja de marcar `SKIP` por resolución de ejecutable cuando `npm.cmd` está presente.
- **Criterio de cierre**: el gate canónico usa resolución de npm compatible con Windows y deja trazabilidad automática para lint/tests/build frontend en el mismo runner que hoy los omite.
- **Evidencia de cierre AUT-001**:
  1. `scripts/check_release_gate.py` resuelve `npm.cmd` en Windows y reutiliza el ejecutable resuelto en lint, tests frontend y build.
  2. `tests/scripts/test_check_release_gate_frontend.py` cubre el resolvedor Windows y verifica que el bloque frontend invoca `npm.cmd` en las cinco llamadas esperadas.
  3. `python -m unittest tests.scripts.test_check_release_gate_snapshot tests.scripts.test_check_seo_contract tests.scripts.test_check_release_gate_frontend` termina en `OK`.

## AUT-002 — Alinear cobertura real del gate con su contrato documental
- **Tipo**: `HARDEN`
- **Prioridad**: `P1`
- **Estado**: `DONE`
- **Objetivo**: reconciliar `scripts/check_release_gate.py` con lo que `docs/13_testing_ci_y_quality_gate.md` y `docs/release_readiness_minima.md` declaran como flujo canónico/pre-flight.
- **Evidencia o síntoma**:
  - `docs/13_testing_ci_y_quality_gate.md` lista `check_release_readiness.py`, `check_operational_alerts_v2.py`, `retry_operational_tasks_v2.py --dry-run` y `backup_restore_postgres.py --dry-run` dentro del flujo canónico.
  - `docs/release_readiness_minima.md` los exige en el checklist pre-flight.
  - `scripts/check_release_gate.py` no contiene ninguna de esas invocaciones, por lo que la cobertura real del gate es menor que la documentada.
- **Alcance permitido**: `scripts/check_release_gate.py`, tests unitarios/contractuales en `tests/scripts/`, y la documentación estrictamente necesaria para dejar una sola verdad operativa (`docs/13_testing_ci_y_quality_gate.md`, `docs/release_readiness_minima.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`).
- **Fuera de alcance**: tocar backend/frontend funcional, reabrir `V2-R01`..`V2-R09`, o introducir nuevas features de negocio.
- **Zonas probables**: `scripts/check_release_gate.py`, `tests/scripts/test_check_release_gate_snapshot.py`, `tests/scripts/test_check_release_gate_reconciliation.py`, posible nuevo test de contrato del gate, `docs/13_testing_ci_y_quality_gate.md`, `docs/release_readiness_minima.md`.
- **Checks obligatorios**:
  - prueba automatizada que falle si el gate deja fuera bloques declarados como canónicos;
  - ejecutar `python -m unittest tests.scripts.test_check_release_gate_snapshot tests.scripts.test_check_release_gate_reconciliation <nuevo_test_contrato_gate>`;
  - verificar que la documentación final describe exactamente lo que el script ejecuta, sin pasos fantasmas.
- **Criterio de cierre**: script y documentación quedan alineados; el gate o bien ejecuta esos bloques o la documentación deja de prometerlos.
- **Evidencia de cierre AUT-002**:
  1. `scripts/check_release_gate.py` ahora ejecuta `check_release_readiness.py`, `check_operational_alerts_v2.py --fail-on blocker` y `retry_operational_tasks_v2.py --dry-run --json`, y clasifica `SKIP:` explícitos como bloques no aplicables en vez de `OK` falsos.
  2. `tests/scripts/test_check_release_gate_contract.py` blinda el contrato reconciliado (bloques nuevos, `SKIP` semántico y presencia en `main`), y `python -m unittest tests.scripts.test_check_release_gate_snapshot tests.scripts.test_check_release_gate_frontend tests.scripts.test_check_release_gate_reconciliation tests.scripts.test_check_release_gate_contract` termina en `OK`.
  3. `docs/13_testing_ci_y_quality_gate.md` y `docs/release_readiness_minima.md` dejan una única verdad operativa: el gate cubre readiness/alertas/retry dry-run y el plan de backup/restore queda explícitamente fuera como checklist pre-flight separado.

## AUT-003 — Smoke post-deploy y restore drill real para cierre de `V2-R10`
- **Tipo**: `HARDEN`
- **Prioridad**: `P1`
- **Estado**: `BLOCKED`
- **Objetivo**: ejecutar la validación final externa de `V2-R10` sobre entorno desplegado real antes de considerar go-live cerrable.
- **Evidencia o síntoma**:
  - `docs/release_readiness_minima.md` exige backup real, restore drill real, deploy y smoke post-deploy.
  - `scripts/check_deployed_stack.py` requiere `BACKEND_BASE_URL` y `FRONTEND_BASE_URL`.
  - el runner actual no dispone de URLs desplegadas reales ni de una `BOTICA_RESTORE_DATABASE_URL` operativa para el drill.
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, `docs/release_readiness_minima.md`, `docs/deploy_railway.md`, `scripts/check_deployed_stack.py`, `scripts/backup_restore_postgres.py`.
- **Fuera de alcance**: cambios de producto, despliegues improvisados, uso de producción como base de restore drill, o cierre ficticio de `V2-R10` sin entorno real.
- **Zonas probables**: `docs/release_readiness_minima.md`, `docs/deploy_railway.md`, `scripts/check_deployed_stack.py`, `scripts/backup_restore_postgres.py`.
- **Checks obligatorios**:
  - exportar `BACKEND_BASE_URL` y `FRONTEND_BASE_URL` reales y ejecutar `python scripts/check_deployed_stack.py`;
  - ejecutar backup real + restore drill real en base temporal segura con `python scripts/backup_restore_postgres.py`;
  - registrar resultado verificable de smoke y drill en bitácora antes de decidir cierre de `V2-R10`.
- **Criterio de cierre**: smoke post-deploy y restore drill real ejecutados con resultado verificable y sin incidencias bloqueantes.
- **Condición exacta de bloqueo**: faltan `BACKEND_BASE_URL`, `FRONTEND_BASE_URL`, `BOTICA_RESTORE_DATABASE_URL` y acceso a un entorno temporal seguro para restore drill fuera de este runner.

## Radar de cola actual
- **Fecha de revisión**: `2026-03-26`
- **Diagnóstico**: no existen tareas `TODO` no `BLOCKED` en `docs/roadmap_codex.md`.
- **Verificación aplicada**: `BACKEND_BASE_URL`, `FRONTEND_BASE_URL` y `BOTICA_RESTORE_DATABASE_URL` siguen ausentes en este runner, por lo que el criterio de desbloqueo de `AUT-003` no se cumple.
- **Estado de cola**: cola ejecutable vacía; requiere radar/desbloqueo externo de `AUT-003`.
- **Siguiente acción exacta**: aportar esas variables reales y ejecutar `python scripts/check_deployed_stack.py` más `python scripts/backup_restore_postgres.py restore-drill --dump-file <dump real>` en una base temporal segura fuera de producción.
