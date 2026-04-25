# Roadmap operativo Codex (fuente de ejecuciÃ³n atÃ³mica)

## Reglas de uso obligatorias
1. Este archivo gobierna la ejecuciÃ³n autÃ³noma diaria de Codex en este repo.
2. Codex debe seleccionar siempre la **primera tarea `TODO` no `BLOCKED`**.
3. Se ejecuta **una sola tarea por corrida**.
4. EstÃ¡ prohibido cambiar el orden sin justificarlo en `docs/bitacora_codex.md`.
5. No se marca `DONE` sin evidencia verificable y checks registrados.

## Estados permitidos
- `TODO`: pendiente y ejecutable.
- `DONE`: cerrada con evidencia.
- `BLOCKED`: detenida por dependencia o contradicciÃ³n documentada.

### Contrato operativo del estado `BLOCKED`
Una tarea puede pasar a `BLOCKED` solo cuando no puede cerrarse con seguridad sin salir del alcance aprobado.

Condiciones mÃ­nimas obligatorias para marcar `BLOCKED`:
1. Existe impedimento verificable (dependencia, contradicciÃ³n documental o restricciÃ³n externa concreta).
2. La entrada correspondiente en `docs/bitacora_codex.md` queda registrada con plantilla `BLOCKED` completa.
3. Se define una Ãºnica siguiente acciÃ³n exacta y verificable (no genÃ©rica).
4. Se fija criterio explÃ­cito de desbloqueo y fecha/punto de revisiÃ³n.

Uso prohibido:
- Marcar `BLOCKED` por incertidumbre vaga o falta de anÃ¡lisis.
- Marcar `BLOCKED` sin evidencia verificable y sin dependencia identificada.

---

## Matriz de trazabilidad documental por tarea

| Tarea | TÃ­tulo corto | Documento rector principal | Documentos secundarios de apoyo | Ãmbito gobernado | Motivo de asignaciÃ³n | Nota operativa |
|---|---|---|---|---|---|---|
| `CRX-001` | Bootstrap gobernanza | `AGENTS.md` | `docs/99_fuente_de_verdad.md`, `docs/08_decisiones_tecnicas_no_negociables.md`, `docs/90_estado_implementacion.md` | marco operativo diario, definiciÃ³n de DONE documental, lÃ­mites de ejecuciÃ³n | La tarea crea el sistema operativo de Codex; el contrato directo de ejecuciÃ³n estÃ¡ en `AGENTS.md` y debe alinearse con precedencia/estado real. | Cierre vÃ¡lido solo con evidencia verificable en roadmap + bitÃ¡cora. |
| `CRX-002` | Matriz de trazabilidad | `docs/99_fuente_de_verdad.md` | `docs/90_estado_implementacion.md`, `docs/08_decisiones_tecnicas_no_negociables.md`, `docs/14_roadmap.md`, `docs/roadmap_cierre_ecommerce_real_incremental.md`, `docs/roadmap_ecommerce_real_v2.md` | precedencia documental por tarea y relaciÃ³n plan vs estado | `99` define jerarquÃ­a y resoluciÃ³n de conflictos; esta tarea depende de mapear quÃ© documento manda por Ã¡mbito y cuÃ¡ndo prevalece estado real. | Si emerge tensiÃ³n, se registra para `CRX-004` sin resolverla aquÃ­. |
| `CRX-003` | PolÃ­tica `BLOCKED` | `AGENTS.md` | `docs/99_fuente_de_verdad.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md` | protocolo de bloqueo/desbloqueo, campos mÃ­nimos, trazabilidad operativa | El protocolo `BLOCKED` estÃ¡ normado explÃ­citamente en `AGENTS.md` (diagnÃ³stico, causa, evidencia, siguiente acciÃ³n) y debe heredarse en roadmap/bitÃ¡cora. | No habilita cambios de producto ni de CI; solo gobierno documental. |
| `CRX-004` | Tensiones documentales | `docs/99_fuente_de_verdad.md` | `docs/90_estado_implementacion.md`, `docs/14_roadmap.md`, `docs/roadmap_cierre_ecommerce_real_incremental.md`, `docs/roadmap_ecommerce_real_v2.md`, `docs/ciclos/ciclo_03_reencauce_control.md` | identificaciÃ³n/priorizaciÃ³n de contradicciones, decisiÃ³n por precedencia, preparaciÃ³n de resoluciÃ³n | El mandato de `99` exige resolver por Ã¡mbito y especificidad; en conflicto planificado vs implementado prevalece `90`. | TensiÃ³n preparada: `docs/14_roadmap.md` fija secuencia macro C1â†’C6, mientras `docs/90_estado_implementacion.md` declara ciclos/evoluciones posteriores ya implementadas; tratar en `CRX-004`. |
| `CRX-005` | Checklist de cierre | `AGENTS.md` | `docs/08_decisiones_tecnicas_no_negociables.md`, `docs/99_fuente_de_verdad.md`, `docs/90_estado_implementacion.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md` | checklist de salida por ejecuciÃ³n (selecciÃ³n, evidencia, checks, estado final) | `AGENTS.md` fija checks mÃ­nimos por corrida y actualizaciÃ³n obligatoria de roadmap/bitÃ¡cora; `08` y `99` acotan calidad y precedencia. | Debe incluir verificaciÃ³n explÃ­cita de â€œdefinido vs implementadoâ€ usando `90`. |
| `CRX-006` | Reencuadre V2-R10 | `docs/roadmap_ecommerce_real_v2.md` | `AGENTS.md`, `docs/90_estado_implementacion.md`, `docs/13_testing_ci_y_quality_gate.md`, `docs/release_readiness_minima.md`, `docs/deploy_railway.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md` | reactivaciÃ³n del roadmap atÃ³mico y alineaciÃ³n con el siguiente incremento vivo | `docs/roadmap_codex.md` quedÃ³ sin tareas `TODO` mientras `V2-R10` sigue `PLANNED`; antes de implementar hace falta restaurar una fuente de ejecuciÃ³n atÃ³mica vigente. | Cierre vÃ¡lido solo si queda una primera `TODO` no `BLOCKED` con perÃ­metro claro y trazado en bitÃ¡cora. |
| `V2G-001` | AuditorÃ­a cierre go-live v2 | `docs/roadmap_ecommerce_real_v2.md` | `docs/release_readiness_minima.md`, `docs/13_testing_ci_y_quality_gate.md`, `docs/deploy_railway.md`, `docs/90_estado_implementacion.md`, `scripts/check_release_gate.py`, `scripts/check_release_readiness.py`, `scripts/check_deployed_stack.py`, `scripts/backup_restore_postgres.py`, `tests/scripts/` | auditorÃ­a de cierre y brecha real del incremento `V2-R10` | `V2-R10` estÃ¡ `PLANNED`, pero no desglosado a nivel atÃ³mico; primero hay que decidir con evidencia quÃ© parte ya existe y quÃ© falta realmente. | Si el cierre depende de entorno desplegado real, documentar `BLOCKED` con criterio de desbloqueo externo y sin improvisar cambios de producto. |

## CRX-001 â€” Bootstrap de gobernanza Codex
- **Estado**: `DONE`
- **Objetivo**: dejar operativo el sistema AGENTS + roadmap + bitÃ¡cora para ejecuciÃ³n autÃ³noma disciplinada.
- **Alcance permitido**: `AGENTS.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: cÃ³digo de producto, pipelines, modelos, migraciones, frontend/backend funcional.
- **Capas permitidas/prohibidas**: solo gobernanza documental; prohibido tocar dominio/aplicaciÃ³n/infraestructura/presentaciÃ³n del producto.
- **Archivos o zonas probables**: rutas anteriores y referencias a `docs/99_fuente_de_verdad.md`, `docs/08_decisiones_tecnicas_no_negociables.md`, `docs/90_estado_implementacion.md`.
- **Checks obligatorios**:
  - existencia de archivos de gobernanza,
  - referencias a rutas reales,
  - consistencia de estados en roadmap,
  - diff dentro del perÃ­metro permitido.
- **Criterio de cierre**: sistema operativo de gobernanza creado y trazado en bitÃ¡cora.
- **Bloqueo conocido**: ninguno.

## CRX-002 â€” Matriz de trazabilidad roadmap Codex â†” fuentes base
- **Estado**: `DONE`
- **Objetivo**: aÃ±adir en `docs/roadmap_codex.md` una matriz breve que vincule cada tarea activa con su documento rector (`99`, `08`, `90`, roadmaps de ciclo/V2).
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: cambios de estado ficticios en `docs/90_estado_implementacion.md`; cambios de cÃ³digo.
- **Capas permitidas/prohibidas**: solo gobernanza documental.
- **Archivos o zonas probables**: secciÃ³n nueva â€œTrazabilidad documental por tareaâ€ en este roadmap.
- **Checks obligatorios**:
  - todas las tareas `TODO` con fuente rectora explÃ­cita,
  - rutas citadas existentes,
  - sin contradicciÃ³n con precedencia de `docs/99_fuente_de_verdad.md`.
- **Criterio de cierre**: matriz creada y validada, con registro en bitÃ¡cora.
- **Bloqueo conocido**: ninguno.

## CRX-003 â€” PolÃ­tica de bloqueo y desbloqueo operativo
- **Estado**: `DONE`
- **Objetivo**: endurecer el protocolo `BLOCKED` en roadmap + bitÃ¡cora (campos mÃ­nimos, SLA de revisiÃ³n, acciÃ³n exacta siguiente).
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, `AGENTS.md`.
- **Fuera de alcance**: crear tooling nuevo, modificar gates de cÃ³digo.
- **Capas permitidas/prohibidas**: solo gobernanza documental.
- **Archivos o zonas probables**: secciones de reglas operativas y plantilla de entrada de bloqueo.
- **Checks obligatorios**:
  - definiciÃ³n explÃ­cita de diagnÃ³stico/causa/evidencia/siguiente paso,
  - consistencia entre AGENTS y bitÃ¡cora.
- **Criterio de cierre**: protocolo Ãºnico de bloqueo documentado y aplicado al menos en un ejemplo de plantilla.
- **Bloqueo conocido**: ninguno.

## CRX-004 â€” ResoluciÃ³n de tensiones documentales prioritarias
- **Estado**: `DONE`
- **Objetivo**: identificar y documentar contradicciones de alto impacto entre estado real (`docs/90`) y planes (`docs/14`, `docs/roadmap_*`) sin declarar cierres no implementados.
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md` y, solo si es imprescindible, nota puntual en un doc de roadmap existente.
- **Fuera de alcance**: reescritura masiva de documentos histÃ³ricos.
- **Capas permitidas/prohibidas**: solo gobernanza documental.
- **Archivos o zonas probables**: secciones de â€œconflictos abiertosâ€ y â€œdecisiÃ³n aplicada por precedenciaâ€.
- **Checks obligatorios**:
  - cada tensiÃ³n con evidencia textual concreta,
  - decisiÃ³n trazada a regla de precedencia de `docs/99_fuente_de_verdad.md`.
- **Criterio de cierre**: lista priorizada de tensiones y acciÃ³n exacta para cada una.
- **Evidencia de cierre CRX-004**: secciÃ³n `Tensiones documentales prioritarias y decisiÃ³n aplicada` con fichas TDX-01 a TDX-03 y precedencia explÃ­cita aplicada.
- **Bloqueo conocido**: posible necesidad de decisiÃ³n humana en conflictos de producto no resolubles por precedencia automÃ¡tica.


## Tensiones documentales prioritarias y decisiÃ³n aplicada

> Criterio aplicado: resolver por precedencia de `docs/99_fuente_de_verdad.md`; en conflicto planificado vs implementado, manda `docs/90_estado_implementacion.md`; en conflicto normativo/tÃ©cnico, manda `docs/08_decisiones_tecnicas_no_negociables.md`.

### TDX-01 â€” Secuencia macro histÃ³rica C1â†’C6 vs estado real implementado posterior
- **Prioridad**: `P0` (crÃ­tica).
- **Documentos en conflicto**: `docs/14_roadmap.md` vs `docs/90_estado_implementacion.md`.
- **Evidencia concreta**:
  - `docs/14_roadmap.md` fija la secuencia fuerte C1â†’C6 y sitÃºa C3/C4/C5 como pasos futuros de esa progresiÃ³n.
  - `docs/90_estado_implementacion.md` declara capacidades/evoluciones posteriores ya implementadas (por ejemplo cuenta real, pago real, incrementos V2) y no solo planificaciÃ³n.
- **Ãmbito del conflicto**: interpretaciÃ³n del estado real y selecciÃ³n correcta de trabajo.
- **Documento que prevalece**: `docs/90_estado_implementacion.md` (estado real implementado).
- **DecisiÃ³n operativa aplicada**: para decidir quÃ© estÃ¡ hecho y quÃ© falta, Codex debe tratar `docs/14_roadmap.md` como marco histÃ³rico de secuencia y usar `docs/90_estado_implementacion.md` como verdad factual vigente.
- **Impacto prÃ¡ctico para futuros agentes**: queda prohibido rebajar capacidades reales a â€œplanificadasâ€ por seguir literalidad histÃ³rica de C1â†’C6.
- **AcciÃ³n siguiente exacta**: al iniciar cada tarea, validar el estado de la capacidad en `docs/90_estado_implementacion.md` antes de interpretar cualquier roadmap histÃ³rico.
- **Â¿Requiere decisiÃ³n humana adicional?**: `No`.

### TDX-02 â€” Criterio de DONE entre roadmaps histÃ³ricos (PLANNED/IN_PROGRESS/DONE) y tablero operativo Codex
- **Prioridad**: `P1` (alta).
- **Documentos en conflicto**: `docs/roadmap_cierre_ecommerce_real_incremental.md`, `docs/roadmap_ecommerce_real_v2.md` vs `docs/90_estado_implementacion.md` y `AGENTS.md`.
- **Evidencia concreta**:
  - Los roadmaps histÃ³ricos documentan cierres por incremento (`Rxx`, `V2-Rxx`) con narrativa propia.
  - `docs/90_estado_implementacion.md` define el tablero factual de capacidades y estados oficiales del proyecto.
  - `AGENTS.md` prohÃ­be declarar `DONE` sin evidencia verificable.
- **Ãmbito del conflicto**: criterio de DONE y coherencia entre documentaciÃ³n de ejecuciÃ³n histÃ³rica y estado operativo vigente.
- **Documento que prevalece**: `docs/90_estado_implementacion.md` para estado de implementaciÃ³n; `AGENTS.md` + `docs/08_decisiones_tecnicas_no_negociables.md` para regla de cierre verificable.
- **DecisiÃ³n operativa aplicada**: un `DONE` en roadmap histÃ³rico se acepta solo como antecedente; la lectura operativa final del estado vigente se toma de `docs/90_estado_implementacion.md`.
- **Impacto prÃ¡ctico para futuros agentes**: evita declarar cierre ficticio por arrastre de narrativa histÃ³rica sin confirmar estado factual vigente.
- **AcciÃ³n siguiente exacta**: cuando un histÃ³rico indique `DONE`, contrastarlo con la capacidad equivalente en `docs/90_estado_implementacion.md` antes de usarlo como base de ejecuciÃ³n.
- **Â¿Requiere decisiÃ³n humana adicional?**: `No`.

### TDX-03 â€” Deriva de alcance del Ciclo 3 vs reglas de continuidad actuales
- **Prioridad**: `P1` (alta).
- **Documentos en conflicto**: `docs/ciclos/ciclo_03_reencauce_control.md` vs trazas de avance acumulado en `docs/90_estado_implementacion.md`.
- **Evidencia concreta**:
  - `docs/ciclos/ciclo_03_reencauce_control.md` fija que no se abre nueva feature fuera del roadmap oficial de Ciclo 3.
  - `docs/90_estado_implementacion.md` registra mÃºltiples evoluciones posteriores (ecommerce real/V2) ya ejecutadas.
- **Ãmbito del conflicto**: coherencia de selecciÃ³n de trabajo por ciclo frente a evoluciÃ³n real posterior.
- **Documento que prevalece**: `docs/90_estado_implementacion.md` para estado implementado; `docs/ciclos/ciclo_03_reencauce_control.md` se interpreta como control histÃ³rico puntual de reencauce.
- **DecisiÃ³n operativa aplicada**: la regla â€œno abrir nueva featureâ€ se aplica al contexto de su microciclo de reencauce, no como bloqueo perpetuo de todas las evoluciones posteriores ya implementadas y registradas en `docs/90`.
- **Impacto prÃ¡ctico para futuros agentes**: elimina bloqueo falso por lectura descontextualizada del reencauce de Ciclo 3.
- **AcciÃ³n siguiente exacta**: usar `docs/roadmap_codex.md` para selecciÃ³n de tarea actual y `docs/90` para validar que no se contradice estado real.
- **Â¿Requiere decisiÃ³n humana adicional?**: `SÃ­`, solo para definir si se desea una nota aclaratoria en el propio documento de reencauce (fuera del alcance de CRX-004).


## CRX-005 â€” Checklist mÃ­nimo de cierre por ejecuciÃ³n Codex
- **Estado**: `DONE`
- **Objetivo**: estandarizar checklist final reutilizable para ejecuciones (selecciÃ³n de tarea, evidencia, checks, actualizaciÃ³n de bitÃ¡cora/roadmap).
- **Alcance permitido**: `AGENTS.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: cambios de CI o scripts.
- **Capas permitidas/prohibidas**: solo gobernanza documental.
- **Archivos o zonas probables**: secciÃ³n â€œchecklist de salidaâ€ en AGENTS o bitÃ¡cora.
- **Checks obligatorios**:
  - checklist sin ambigÃ¼edades,
  - alineado con criterios DONE del repo.
- **Criterio de cierre**: checklist operativo aÃ±adido y usado en una entrada real de bitÃ¡cora.
- **Contrato operativo aplicado**:
  1. `AGENTS.md` define la norma obligatoria de cierre por checklist mÃ­nima;
  2. `docs/bitacora_codex.md` contiene la plantilla operativa reutilizable y su uso real en esta ejecuciÃ³n;
  3. la validaciÃ³n `definido vs implementado` se contrasta con `docs/90_estado_implementacion.md` cuando aplica.
- **Evidencia de cierre CRX-005**:
  - secciÃ³n `Checklist mÃ­nimo de cierre por ejecuciÃ³n (uso obligatorio)` en `docs/bitacora_codex.md`;
  - entrada `2026-03-26-CRX-005` cerrada en `DONE` usando la checklist completa;
  - diff restringido al perÃ­metro permitido (`AGENTS.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`).
- **Bloqueo conocido**: ninguno.

## CRX-006 â€” Reencuadre del roadmap Codex hacia V2-R10
- **Estado**: `DONE`
- **Objetivo**: reactivar `docs/roadmap_codex.md` como fuente de ejecuciÃ³n atÃ³mica tras quedar sin `TODO` y alinear el siguiente paso con `V2-R10`.
- **Alcance permitido**: `AGENTS.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: cÃ³digo de producto, scripts, tests, migraciones y cambios funcionales de backend/frontend.
- **Capas permitidas/prohibidas**: solo gobernanza documental; prohibido tocar dominio/aplicaciÃ³n/infraestructura/presentaciÃ³n.
- **Archivos o zonas probables**: matriz de trazabilidad y bloque final de `docs/roadmap_codex.md`, mÃ¡s entrada de cierre en `docs/bitacora_codex.md`.
- **Checks obligatorios**:
  - confirmar ausencia de `TODO` en `docs/roadmap_codex.md`,
  - confirmar `V2-R10` como siguiente incremento `PLANNED` en `docs/roadmap_ecommerce_real_v2.md`,
  - dejar una primera `TODO` no `BLOCKED` con perÃ­metro claro,
  - diff dentro del perÃ­metro permitido.
- **Criterio de cierre**: el roadmap Codex deja de estar obsoleto y expone una primera tarea ejecutable alineada con V2.
- **Evidencia de cierre CRX-006**:
  - matriz de trazabilidad ampliada con `CRX-006` y `V2G-001`;
  - `V2G-001` queda como primera `TODO` no `BLOCKED`;
  - entrada `2026-03-26-CRX-006` registrada en `docs/bitacora_codex.md`.
- **Bloqueo conocido**: ninguno.

## V2G-001 â€” AuditorÃ­a de cierre de `V2-R10` (go-live checklist v2)
- **Estado**: `DONE`
- **Objetivo**: contrastar el alcance pendiente de `V2-R10` con scripts, tests y documentaciÃ³n reales para decidir con evidencia si puede cerrarse, quÃ© brecha exacta queda o si existe bloqueo externo.
- **Alcance permitido**: `AGENTS.md`, `docs/roadmap_ecommerce_real_v2.md`, `docs/release_readiness_minima.md`, `docs/13_testing_ci_y_quality_gate.md`, `docs/deploy_railway.md`, `docs/90_estado_implementacion.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, con lectura de `scripts/` y `tests/scripts/`.
- **Fuera de alcance**: tocar backend/frontend funcional, ejecutar deploy real, backups reales, restores reales o cambios de negocio.
- **Capas permitidas/prohibidas**: gobernanza documental y auditorÃ­a de scripts; prohibido mutar producto.
- **Archivos o zonas probables**: `docs/release_readiness_minima.md`, `docs/13_testing_ci_y_quality_gate.md`, `docs/deploy_railway.md`, `scripts/check_release_gate.py`, `scripts/check_release_readiness.py`, `scripts/check_deployed_stack.py`, `scripts/backup_restore_postgres.py`, `tests/scripts/`.
- **Checks obligatorios**:
  - verificar cobertura y trazabilidad de `check_release_gate.py`, `check_release_readiness.py`, `check_deployed_stack.py`, `backup_restore_postgres.py`, `check_operational_alerts_v2.py` y `retry_operational_tasks_v2.py`,
  - contrastar `V2-R10` con `docs/90_estado_implementacion.md` para no reabrir cierres ya implementados,
  - dejar un Ãºnico resultado explÃ­cito: `DONE`, nueva tarea atÃ³mica siguiente o `BLOCKED` con causa externa verificable.
- **Criterio de cierre**: evidencia documental suficiente para decidir el siguiente paso exacto de `V2-R10` sin implementar a ciegas.
- **Evidencia de cierre V2G-001**:
  - La bitacora registra `Entrada 2026-03-26-V2G-001` con estado final `DONE`, auditoria real de cierre `V2-R10`, fuentes consultadas, checks ejecutados y resultado verificable.
  - El cierre dejo una cola operativa atomica para continuar sin implementar a ciegas y sin reabrir capacidades ya declaradas `DONE` en `docs/90_estado_implementacion.md`.
  - Esta correccion alinea el roadmap restaurado con la bitacora vigente para que la primera tarea ejecutable vuelva a ser `V2G-016`.
- **Bloqueo conocido**: posible dependencia de URLs/entorno desplegado real para smoke post-deploy y drill operativo final.

## V2G-015 - Proceso de devolucion demo
- **Estado**: `DONE`
- **Objetivo**: revisar y completar el proceso local/demo de devolucion o cancelacion post-compra para que sea demostrable sin PSP real.
- **Alcance permitido**: flujo de devolucion/cancelacion local, estados existentes, emails locales, tests y copy de cliente sin prometer reembolso bancario real.
- **Fuera de alcance**: reembolso bancario real, integraciones PSP live, logistica externa real.
- **Criterio de cierre**: existe camino demo verificable para solicitar o registrar devolucion/cancelacion y comunicar estado al cliente sin banco real.
- **Evidencia de cierre V2G-015**:
  - El backend cuenta con modelo/admin de devoluciones postventa y tests de transicion manual, restitucion de inventario y reembolso manual sin PSP real.
  - El recibo real incorpora un bloque de postventa demo que diferencia cancelacion operativa, devolucion manual elegible, pago no confirmado y pedido pendiente de envio.
  - El copy visible evita prometer reembolso bancario automatico: informa que la revision y el reembolso son manuales y que en demo no se ejecutan movimientos bancarios reales.
  - Checks en verde: `npm --prefix frontend run test:checkout-real`, `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.infraestructura.test_devoluciones_postventa`, `.venv\Scripts\python.exe manage.py check`, `python scripts/check_repo_operational_integrity.py` y `git diff --check` tras corregir EOF.

## V2G-016 - Recibo fiscal descargable en PDF
- **Estado**: `TODO`
- **Objetivo**: generar el recibo/documento fiscal de compra en PDF descargable desde el pedido, manteniendo el HTML actual como fallback tecnico si aporta valor.
- **Alcance permitido**: generacion PDF server-side, endpoint protegido por ACL del pedido, enlace visible en recibo/mi cuenta, tests backend/frontend y documentacion de cierre.
- **Fuera de alcance**: facturacion fiscal enterprise, firma digital, numeracion fiscal real definitiva, envio automatico por email del PDF, binarios versionados o plantillas externas de pago.
- **Criterio de cierre**: tras una compra local/demo pagada, el cliente puede descargar un PDF del recibo con datos de pedido, lineas, impuestos, total, estado de pago simulado y aviso claro de no cobro real en demo.
