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
| `RUN-001` | Check no destructivo de arranque local | `AGENTS.md` | `docs/90_estado_implementacion.md`, `docs/07_arquitectura_tecnica.md`, `run_app.bat`, `setup_entorno.bat` | funcionamiento real de setup/run_app sin abrir procesos persistentes | El alcance permanente exige priorizar `run_app/setup` cuando no haya `TODO` ejecutable; el check no destructivo permite validar entorno sin activar servidores. | Cierre válido solo si `setup_entorno.bat --check` y `run_app.bat --check` pasan sin dejar procesos vivos. |
| `RUN-002` | Smoke controlado de servidores locales | `AGENTS.md` | `docs/90_estado_implementacion.md`, `run_app.bat`, `setup_entorno.bat`, `manage.py`, `frontend/package.json` | validación de arranque real local con control de PID y limpieza | Tras `RUN-001`, queda comprobar que backend/frontend arrancan y responden en puertos libres sin depender de ventanas manuales. | Debe registrar PIDs, cerrar solo procesos del repo y no activar pagos reales. |

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
  - `scripts/check_release_readiness.py` pasa en local y valida `.env.railway.example`, marcadores de readiness y ausencia de secretos debiles evidentes.
  - `scripts/check_release_gate.py` pasa completo: readiness backend, `manage.py check`, tests criticos, `tests.scripts` (44 tests), contratos API frontend/demo, snapshot publico, SEO, integridad operativa y conciliacion operativa.
  - `scripts/check_operational_alerts_v2.py --fail-on none --json` pasa sin alertas.
  - `scripts/retry_operational_tasks_v2.py --dry-run --json` pasa sin candidatos ni mutaciones.
  - `scripts/backup_restore_postgres.py backup --dry-run` y `restore-drill --dry-run` pasan con URLs PostgreSQL ficticias y sin generar dumps versionables.
  - `scripts/check_deployed_stack.py` queda bloqueado correctamente sin `BACKEND_BASE_URL`; por tanto `V2-R10` no puede cerrarse como go-live real sin entorno desplegado.
- **Resultado de auditoria**: `V2-R10` queda bloqueado por dependencias externas verificables: URLs reales de backend/frontend desplegados y base PostgreSQL temporal segura para restore drill real.
- **Bloqueo conocido**: smoke post-deploy real y restore drill real fuera del alcance local/demo de esta corrida.

## V2G-002 - Desbloqueo externo de go-live real `V2-R10`
- **Estado**: `BLOCKED`
- **Objetivo**: ejecutar la validacion final de go-live real cuando existan endpoints desplegados y base PostgreSQL temporal segura.
- **Alcance permitido**: `docs/deploy_railway.md`, `docs/release_readiness_minima.md`, `scripts/check_deployed_stack.py`, `scripts/backup_restore_postgres.py`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: activar pagos reales, conectar banco/PSP real, usar datos reales de cliente o ejecutar restores contra base productiva.
- **Dependencias que bloquean**:
  - `BACKEND_BASE_URL` y `FRONTEND_BASE_URL` de un despliegue real o staging controlado.
  - base PostgreSQL temporal segura y aislada para `BOTICA_RESTORE_DATABASE_URL`.
  - `DATABASE_URL` y `BOTICA_BACKUP_DIR` fuera del repositorio para backup real.
- **Criterio de desbloqueo**: las variables anteriores existen en entorno seguro y el usuario autoriza una corrida operacional no dry-run sobre staging/temporal, sin pagos reales.
- **Siguiente accion exacta al desbloquear**: ejecutar `scripts/check_deployed_stack.py`, `scripts/backup_restore_postgres.py backup` y `scripts/backup_restore_postgres.py restore-drill` contra entorno seguro; registrar evidencias y decidir cierre de `V2-R10`.
- **Bloqueo conocido**: dependencia externa de infraestructura/credenciales operativas.

## RUN-001 - Modo check no destructivo para `setup_entorno` y `run_app`
- **Estado**: `DONE`
- **Objetivo**: permitir validar el entorno local y la deteccion de backend/frontend sin instalar dependencias ni arrancar servidores persistentes.
- **Alcance permitido**: `run_app.bat`, `setup_entorno.bat`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, `docs/90_estado_implementacion.md`.
- **Fuera de alcance**: arrancar servidores como smoke real, ejecutar deploy, instalar dependencias, modificar backend/frontend funcional o activar pagos reales.
- **Capas permitidas/prohibidas**: scripts operativos de desarrollo; prohibido tocar dominio/aplicacion/infraestructura/presentacion del producto.
- **Evidencia de cierre RUN-001**:
  - `setup_entorno.bat --check` valida Python, `.venv`, `requirements.txt`, `npm` y `frontend\node_modules` sin instalar dependencias.
  - `run_app.bat --check` delega en `setup_entorno.bat --check`, detecta backend Django y frontend Next, y termina antes de cualquier `start`.
  - Se corrigio la primera version del check para que no ejecute bloques de arranque; los procesos lanzados accidentalmente durante la validacion se cerraron por PID y pertenecian inequivocamente a este repo.
- **Checks ejecutados**:
  - `cmd /c setup_entorno.bat --check` -> OK.
  - `cmd /c run_app.bat --check` -> OK, sin iniciar servidores.
  - consulta de procesos por ruta absoluta del repo -> sin procesos vivos tras limpieza.
- **Bloqueo conocido**: ninguno para el modo check.

## RUN-002 - Smoke controlado de arranque local backend/frontend
- **Estado**: `DONE`
- **Objetivo**: comprobar que backend Django y frontend Next arrancan realmente en local/demo, responden a una peticion basica y se cierran por PID registrado.
- **Alcance permitido**: `run_app.bat`, `setup_entorno.bat`, scripts auxiliares temporales en `.codex_runtime/tmp/`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: deploy real, pagos reales, banco/PSP real, cambios funcionales de ecommerce, uso de puertos ocupados por procesos ajenos.
- **Capas permitidas/prohibidas**: operacion local; prohibido modificar dominio/aplicacion/infraestructura/presentacion salvo bug minimo demostrado en scripts de arranque.
- **Checks obligatorios**:
  - comprobar puertos libres antes de arrancar;
  - registrar PIDs en `.codex_runtime/pids.txt`;
  - validar respuesta basica de backend y frontend;
  - cerrar PIDs registrados y confirmar que no quedan procesos vivos del repo.
- **Criterio de cierre**: smoke local reproducible con procesos cerrados y evidencias en bitacora.
- **Evidencia de cierre RUN-002**:
  - puertos `18080` (backend) y `13080` (frontend) comprobados libres antes de arrancar;
  - backend Django arrancado con `.venv\Scripts\python.exe manage.py runserver 127.0.0.1:18080 --noreload`;
  - frontend Next arrancado con `node frontend\node_modules\next\dist\bin\next dev -p 13080 -H 127.0.0.1`;
  - PIDs registrados y cerrados: `17668`, `19528`, `11800`, `32752`;
  - `http://127.0.0.1:18080/` responde `404` de Django, confirmando proceso vivo y alcanzable aunque la raiz backend no tenga ruta publica;
  - `http://127.0.0.1:13080/` responde `200`;
  - revision final por ruta absoluta del repo confirma que no quedan procesos vivos asociados.
- **Bloqueo conocido**: ninguno.

## ELS-001 - Reencauce oficial ecommerce local simulado
- **Estado**: `DONE`
- **Objetivo**: crear la fuente documental de la nueva fase ecommerce local real con pago simulado y alinear el estado factual sin tocar frontend/backend funcional.
- **Alcance permitido**: `docs/roadmap_ecommerce_local_simulado.md`, `docs/90_estado_implementacion.md`, `docs/roadmap_ecommerce_real_v2.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: frontend, backend funcional, endpoints, Stripe, CTAs publicos, borrado de rutas demo, migraciones, builds y pagos reales.
- **Capas permitidas/prohibidas**: solo documentacion y gobernanza; prohibido modificar dominio/aplicacion/infraestructura/presentacion ejecutable.
- **Evidencia de cierre ELS-001**:
  - nuevo `docs/roadmap_ecommerce_local_simulado.md` con objetivo, reglas, rutas principales y fases ELS-01 a ELS-11;
  - `docs/90_estado_implementacion.md` registra la fase como `PLANIFICADO`, demo legacy como `DEPRECATED_CONTROLLED`, pago simulado como `PLANIFICADO` y Stripe como `RESERVADO_FUTURO`;
  - `docs/roadmap_ecommerce_real_v2.md` conserva `V2-R10` bloqueado y aclara que la fase local simulada no habilita go-live real ni pagos reales.
- **Checks obligatorios**:
  - `git diff --check`;
  - script documental/gate ligero si existe y aplica a cambios documentales.
- **Bloqueo conocido**: ninguno.

## ELS-002 - Deprecacion UX de demo legacy
- **Estado**: `DONE`
- **Objetivo**: hacer visible en experiencia y documentacion viva que `/encargo`, `/pedido-demo` y `cuenta-demo` son legacy controlado, sin eliminarlos ni romper compatibilidad.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: por definir en el prompt de ejecucion; debe limitarse a la deprecacion UX/documental de demo legacy.
- **Fuera de alcance**: borrar rutas demo, romper pedidos demo existentes, implementar pago simulado, activar Stripe o cambiar el contrato funcional del checkout real.
- **Criterio de cierre**: CTAs/copy/estado documental dejan de presentar la demo legacy como flujo principal y conservan compatibilidad controlada.
- **Evidencia de cierre ELS-002**:
  - `NAVEGACION_PRINCIPAL` expone `/checkout` y retira `/encargo`/`/cuenta-demo` del navbar publico;
  - CTA principal de footer, cesta y fichas de producto apuntan a `/checkout`;
  - `/encargo` permanece como consulta personalizada secundaria;
  - tests frontend relacionados y build pasan.
- **Bloqueo conocido**: ninguno.

## ELS-003 - Pasarela simulada local por puerto
- **Estado**: `DONE`
- **Objetivo**: incorporar una pasarela de pago simulada local como adaptador del puerto de pago, sin activar Stripe ni acoplar logica especial a vistas/componentes.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: adaptador de infraestructura, ampliacion controlada de proveedor de pago, configuracion por entorno, wiring publico y tests backend.
- **Fuera de alcance**: pagos reales, banco/PSP real, go-live externo, reabrir `PedidoDemo` o mezclar Stripe como flujo local activo.
- **Criterio de cierre**: checkout/pedido real local pueden cerrar el paso de pago mediante adaptador simulado verificable y tests.
- **Evidencia de cierre ELS-003**:
  - `PasarelaPagoSimuladaLocal` implementa `PuertoPasarelaPago`;
  - `Pedido` acepta `simulado_local` como proveedor valido;
  - `BOTICA_PAYMENT_PROVIDER` selecciona `simulado_local` por defecto y conserva `stripe`;
  - tests backend de pago/pedido/post-pago relacionados pasan.
- **Bloqueo conocido**: ninguno.

## ELS-004 - Confirmacion local de pago simulado
- **Estado**: `DONE`
- **Objetivo**: permitir confirmar una intencion `simulado_local` y procesar el pedido real como pagado reutilizando `ProcesarPostPagoPedido`.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: caso de uso de confirmacion simulada, endpoint publico controlado, wiring de servicios y tests backend.
- **Fuera de alcance**: frontend, redisenar checkout, cambiar documento fiscal, backoffice, borrar demo legacy, reembolso simulado o activar Stripe real.
- **Criterio de cierre**: pedido real con intencion `simulado_local` puede confirmarse y reutiliza post-pago real para stock/email/incidencia.
- **Evidencia de cierre ELS-004**:
  - `ConfirmarPagoSimuladoPedido` valida pedido, proveedor e intencion simulada;
  - `POST /api/v1/pedidos/{id_pedido}/confirmar-pago-simulado/` devuelve pedido actualizado;
  - tests cubren stock suficiente, incidencia por falta de stock, proveedor Stripe rechazado, inexistente, idempotencia y webhook Stripe.
- **Bloqueo conocido**: ninguno.

## ELS-005 - UI de pago simulado en checkout real
- **Estado**: `DONE`
- **Objetivo**: integrar en frontend una experiencia de pago simulado local sobre checkout/pedido real, sin Stripe activo ni flujo demo legacy.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: cliente API frontend, proxy Next, helper puro de proveedor simulado, UI del recibo real y tests frontend.
- **Fuera de alcance**: backend, redisenar todo el checkout, `/encargo`, cuenta real, backoffice o Stripe frontend real.
- **Criterio de cierre**: un usuario puede crear pedido real, iniciar pago simulado y confirmarlo desde UI local.
- **Evidencia de cierre ELS-005**:
  - `confirmarPagoSimuladoPedido` consume el endpoint de confirmacion;
  - `/api/pedidos/[id_pedido]/confirmar-pago-simulado` proxifica al backend;
  - `ReciboPedidoReal` muestra "Confirmar pago de prueba" solo para `simulado_local`;
  - tests de checkout real, lint y build pasan.
- **Bloqueo conocido**: ninguno.

## ELS-006 - Stock preventivo antes de iniciar pago
- **Estado**: `DONE`
- **Objetivo**: impedir que un pedido avance hacia pago si el inventario no cubre sus lineas, manteniendo post-pago como segunda barrera.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: servicio/caso de uso de aplicacion, integracion en iniciar pago y confirmacion simulada, serializacion de errores y tests backend.
- **Fuera de alcance**: frontend, reservas temporales, multi-almacen, cambios logisticos, Stripe real o eliminacion de proteccion post-pago.
- **Criterio de cierre**: no se crea intencion ni se marca pagado si falla stock preventivo; el error JSON expone detalle consumible por frontend.
- **Evidencia de cierre ELS-006**:
  - `ValidarStockPreventivoPedido` vive en aplicacion y usa `RepositorioInventario`;
  - `IniciarPagoPedido` valida antes de llamar a la pasarela;
  - `ConfirmarPagoSimuladoPedido` revalida antes de `ProcesarPostPagoPedido`;
  - tests cubren stock suficiente, insuficiente, unidad incompatible, proveedor Stripe y post-pago existente.
- **Bloqueo conocido**: ninguno.

## ELS-007 - Stock visible en ficha, cesta y checkout
- **Estado**: `DONE`
- **Objetivo**: exponer disponibilidad de stock en superficies comerciales y bloquear lo claramente no comprable antes de pago.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: contrato publico de producto, API frontend, helpers puros, ficha/card, cesta, checkout/recibo y tests.
- **Fuera de alcance**: reserva temporal, cambios de precio, pago simulado, backoffice, Stripe real o eliminacion legacy.
- **Criterio de cierre**: usuario ve disponibilidad antes de pagar; cesta/checkout no avanzan con lineas sin stock; copy publico no muestra codigos tecnicos.
- **Evidencia de cierre ELS-007**:
  - producto publico expone `disponible_compra`, `cantidad_disponible` y `mensaje_disponibilidad`;
  - `disponibilidadStock.ts` concentra helpers puros de bloqueo;
  - ficha/card y cesta desactivan compra normal sin stock;
  - checkout y recibo muestran errores preventivos de stock consumibles.
- **Bloqueo conocido**: ninguno.

## ELS-008 - Cesta real limpia
- **Estado**: `DONE`
- **Objetivo**: convertir la cesta en una superficie ecommerce real donde solo lineas comprables avancen a `/checkout`.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: helpers puros de cesta real, ajuste de la vista de cesta, conversion segura hacia checkout y tests frontend.
- **Fuera de alcance**: backend, pago, `PedidoDemo`, promociones, descuentos, backoffice o convertir `/encargo` en checkout principal.
- **Criterio de cierre**: `/checkout` recibe solo lineas comprables; las lineas de consulta, invalidas o sin stock bloquean el CTA principal y pueden eliminarse o derivarse a consulta.
- **Evidencia de cierre ELS-008**:
  - `cestaReal.ts` clasifica lineas como `comprable`, `requiere_consulta`, `invalida` o `sin_stock`;
  - `VistaCestaRitual` serializa hacia checkout con `convertirCestaAItemsCheckoutReal`;
  - tests cubren cesta comprable, linea no convertible, salida secundaria a `/encargo`, eliminacion de bloqueante y payload sin lineas fuera de contrato.
- **Bloqueo conocido**: ninguno.

## ELS-009 - Cuenta real como unica cuenta visible
- **Estado**: `DONE`
- **Objetivo**: consolidar `/mi-cuenta` como cuenta visible del ecommerce real y deprecar `cuenta-demo` en navegacion publica y flujos nuevos.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: enlaces/copy de cuenta, checkout real, area privada real y tests frontend de cuenta/checkout/navegacion.
- **Fuera de alcance**: borrar modelos/endpoints demo, migrar datos demo, cambiar autenticacion profunda, roles nuevos o pagos.
- **Criterio de cierre**: `/mi-cuenta` es la unica cuenta visible en navegacion principal; checkout real no usa `CuentaDemo`; cuenta real muestra pedidos, direcciones y documento fiscal.
- **Evidencia de cierre ELS-009**:
  - `PanelCuentaCliente` elimina el CTA a `RUTAS_CUENTA_CLIENTE.legadoDemo`;
  - `/mi-cuenta` muestra direcciones guardadas, pedidos reales, enlaces a `/pedido/[id_pedido]` y documento fiscal;
  - checkout real mantiene sesion/direcciones de cuenta real o invitado, sin imports ni contratos `CuentaDemo`;
  - tests de cuenta real, cuenta demo legacy, checkout y navegacion pasan.
- **Bloqueo conocido**: ninguno.

## ELS-010 - Pedido real, recibo y documento fiscal sin olor a demo
- **Estado**: `DONE`
- **Objetivo**: pulir `/pedido/[id_pedido]`, recibo y documento fiscal para que funcionen como ecommerce real local con pago simulado.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: helpers de presentacion, recibo real, metadata de pedido, documento fiscal HTML y tests de pedido/documento.
- **Fuera de alcance**: calculo fiscal profundo, pasarela, stock, backoffice, PDF o eliminar `/pedido-demo`.
- **Criterio de cierre**: el detalle de pedido real no usa lenguaje demo/legacy; el pago simulado se comunica como entorno local; el documento fiscal queda accesible y coherente.
- **Evidencia de cierre ELS-010**:
  - `reciboPedidoReal.ts` concentra helpers de estado/copy del recibo;
  - `ReciboPedidoReal` muestra fecha, estados, contacto, entrega, lineas, totales, documento fiscal, cuenta y seguimiento;
  - `documento_pedido_html.py` incluye proveedor de pago y nota local simulada cuando aplica;
  - tests backend de pedido/documento y tests frontend de checkout/pedido pasan.
- **Bloqueo conocido**: ninguno.

## ELS-011 - Backoffice operativo minimo para ecommerce local
- **Estado**: `DONE`
- **Objetivo**: preparar Django Admin/backoffice para operar pedidos reales locales creados desde `/checkout` con pago simulado.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: admin de pedidos reales, acciones manuales seguras, filtros/listado operativo, logging y tests backend.
- **Fuera de alcance**: CRM completo, panel frontend nuevo, automatizar decisiones sensibles, cambiar checkout, cambiar pasarela, activar Stripe o eliminar `PedidoDemo`.
- **Criterio de cierre**: un pedido real local pagado puede prepararse, enviarse y entregarse manualmente con trazabilidad, sin mezclar `PedidoDemo`.
- **Evidencia de cierre ELS-011**:
  - `PedidoRealAdmin` visibiliza email, cliente, total, estado, pago, proveedor, pago simulado, revision, inventario e incidencias;
  - filtros operativos cubren estados fisicos, revision manual, incidencia de stock, reembolso y pago simulado local;
  - acciones admin de preparar, enviar y entregar delegan en casos de uso de aplicacion;
  - envio sin tracking queda bloqueado salvo marca explicita de envio sin seguimiento;
  - tests backend de admin/backoffice pasan.
- **Bloqueo conocido**: ninguno.

## ELS-012 - Reembolso y devolucion simulada/manual coherente
- **Estado**: `DONE`
- **Objetivo**: ajustar postventa local para que devoluciones, reembolsos y restitucion sean manuales, trazables y coherentes con pago `simulado_local`.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: dominio de pedido, casos de uso de postventa local, Django Admin de devoluciones/reembolso/restitucion y tests backend.
- **Fuera de alcance**: portal cliente, etiquetas de transporte, emails reales nuevos, reembolso Stripe, banco/PSP real, fiscalidad profunda o eliminar legacy demo.
- **Criterio de cierre**: la devolucion aceptada de pedido `simulado_local` puede reembolsarse y restituir inventario manualmente sin llamadas a Stripe ni duplicados.
- **Evidencia de cierre ELS-012**:
  - `ReembolsarPagoSimuladoManualPedido` ejecuta reembolso local con id `SIM-REF-{id_pedido}-{operation_id}`;
  - `RestituirInventarioManualPostventa` restituye stock con ledger y evita doble restitucion;
  - Django Admin de devoluciones omite proveedores no simulados y no construye pasarela Stripe;
  - tests cubren elegibilidad, no llamada a Stripe, idempotencia de reembolso, restitucion no duplicada y resolucion operativa.
- **Bloqueo conocido**: ninguno.

## ELS-013 - SEO y noindex operativo
- **Estado**: `DONE`
- **Objetivo**: asegurar que rutas transaccionales, privadas, checkout, pedido y legacy demo no son indexables.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: metadata SEO frontend, contrato SEO, sitemap/robots contractuales y tests SEO.
- **Fuera de alcance**: reescritura de contenido SEO, nuevas landings, cambios funcionales de checkout, backend funcional o eliminacion legacy.
- **Criterio de cierre**: ninguna ruta transaccional o privada queda indexable; legacy demo queda fuera de sitemap; catalogo/fichas/editorial conservan su contrato SEO.
- **Evidencia de cierre ELS-013**:
  - `docs/seo_contrato.json` incluye checkout, pedido real, cuenta, auth, backoffice y legacy demo como `transaccionales_noindex`;
  - pages de checkout, pedido, cuenta, auth y backoffice usan `construirMetadataSeo({ indexable: false })`;
  - tests de contrato SEO cubren metadata noindex y exclusiones de sitemap;
  - sitemap/robots Django permanecen gobernados por el contrato SEO.
- **Bloqueo conocido**: ninguno.

## ELS-014 - Limpieza de copy comercial
- **Estado**: `DONE`
- **Objetivo**: eliminar lenguaje publico de demo tecnica, V1, legacy, coexistencia, contrato/API/payload y dejar tono comercial de botica artesanal/editorial.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: copy visible en home, ficha, cesta, checkout, pedido, cuenta, recibo y rutas legacy conservadas; tests textuales relacionados.
- **Fuera de alcance**: logica de negocio, pagos, URLs, borrado legacy, rebranding visual o claims sanitarios.
- **Criterio de cierre**: la busqueda final de terminos prohibidos no encuentra copy publico en rutas principales; pago simulado solo se menciona donde corresponde.
- **Evidencia de cierre ELS-014**:
  - copy visible de checkout/recibo/cuenta/consulta evita "demo", "real v1", "legacy", "coexistencia" y lenguaje tecnico;
  - `/encargo`, `/pedido-demo` y `cuenta-demo` mantienen compatibilidad con copy comercial/controlado;
  - disponibilidad y errores publicos evitan referencias a backend/API/payload;
  - tests frontend de checkout, encargo, cuenta, legal, SEO de landings y fichas se ajustan al nuevo tono.
- **Bloqueo conocido**: ninguno.

## ELS-015 - Gate local ecommerce simulado
- **Estado**: `DONE`
- **Objetivo**: crear un quality gate local, estatico y de solo lectura para validar ecommerce real local con pago simulado sin declarar go-live externo.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: script `scripts/check_ecommerce_local_simulado.py`, tests de script, documentacion de quality gate y roadmap.
- **Fuera de alcance**: lanzar servidores, Playwright/E2E, Stripe real, URLs externas, base remota, release gate principal o desbloquear `V2-R10`.
- **Criterio de cierre**: gate ejecutable con severidades `OK/WARNING/BLOCKER`, salida texto/JSON, exit code correcto y tests.
- **Evidencia de cierre ELS-015**:
  - el script valida roadmap local, rutas principales, legacy controlado, adaptador/configuracion `simulado_local`, confirmacion simulada, checkout/recibo, cuenta, backoffice, noindex y bloqueo `V2-R10`;
  - `--json` expone payload reutilizable y `--fail-on warning` endurece el gate cuando se quiera;
  - tests cubren OK con fixture minimo, blocker por roadmap ausente, warning legacy documentado y exit code.
- **Bloqueo conocido**: ninguno.

## ELS-016 - Seed local comprable
- **Estado**: `DONE`
- **Objetivo**: asegurar datos locales minimos para comprar de punta a punta con ecommerce real local y pago simulado.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: script bootstrap local, tests de script, documentacion de ejecucion y estado/roadmap.
- **Fuera de alcance**: checkout, pasarela, Stripe real, pedidos precargados, imagenes nuevas, migraciones o datos de produccion.
- **Criterio de cierre**: comando claro, idempotente y testeado que crea productos publicados comprables con inventario compatible.
- **Evidencia de cierre ELS-016**:
  - `scripts/bootstrap_ecommerce_local_simulado.py` crea secciones, intencion/planta local, cuatro productos `LOCAL-ECOM-*`, inventario compatible y cuenta cliente opcional;
  - `--dry-run` revierte transaccionalmente los cambios;
  - tests cubren producto comprable, inventario compatible, idempotencia, no duplicacion y dry-run.
- **Bloqueo conocido**: ninguno.

## ELS-017 - Regresion compra local simulada
- **Estado**: `DONE`
- **Objetivo**: crear una regresion automatizada por capas para proteger catalogo -> ficha -> cesta -> checkout -> pago simulado -> pedido real -> documento/recibo -> cuenta.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: tests backend/frontend, comando reutilizable frontend y documentacion de matriz de cobertura.
- **Fuera de alcance**: Playwright/E2E pesado, servidor frontend, Stripe real, borrado legacy, diseno o reescritura de checkout.
- **Criterio de cierre**: tests ejecutables en local que cubren compra invitado, cuenta real con direccion, stock insuficiente, pago simulado, documento, cuenta y ausencia de dependencia demo.
- **Evidencia de cierre ELS-017**:
  - `tests/nucleo_herbal/test_regresion_compra_local_simulada.py`;
  - `frontend/tests/compra-local-simulada.test.ts`;
  - `npm --prefix frontend run test:compra-local`;
  - matriz de cobertura en `docs/13_testing_ci_y_quality_gate.md`.
- **Bloqueo conocido**: ninguno.

## ELS-018 - Rendimiento frontend ecommerce
- **Estado**: `DONE`
- **Objetivo**: optimizar el rendimiento percibido de rutas comerciales principales sin cambiar negocio ni SEO.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: rutas y componentes frontend de home, catalogo, ficha, cesta, checkout y pedido; tests/documentacion de rendimiento seguro.
- **Fuera de alcance**: cambios de negocio, rediseño global, backend, Stripe, CDN, imagenes binarias, analitica externa o E2E pesado nuevo.
- **Criterio de cierre**: menos JS cliente innecesario donde sea claro, checkout sin recalculo evitable, SEO intacto y build frontend pasando.
- **Evidencia de cierre ELS-018**:
  - `TarjetaProductoBoticaNatural` deja de ser Client Component completo;
  - `AccionesTarjetaProductoBoticaNatural` concentra la hidratacion de cantidad/carrito;
  - `FlujoCheckoutReal` memoiza `resolverContextoPreseleccionado`;
  - tests de Botica Natural, tarjetas, checkout, compra local, lint, build y gate local pasan.
- **Bloqueo conocido**: ninguno.

## ELS-019 - Accesibilidad y usabilidad de compra
- **Estado**: `DONE`
- **Objetivo**: mejorar accesibilidad y usabilidad del flujo catalogo/ficha -> cesta -> checkout -> pago simulado -> pedido sin cambiar negocio.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: componentes frontend de ficha/cesta/checkout/pedido, formularios, mensajes de error, estados de carga y tests frontend.
- **Fuera de alcance**: cambios de negocio, rediseño completo, backend, pago, imagenes, servicios externos o librerias nuevas.
- **Criterio de cierre**: formularios con labels, errores claros/asociados, botones bloqueados explicados, recibo/pago anunciable y build pasando.
- **Evidencia de cierre ELS-019**:
  - `FlujoCheckoutReal` asocia labels/errores y enfoca el bloque de error;
  - `VistaCestaRitual` y `ListaLineasSeleccion` enlazan bloqueos y controles de cantidad/eliminacion;
  - `ReciboPedidoReal` anuncia carga, mensajes y pago simulado con roles/ARIA;
  - tests de checkout, cesta, pedido, compra local, lint y build pasan.
- **Bloqueo conocido**: ninguno.

## ELS-020 - Seguridad local ecommerce simulado
- **Estado**: `DONE`
- **Objetivo**: revisar y endurecer seguridad basica local para secretos, proveedor de pago, Stripe futuro, confirmacion simulada y exposicion accidental.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: settings/env, validacion de proveedor de pago, logs de pago, documentacion env y tests de pago/ACL/deploy guards.
- **Fuera de alcance**: activar Stripe, pentest completo, CSP avanzada, deploy real, antifraude, cambios de negocio o desbloquear `V2-R10`.
- **Criterio de cierre**: modo local seguro por defecto, Stripe no activable accidentalmente, confirmacion simulada limitada a `simulado_local`, secretos no filtrados y tests pasando.
- **Evidencia de cierre ELS-020**:
  - `validar_configuracion_pago` valida proveedor y claves requeridas para Stripe;
  - `.env.railway.example` documenta `BOTICA_PAYMENT_PROVIDER=simulado_local`;
  - logs de pago eliminan `email_contacto`;
  - tests cubren proveedor invalido, Stripe sin claves, confirmacion simulada contra proveedor no simulado/cancelado y no filtrado de secretos.
- **Bloqueo conocido**: ninguno.

## ELS-021 - Analitica local de embudo sin terceros
- **Estado**: `DONE`
- **Objetivo**: crear una analitica local minima y privada para medir vista producto -> cesta -> checkout -> pedido -> pago simulado -> pedido pagado.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: helper frontend centralizado, eventos del embudo, documentacion de privacidad y tests de contrato.
- **Fuera de alcance**: servicios externos, cookies publicitarias, dashboard, endpoint persistente, PII o cambios de negocio.
- **Criterio de cierre**: eventos locales disponibles, desactivables y testeados sin enviar datos a terceros ni guardar PII.
- **Evidencia de cierre ELS-021**:
  - `frontend/contenido/analitica/embudoLocal.ts` define contrato y emisor local;
  - ficha, cesta, checkout y API frontend de pedidos emiten los hitos del embudo;
  - `NEXT_PUBLIC_ANALITICA_LOCAL=false` documenta desactivacion explicita;
  - `npm --prefix frontend run test:analitica-local` cubre contrato, desactivacion, emision y ausencia de PII.
- **Bloqueo conocido**: ninguno.

## ELS-022 - Legal y confianza comercial minima
- **Estado**: `DONE`
- **Objetivo**: revisar y ordenar paginas legales/comerciales minimas para ecommerce local simulado sin claims sanitarios ni promesas legales definitivas.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: copy legal/comercial frontend, rutas informativas, footer, checkout, SEO noindex y tests de contratos legales.
- **Fuera de alcance**: asesoramiento legal definitivo, cookies de terceros, pago real, backend, claims sanitarios o go-live externo.
- **Criterio de cierre**: paginas de confianza enlazadas, copy responsable, limites de producto visibles, checkout enlazado a condiciones/privacidad y tests pasando.
- **Evidencia de cierre ELS-022**:
  - `PAGINAS_LEGALES_COMERCIALES` cubre condiciones, envios, devoluciones, privacidad y contacto;
  - existen rutas `/devoluciones` y `/contacto`;
  - footer y checkout enlazan las paginas clave;
  - contrato SEO marca devoluciones/contacto como publicas no estrategicas noindex;
  - tests legales, footer, checkout y SEO pasan.
- **Bloqueo conocido**: ninguno.

## ELS-023 - Guardrail legacy demo congelado
- **Estado**: `DONE`
- **Objetivo**: congelar formalmente `/encargo`, `/pedido-demo`, `PedidoDemo` y `cuenta-demo` como legacy controlado, impidiendo que nuevas capacidades vuelvan a depender de ellos.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: documentacion de congelado legacy, guardrail estatico en gate local y tests de script.
- **Fuera de alcance**: borrar legacy, migrar datos demo, reescribir checkout, tocar pago, cuenta real o backend funcional.
- **Criterio de cierre**: gate local detecta dependencias demo en checkout real, CTAs a `/pedido-demo`, `cuenta-demo` en navegacion principal y permite `/encargo` solo como warning de consulta secundaria.
- **Evidencia de cierre ELS-023**:
  - `scripts/check_ecommerce_local_simulado.py` incorpora checks `checkout_real_sin_pedido_demo`, `navegacion_principal_cuenta_demo` y `encargo_consulta_secundaria`;
  - tests de script cubren blocker por demo en checkout, blocker por cuenta demo en navegacion, warning de `/encargo` secundario y ausencia de archivos opcionales;
  - roadmap local documenta estado congelado, prohibiciones nuevas y retirada futura.
- **Bloqueo conocido**: ninguno.

## ELS-024 - Operativa local ecommerce simulado
- **Estado**: `DONE`
- **Objetivo**: crear una guia operativa local unica para levantar, poblar, probar y validar ecommerce real local con pago simulado.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: documentacion operativa local, enlaces desde fuente viva y checks documentales/gate no destructivos.
- **Fuera de alcance**: codigo funcional, deploy Railway, pago real, scripts nuevos o desbloquear `V2-R10`.
- **Criterio de cierre**: guia clara, comandos no inventados, distincion real/simulado/legacy, troubleshooting y checks documentales pasando.
- **Evidencia de cierre ELS-024**:
  - existe `docs/operativa_ecommerce_local_simulado.md`;
  - la guia cubre backend, frontend, bootstrap, cuenta real, compra local, pago simulado, pedido, documento, admin, gates, tests, legacy y troubleshooting;
  - comandos no destructivos y helps de scripts fueron verificados;
  - roadmap local y estado implementacion enlazan la guia.
- **Bloqueo conocido**: ninguno.

## ELS-025 - Checklist final de presentacion portfolio/ecommerce local
- **Estado**: `DONE`
- **Objetivo**: crear una checklist final para validar si la web esta presentable como pieza portfolio/ecommerce local real con pago simulado, sin venderla como produccion real.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: documentacion de checklist, enlaces desde fuente viva y checks documentales/gate local.
- **Fuera de alcance**: implementar features, corregir bugs funcionales grandes, cerrar `V2-R10`, tocar frontend/backend funcional o crear automatizaciones nuevas.
- **Criterio de cierre**: checklist util, accionable, enlazada, con limitaciones explicitas y sin declarar go-live real.
- **Evidencia de cierre ELS-025**:
  - existe `docs/checklist_presentacion_ecommerce_local.md`;
  - la checklist cubre superficies UX/producto/operacion/calidad y limites conocidos;
  - incluye guion de demo, promesas prohibidas y siguiente salto real;
  - roadmap local y estado implementacion enlazan la checklist.
- **Bloqueo conocido**: ninguno.

## ELS-026 - Catalogo vendible por seccion
- **Estado**: `DONE`
- **Objetivo**: auditar y corregir coherencia del catalogo vendible para que cada producto publico comprable tenga contrato comercial completo por seccion.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: contrato de test, bootstrap local, documentacion de criterios de catalogo vendible y checks de catalogo/gate.
- **Fuera de alcance**: productos masivos, imagenes nuevas, pasarela, pedidos, borrado legacy, Stripe real o redisenos globales.
- **Criterio de cierre**: secciones abiertas con minimos vendibles, ningun producto incompleto como comprable, test verificable y gate local pasando.
- **Evidencia de cierre ELS-026**:
  - `scripts/bootstrap_ecommerce_local_simulado.py` crea 14 productos locales comprables con inventario compatible;
  - `tests/nucleo_herbal/test_catalogo_vendible_local.py` audita contrato vendible y minimos por seccion;
  - `docs/06_catalogo_y_taxonomias.md` documenta criterios de producto vendible y seccion publicable local;
  - checks de catalogo, bootstrap, `manage.py check` y gate local pasan.
- **Bloqueo conocido**: ninguno.

## ELS-027 - Errores y estados vacios comerciales
- **Estado**: `DONE`
- **Objetivo**: mejorar estados vacios, errores y bloqueos del flujo comercial para que catalogo, cesta, checkout y pedido no muestren pantallas rotas ni codigos tecnicos.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: helpers puros de mensajes, UI frontend de ficha/listado/checkout/recibo y tests frontend relacionados.
- **Fuera de alcance**: backend funcional, pasarela, Stripe, legal/copy global, borrado legacy o cambios de negocio.
- **Criterio de cierre**: bloqueos comerciales con mensaje claro y siguiente accion; UI publica sin codigos internos; checkout/build/tests pasando.
- **Evidencia de cierre ELS-027**:
  - `estadosComercialesPedido.ts` centraliza traduccion de errores de pedido/stock/pago;
  - `pedidos.ts`, `FlujoCheckoutReal` y `ReciboPedidoReal` consumen mensajes humanos;
  - Botica Natural cubre seccion vacia, producto no encontrado y producto sin stock con CTAs utiles;
  - tests de checkout, cesta y Botica Natural pasan.
- **Bloqueo conocido**: ninguno.

## ELS-028 - Estabilidad visual de secciones comerciales
- **Estado**: `DONE`
- **Objetivo**: unificar presentacion visual y funcional de secciones comerciales para que compartan hero, catalogo, tarjetas, CTAs, stock y estados.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: frontend de secciones comerciales, componentes comunes de seccion/listado, configuracion de contenido y tests de catalogo/secciones.
- **Fuera de alcance**: backend, imagenes/binarios, stock, pago, checkout, SEO nuevo, animaciones pesadas o rediseño global.
- **Criterio de cierre**: secciones comerciales coherentes, menos duplicacion, CTAs/estados consistentes y build pasando.
- **Evidencia de cierre ELS-028**:
  - `SeccionComercialProductos` y `ListadoProductosSeccionComercial` concentran estructura comun;
  - `seccionesComerciales.ts` centraliza contenido por seccion;
  - `botica-natural`, `velas-e-incienso`, `minerales-y-energia` y `herramientas-esotericas` usan la misma composicion;
  - tests de Botica Natural, home/secciones, catalogo, fichas y build pasan.
- **Bloqueo conocido**: ninguno.

## ELS-029 - Plan retirada legacy demo
- **Estado**: `DONE`
- **Objetivo**: crear un plan tecnico de retirada gradual para `/encargo`, `/pedido-demo`, `PedidoDemo` y `cuenta-demo`, sin ejecutar la retirada.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: documentacion del plan, enlaces desde documentacion viva y checks documentales/gate local.
- **Fuera de alcance**: borrar codigo legacy, tocar rutas, modelos, migraciones, datos, frontend funcional o tests.
- **Criterio de cierre**: plan claro, enlazado, con inventario, fases verificables, rollback, riesgos y sin declarar legacy eliminado.
- **Evidencia de cierre ELS-029**:
  - existe `docs/plan_retirada_legacy_demo.md`;
  - el plan inventaria rutas, componentes, endpoints, modelos, tablas, migraciones, tests, datos persistidos y dependencias legacy;
  - define fases A-G con precondiciones, cambios permitidos/prohibidos, tests obligatorios y rollback;
  - `docs/roadmap_ecommerce_local_simulado.md` y `docs/90_estado_implementacion.md` enlazan o registran el plan.
- **Bloqueo conocido**: ninguno.

## ELS-030 - Auditoria final automatizable
- **Estado**: `DONE`
- **Objetivo**: crear una auditoria final documental y automatizable que consolide el estado del ecommerce local simulado y detecte blockers antes de presentacion u optimizacion.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: documento de auditoria, script de solo lectura, tests de script, enlaces/documentacion viva.
- **Fuera de alcance**: corregir todos los problemas detectados, tocar UX, pago, catalogo funcional, cerrar `V2-R10`, activar Stripe o borrar legacy.
- **Criterio de cierre**: auditoria con salida texto/JSON, severidades `OK/WARNING/BLOCKER`, tests y documentacion de diferencia local vs go-live real.
- **Evidencia de cierre ELS-030**:
  - existe `docs/auditoria_final_ecommerce_local_simulado.md`;
  - existe `scripts/audit_ecommerce_local_simulado.py`;
  - tests de auditoria cubren fixture valido, roadmap ausente, `V2-R10` desbloqueado, adaptador simulado ausente y legacy no congelado;
  - `docs/operativa_ecommerce_local_simulado.md`, `docs/roadmap_ecommerce_local_simulado.md` y `docs/90_estado_implementacion.md` referencian la auditoria.
- **Bloqueo conocido**: ninguno.

## ELS-031 - Recorrido de presentacion
- **Estado**: `DONE`
- **Objetivo**: definir un recorrido estable para ensenar a terceros el ecommerce local real con pago simulado, sin fingir produccion ni reactivar legacy.
- **Documento rector principal**: `docs/checklist_presentacion_ecommerce_local.md`.
- **Alcance permitido**: documentacion de guion, enlaces desde documentacion viva y checks documentales/gate local.
- **Fuera de alcance**: nuevas features, pago real, deploy, borrado legacy, videos/capturas o cambios funcionales.
- **Criterio de cierre**: guion usable con rutas, datos, acciones, resultados, frases, riesgos y recuperacion; limites explicitos y legacy fuera del flujo principal.
- **Evidencia de cierre ELS-031**:
  - existe `docs/guion_demo_ecommerce_local.md`;
  - el guion cubre home, catalogo, ficha, cesta, checkout, pago simulado, pedido, documento, cuenta real y admin;
  - documenta que no se debe prometer produccion, Stripe activo, cumplimiento legal final, facturacion legal completa ni claims medicos;
  - `docs/roadmap_ecommerce_local_simulado.md`, `docs/90_estado_implementacion.md` y `docs/operativa_ecommerce_local_simulado.md` referencian el guion.
- **Bloqueo conocido**: ninguno.

## ELS-032 - Stripe reservado
- **Estado**: `DONE`
- **Objetivo**: preparar y documentar el cambio futuro de `simulado_local` a `stripe`, sin activar Stripe real ni cambiar el default local.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: documentacion de pagos local/Stripe futuro, guardrail de proveedor en gate local, tests de configuracion/wiring y enlaces documentales.
- **Fuera de alcance**: activar Stripe real, crear sesiones nuevas, tocar webhooks funcionales, checkout frontend, deploy o cerrar `V2-R10`.
- **Criterio de cierre**: local sigue en `simulado_local`, Stripe queda reservado/documentado, configuracion invalida falla claro, no se exigen claves Stripe en local y tests/checks pasan.
- **Evidencia de cierre ELS-032**:
  - existe `docs/pagos_modo_local_y_stripe.md`;
  - `scripts/check_ecommerce_local_simulado.py` verifica `BOTICA_PAYMENT_PROVIDER` del entorno;
  - tests cubren local sin claves Stripe, proveedor entorno `stripe` como warning y proveedor desconocido como blocker;
  - `docs/release_readiness_minima.md` diferencia release real con Stripe de fase local simulada.
- **Bloqueo conocido**: ninguno.

## ELS-033 - Staging futuro
- **Estado**: `DONE`
- **Objetivo**: preparar documentacion y checks minimos para un futuro entorno staging, sin desplegar, activar servicios externos, activar Stripe ni desbloquear `V2-R10`.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: documentacion de staging futuro, enlaces desde documentacion viva y checks documentales/gate local.
- **Fuera de alcance**: deploy, infraestructura Railway real, backup/restore real, cambios productivos, secretos, Stripe real/sandbox activo o cierre de `V2-R10`.
- **Criterio de cierre**: guia staging futura existente, distingue local/staging/produccion, documenta variables/servicios/checks/rollback y reafirma limites.
- **Evidencia de cierre ELS-033**:
  - existe `docs/preparacion_staging_ecommerce.md`;
  - la guia documenta variables, servicios, base temporal, URLs, pago `simulado_local`, checks pre/post deploy y rollback;
  - `docs/roadmap_ecommerce_local_simulado.md`, `docs/90_estado_implementacion.md` y `docs/roadmap_ecommerce_real_v2.md` referencian la preparacion sin desbloquear `V2-R10`;
  - no se despliega, no se ejecuta backup/restore real y no se activa Stripe.
- **Bloqueo conocido**: ninguno.

## ELS-034 - Auditoria dependencias demo/real
- **Estado**: `DONE`
- **Objetivo**: auditar dependencias entre modulos demo legacy y modulos reales para detectar acoplamientos indebidos antes de seguir optimizando.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: auditoria documental, guardrail estatico, correcciones pequenas de acoplamiento y tests afectados.
- **Fuera de alcance**: refactors grandes, borrado legacy, migracion de datos, UX, pagos funcionales, Stripe o ruptura de tests legacy.
- **Criterio de cierre**: mapa demo/real documentado, blockers corregidos o documentados, guardrail protege casos principales y checks pasan.
- **Evidencia de cierre ELS-034**:
  - existe `docs/auditoria_dependencias_demo_real.md`;
  - `checkoutReal.ts` ya no importa tipos desde `checkoutDemo`;
  - el gate local bloquea imports demo desde modulos reales y advierte por `encargoConsulta` como adaptador transitorio;
  - tests de script cubren el nuevo bloqueo y el warning controlado.
- **Bloqueo conocido**: ninguno; queda warning documentado para extraer preseleccion compartida en fase futura.

## ELS-035 - Estado unico documental
- **Estado**: `DONE`
- **Objetivo**: consolidar documentacion viva para que no existan contradicciones entre fase local simulada, ecommerce real V2, demo legacy, `V2-R10` bloqueado y roadmap futuro.
- **Documento rector principal**: `docs/90_estado_implementacion.md`.
- **Alcance permitido**: documentacion viva, notas de normalizacion historica, enlaces cruzados, precedencia documental y checks documentales/locales.
- **Fuera de alcance**: codigo funcional, tests, borrado de legacy, cierre de `V2-R10`, produccion, Stripe real o roadmap funcional nuevo.
- **Criterio de cierre**: un agente puede identificar flujo vigente, legacy, Stripe reservado, go-live bloqueado y siguiente paso sin contradicciones.
- **Evidencia de cierre ELS-035**:
  - `docs/90_estado_implementacion.md` incorpora lectura rapida para agentes;
  - documentos historicos de vision/alcance/checkout demo/migracion quedan normalizados sin borrarse;
  - `docs/99_fuente_de_verdad.md` enlaza la fase local simulada en la precedencia documental;
  - busqueda de terminos conflictivos y gate local pasan sin blockers.
- **Bloqueo conocido**: ninguno.

## ELS-036 - Barrido deuda menor ecommerce local
- **Estado**: `DONE`
- **Objetivo**: auditar `TODO`, `FIXME`, `HACK`, comentarios obsoletos, deuda pequena y restos de lenguaje demo/legacy que puedan afectar al ecommerce local simulado sin abrir refactors grandes.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: busqueda y clasificacion de marcadores, correcciones documentales pequenas, informe de deuda residual, actualizacion de documentacion viva y checks documentales/locales.
- **Fuera de alcance**: refactors grandes, borrado legacy, migraciones destructivas, cambios de arquitectura, UX mayor, Stripe real, deploy o cierre de `V2-R10`.
- **Criterio de cierre**: marcadores auditados, deuda menor segura corregida, deuda residual documentada, sin blockers nuevos y checks pasan.
- **Evidencia de cierre ELS-036**:
  - existe `docs/deuda_residual_ecommerce_local.md`;
  - `docs/roadmap_ecommerce_local_simulado.md` corrige titulos duplicados de ELS-23/ELS-24;
  - `docs/90_estado_implementacion.md` registra el barrido y reglas activas;
  - gate local y auditoria final pasan sin blockers.
- **Bloqueo conocido**: ninguno; queda como deuda mayor extraer `encargoConsulta` a helper neutral.

## ELS-037 - Entorno local reproducible
- **Estado**: `DONE`
- **Objetivo**: dejar definido y verificable el contrato minimo para levantar ecommerce local simulado sin ambiguedad: variables, comandos, datos, backend, frontend, pago simulado y gates.
- **Documento rector principal**: `docs/operativa_ecommerce_local_simulado.md`.
- **Alcance permitido**: `.env.example` local sin secretos, checklist reproducible, script de solo lectura, tests de script y enlaces en documentacion viva.
- **Fuera de alcance**: Docker, instalador pesado, servicios externos, deploy, Stripe real, base SQLite versionada, servidores persistentes o cierre de `V2-R10`.
- **Criterio de cierre**: variables locales claras, comandos reales documentados, proveedor simulado por defecto recomendado, script/test si hay logica y checks pasando.
- **Evidencia de cierre ELS-037**:
  - existe `.env.example`;
  - existe `docs/checklist_entorno_local_ecommerce.md`;
  - existe `scripts/check_entorno_local_ecommerce.py`;
  - tests del script cubren contrato minimo, blockers y salida JSON;
  - gate local sigue sin blockers.
- **Bloqueo conocido**: ninguno.

## ELS-038 - Mapa final de rutas
- **Estado**: `DONE`
- **Objetivo**: auditar y documentar el mapa final de rutas publicas, privadas, transaccionales y legacy para evitar confusion entre flujo real, pago simulado y demo legacy.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: documento de mapa de rutas, auditoria de CTAs/SEO, guardrail estatico pequeno y tests del gate.
- **Fuera de alcance**: borrar rutas legacy, cambiar arquitectura de routing, crear paginas funcionales nuevas, activar Stripe, tocar pago o cerrar `V2-R10`.
- **Criterio de cierre**: mapa creado, rutas clasificadas, CTAs principales sin legacy, transaccionales noindex y gate/tests actualizados si aplica.
- **Evidencia de cierre ELS-038**:
  - existe `docs/mapa_rutas_ecommerce_local.md`;
  - el gate local valida la presencia del mapa;
  - tests del gate cubren ausencia de mapa;
  - SEO/navegacion se validan con tests frontend existentes.
- **Bloqueo conocido**: ninguno.

## ELS-039 - Cierre roadmap local simulado
- **Estado**: `DONE`
- **Objetivo**: cerrar documentalmente el roadmap de ecommerce local simulado si los hitos principales estan completados y dejar proximos hitos separados sin mezclarlos con go-live real.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: actualizacion documental de estado final, evidencias, pendientes, limites y proximos hitos fuera de alcance.
- **Fuera de alcance**: implementar pendientes, cerrar go-live, tocar codigo funcional, borrar legacy, modificar tests, desplegar, activar Stripe o cerrar `V2-R10`.
- **Criterio de cierre**: roadmap local con estado claro, local simulado separado de produccion, proximos hitos fuera del cierre y documentacion viva coherente.
- **Evidencia de cierre ELS-039**:
  - `docs/roadmap_ecommerce_local_simulado.md` queda en estado `CERRADO_LOCALMENTE`;
  - `docs/90_estado_implementacion.md` registra el cierre local, flujo vigente, legacy deprecado, pago simulado activo, Stripe reservado y `V2-R10` bloqueado;
  - no quedan hitos `PARTIAL`, `BLOCKED` ni `NOT_STARTED` dentro del roadmap local;
  - gate local y auditoria final pasan sin `BLOCKER`.
- **Bloqueo conocido**: ninguno para cierre local; `V2-R10` sigue bloqueado fuera de este roadmap.

## ELS-040 - Auditoria de merge final
- **Estado**: `DONE`
- **Objetivo**: auditar el resultado completo del roadmap ecommerce local simulado antes de merge/revision final y emitir dictamen claro.
- **Documento rector principal**: `docs/roadmap_ecommerce_local_simulado.md`.
- **Alcance permitido**: revision de diff, arquitectura, seguridad, UX, tests/gates, checks finales y correcciones menores imprescindibles de contrato/test/documentacion.
- **Fuera de alcance**: nuevas features, refactors grandes, activacion Stripe, cierre `V2-R10`, borrado legacy, deploy o cambios funcionales no imprescindibles.
- **Criterio de cierre**: dictamen `MERGEABLE`, `MERGEABLE_WITH_WARNINGS` o `NOT_MERGEABLE`, checks finales ejecutados, blockers/warnings concretos y sin binarios indeseados.
- **Evidencia de cierre ELS-040**:
  - diff auditado por estado, stat, binarios, migraciones, pagos, rutas, documentacion y tests;
  - checks backend, frontend, gate local, auditoria final, build y `git diff --check` ejecutados;
  - se corrigio un fixture de test de auditoria para incluir el mapa de rutas exigido por el gate vigente;
  - se sustituyeron placeholders Stripe con forma de secreto por marcadores angulares en documentacion.
- **Dictamen**: `MERGEABLE_WITH_WARNINGS`.
- **Bloqueo conocido**: ninguno; quedan warnings controlados de legacy, preseleccion heredada y ausencia de staging/E2E/go-live real.
