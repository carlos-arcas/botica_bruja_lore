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
- **Estado**: `TODO`
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
- **Bloqueo conocido**: ninguno.
