# Bitácora operativa Codex

## Propósito
Registro trazable de cada ejecución autónoma: tarea, archivos tocados, decisiones, checks, resultado, bloqueos y siguiente paso exacto.

Esta bitácora es **append-only**:
- no se reescriben ni se borran entradas históricas;
- cualquier corrección o matiz posterior se registra en una entrada nueva con trazabilidad explícita a la anterior.

## Plantilla obligatoria por entrada
- **Fecha (UTC)**:
- **ID de tarea**:
- **Estado final**: `DONE` | `BLOCKED`
- **Objetivo de la ejecución**:
- **Fuentes de verdad consultadas**:
- **Archivos tocados**:
- **Decisiones tomadas**:
- **Checks ejecutados**:
- **Resultado verificable**:
- **Bloqueos (si aplica)**:
- **Siguiente paso exacto**:

## Plantilla obligatoria adicional para entradas `BLOCKED`
> Usar esta plantilla cuando el **Estado final** sea `BLOCKED`. No sustituye la plantilla general; la complementa.

- **Diagnóstico concreto**:
- **Causa probable**:
- **Evidencia verificable**:
- **Impacto sobre la tarea**:
- **Dependencia que bloquea**:
- **Siguiente acción exacta**:
- **Criterio de desbloqueo**:
- **Fecha/punto de revisión**:

### Mini-ejemplo sintético de formato `BLOCKED` (no corresponde a incidencia real)
- **Diagnóstico concreto**: la tarea requiere una decisión documental explícita que no está publicada.
- **Causa probable**: dependencia de definición pendiente por parte de mantenedor.
- **Evidencia verificable**: ausencia del documento requerido en ruta acordada + referencia en roadmap a “pendiente decisión humana”.
- **Impacto sobre la tarea**: no se puede cerrar `DONE` sin riesgo de contradicción documental.
- **Dependencia que bloquea**: confirmación humana de criterio rector.
- **Siguiente acción exacta**: solicitar decisión en el canal acordado y registrar respuesta textual en bitácora.
- **Criterio de desbloqueo**: decisión publicada y citada en documento rector correspondiente.
- **Fecha/punto de revisión**: próxima ejecución operativa o en 48h UTC, lo que ocurra primero.

## Checklist mínimo de cierre por ejecución (uso obligatorio)
Marcar cada ítem como `Sí` o `No`. Si algún ítem queda en `No`, no cerrar en `DONE`.

1. **Tarea correcta confirmada**: la tarea ejecutada es la primera `TODO` no `BLOCKED` en `docs/roadmap_codex.md`. (`Sí/No`)
2. **Una sola tarea ejecutada**: la corrida trabajó solo un ID de tarea. (`Sí/No`)
3. **Alcance respetado**: los cambios se limitaron al objetivo y perímetro permitido de la tarea. (`Sí/No`)
4. **Evidencia verificable registrada**: existe evidencia explícita de cierre `DONE` o diagnóstico completo de `BLOCKED`. (`Sí/No`)
5. **Checks ejecutados y registrados**: se listan comandos/checks con resultado verificable. (`Sí/No`)
6. **Roadmap actualizado**: el estado y evidencia de la tarea quedaron reflejados en `docs/roadmap_codex.md`. (`Sí/No`)
7. **Bitácora actualizada**: existe entrada completa de la ejecución en `docs/bitacora_codex.md`. (`Sí/No`)
8. **Diff dentro del perímetro**: `git diff --name-only` solo muestra archivos permitidos para la tarea. (`Sí/No`)
9. **Definido vs implementado validado**: cuando aplica, se contrastó explícitamente con `docs/90_estado_implementacion.md` para no declarar implementación ficticia. (`Sí/No/No aplica`)
10. **Siguiente paso exacto definido**: queda una única acción siguiente concreta y verificable. (`Sí/No`)

---

## Entrada 2026-03-26-CRX-001 (bootstrap)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `CRX-001`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: convertir la gobernanza Codex en sistema operativo ejecutable (reglas duras + roadmap atómico + bitácora).
- **Fuentes de verdad consultadas**:
  - `AGENTS.md`
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/14_roadmap.md`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
  - `docs/roadmap_ecommerce_real_v2.md`
- **Archivos tocados**:
  - `AGENTS.md`
  - `docs/roadmap_codex.md` (nuevo)
  - `docs/bitacora_codex.md` (nuevo)
- **Decisiones tomadas**:
  1. Mantener toda la inteligencia específica del proyecto (identidad, anclas de dominio, stack, calidad y restricciones) y añadir reglas ejecutables para operación autónoma.
  2. Instituir regla dura: seleccionar primera tarea `TODO` no `BLOCKED`, una tarea por ejecución, sin cambiar orden sin bitácora.
  3. Definir protocolo explícito de bloqueo para evitar improvisación fuera de alcance.
  4. Crear roadmap Codex atómico con IDs estables y criterios de cierre auditables.
- **Checks ejecutados**:
  - `find .. -name AGENTS.md -print`
  - `rg --files docs | sort`
  - `test -f AGENTS.md && test -f docs/roadmap_codex.md && test -f docs/bitacora_codex.md`
  - `for f in docs/99_fuente_de_verdad.md docs/08_decisiones_tecnicas_no_negociables.md docs/90_estado_implementacion.md docs/14_roadmap.md docs/roadmap_cierre_ecommerce_real_incremental.md docs/roadmap_ecommerce_real_v2.md; do test -f "$f" || exit 1; done`
  - `python - <<'PY'
from pathlib import Path
texto = Path('docs/roadmap_codex.md').read_text(encoding='utf-8')
ids = [l for l in texto.splitlines() if l.startswith('## CRX-')]
if not ids:
    raise SystemExit('sin tareas')
if '**Estado**: `TODO`' not in texto:
    raise SystemExit('sin TODO')
print('ok_tareas', len(ids))
PY`
  - `git diff --name-only`
- **Resultado verificable**:
  - gobernanza Codex endurecida y ejecutable;
  - roadmap operativo creado con primera tarea `TODO` no bloqueada ejecutable;
  - bitácora creada con plantilla y rastro bootstrap.
- **Bloqueos (si aplica)**: ninguno.
- **Siguiente paso exacto**: ejecutar `CRX-002` (primera `TODO` no `BLOCKED`) añadiendo matriz de trazabilidad documental por tarea en `docs/roadmap_codex.md` y registrando evidencia en esta bitácora.

## Entrada 2026-03-26-CRX-002 (matriz trazabilidad)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `CRX-002`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: incorporar matriz de trazabilidad documental por tarea CRX (001–005) para gobernar precedencia, soporte y ámbito de decisión en ejecuciones futuras.
- **Fuentes de verdad consultadas**:
  - `AGENTS.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/14_roadmap.md`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/ciclos/ciclo_03_reencauce_control.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Definir una matriz única y compacta en `docs/roadmap_codex.md` con asignación explícita por tarea: rector principal, soportes, ámbito, motivo y nota operativa.
  2. Marcar `CRX-002` como `DONE` al quedar la matriz creada y alineada con precedencia de `docs/99_fuente_de_verdad.md`.
  3. Preparar (sin resolver) una tensión documental para `CRX-004`: diferencia entre secuencia macro histórica y estado real implementado/evolutivo.
  4. Mantener alcance atómico: sin abrir tareas nuevas, sin reordenar roadmap y sin tocar código de producto.
- **Checks ejecutados**:
  - `for f in docs/99_fuente_de_verdad.md docs/08_decisiones_tecnicas_no_negociables.md docs/90_estado_implementacion.md docs/14_roadmap.md docs/roadmap_cierre_ecommerce_real_incremental.md docs/roadmap_ecommerce_real_v2.md docs/ciclos/ciclo_03_reencauce_control.md; do test -f "$f" || exit 1; done`
  - `rg -n "\*\*Estado\*\*: `DONE`" docs/roadmap_codex.md | head -n 5`
  - `python - <<'PY'
from pathlib import Path
texto = Path('docs/roadmap_codex.md').read_text(encoding='utf-8').splitlines()
first = None
for i, line in enumerate(texto):
    if line.startswith('## CRX-'):
        estado = next((texto[j] for j in range(i+1, min(i+8, len(texto))) if '**Estado**:' in texto[j]), '')
        if '`TODO`' in estado:
            first = line.strip()
            break
print(first or 'NONE')
PY`
  - `git diff --name-only`
- **Resultado verificable**:
  - existe sección `Matriz de trazabilidad documental por tarea` en `docs/roadmap_codex.md` con filas completas para `CRX-001` a `CRX-005`;
  - `CRX-002` queda en `DONE`;
  - `CRX-003` queda como primera tarea `TODO` no bloqueada;
  - diff restringido a `docs/roadmap_codex.md` y `docs/bitacora_codex.md`.
- **Bloqueos (si aplica)**: ninguno.
- **Siguiente paso exacto**: ejecutar `CRX-003` para formalizar protocolo de `BLOCKED`/desbloqueo con campos mínimos y consistencia AGENTS↔roadmap↔bitácora.

## Entrada 2026-03-26-CRX-003 (protocolo BLOCKED)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `CRX-003`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: endurecer y unificar el protocolo operativo `BLOCKED`/desbloqueo entre `AGENTS.md`, `docs/roadmap_codex.md` y `docs/bitacora_codex.md` sin ampliar alcance.
- **Fuentes de verdad consultadas**:
  - `AGENTS.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Archivos tocados**:
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Centralizar norma de comportamiento ante bloqueo en `AGENTS.md` (cuándo bloquear, campos mínimos obligatorios, revisión de desbloqueo y prohibición de vaguedad).
  2. Operativizar `BLOCKED` en `docs/roadmap_codex.md` como contrato de estado con condiciones mínimas y usos prohibidos.
  3. Añadir plantilla reutilizable específica para entradas `BLOCKED` en bitácora y un mini-ejemplo sintético marcado explícitamente como formato no real.
  4. Cerrar `CRX-003` en `DONE` y mantener `CRX-004` como primera tarea `TODO` no bloqueada.
- **Checks ejecutados**:
  - `test -f AGENTS.md && test -f docs/roadmap_codex.md && test -f docs/bitacora_codex.md`
  - `rg -n "CRX-003|CRX-004|BLOCKED|Diagnóstico concreto|Causa probable|Evidencia verificable|Siguiente acción exacta|Criterio de desbloqueo" AGENTS.md docs/roadmap_codex.md docs/bitacora_codex.md`
  - `python - <<'PY'
from pathlib import Path
txt = Path('docs/roadmap_codex.md').read_text(encoding='utf-8').splitlines()
first_todo = None
for i, line in enumerate(txt):
    if line.startswith('## CRX-'):
        estado = next((txt[j] for j in range(i+1, min(i+12, len(txt))) if '**Estado**:' in txt[j]), '')
        if '`TODO`' in estado and '`BLOCKED`' not in estado:
            first_todo = line.strip()
            break
print(first_todo or 'NONE')
PY`
  - `git diff --name-only`
- **Resultado verificable**:
  - protocolo `BLOCKED` reforzado y consistente entre norma (`AGENTS.md`), contrato de estado (`docs/roadmap_codex.md`) y plantilla operativa (`docs/bitacora_codex.md`);
  - `CRX-003` marcado `DONE`;
  - primera `TODO` no bloqueada confirmada: `CRX-004`;
  - diff limitado a los tres archivos permitidos.
- **Bloqueos (si aplica)**: ninguno.
- **Siguiente paso exacto**: ejecutar `CRX-004` para tratar tensiones documentales priorizadas por precedencia (`docs/99` sobre conflicto planificado vs estado real en `docs/90`).

## Entrada 2026-03-26-CRX-004 (tensiones documentales prioritarias)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `CRX-004`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: resolver documentalmente tensiones prioritarias entre estado real implementado, roadmaps históricos y precedencia oficial, sin maquillaje ni sobrealcance.
- **Fuentes de verdad consultadas**:
  - `AGENTS.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/90_estado_implementacion.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/14_roadmap.md`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/ciclos/ciclo_03_reencauce_control.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Tensiones detectadas**:
  1. Secuencia macro histórica C1→C6 (`docs/14`) vs estado real posterior ya implementado (`docs/90`).
  2. Criterio de `DONE` en roadmaps históricos (Rxx/V2-Rxx) vs estado factual vigente y regla de cierre verificable.
  3. Lectura descontextualizada del reencauce de Ciclo 3 como bloqueo permanente frente a evoluciones posteriores ya registradas.
- **Decisiones aplicadas**:
  1. Prevalece `docs/90_estado_implementacion.md` para estado real implementado; `docs/14_roadmap.md` queda como secuencia histórica de referencia.
  2. Un `DONE` en roadmaps históricos se toma como antecedente, pero el estado operativo vigente se valida en `docs/90` y bajo regla de evidencia de `AGENTS.md`/`docs/08`.
  3. La regla de no abrir features del reencauce de Ciclo 3 se interpreta en su microciclo; no bloquea retroactivamente evoluciones posteriores ya implementadas y documentadas.
- **Checks ejecutados**:
  - `for f in AGENTS.md docs/99_fuente_de_verdad.md docs/90_estado_implementacion.md docs/08_decisiones_tecnicas_no_negociables.md docs/14_roadmap.md docs/roadmap_cierre_ecommerce_real_incremental.md docs/roadmap_ecommerce_real_v2.md docs/ciclos/ciclo_03_reencauce_control.md docs/roadmap_codex.md docs/bitacora_codex.md; do test -f "$f" || exit 1; done`
  - `python - <<'PY'
from pathlib import Path
txt = Path('docs/roadmap_codex.md').read_text(encoding='utf-8')
for tid in ('TDX-01','TDX-02','TDX-03'):
    assert tid in txt, f'falta {tid}'
assert txt.count('**Documento que prevalece**') >= 3, 'faltan documentos prevalentes'
print('ok_tensiones_prevalencia')
PY`
  - `rg -n "## CRX-004|\*\*Estado\*\*: `DONE`|## CRX-005|\*\*Estado\*\*: `TODO`" docs/roadmap_codex.md`
  - `python - <<'PY'
from pathlib import Path
lines = Path('docs/roadmap_codex.md').read_text(encoding='utf-8').splitlines()
first = None
for i,l in enumerate(lines):
    if l.startswith('## CRX-'):
        state = next((lines[j] for j in range(i+1, min(i+10, len(lines))) if '**Estado**:' in lines[j]), '')
        if '`TODO`' in state and '`BLOCKED`' not in state:
            first = l.strip(); break
print(first or 'NONE')
PY`
  - `git diff --name-only`
- **Resultado verificable**:
  - `docs/roadmap_codex.md` incluye sección priorizada de tensiones abiertas (TDX-01..03), con evidencia concreta, documento prevalente y decisión operativa aplicada.
  - `CRX-004` quedó en `DONE` con evidencia explícita de cierre.
  - `CRX-005` quedó como primera tarea `TODO` no bloqueada.
  - diff limitado al perímetro permitido (`docs/roadmap_codex.md`, `docs/bitacora_codex.md`).
- **Bloqueos (si aplica)**: no hay bloqueos para CRX-004. Queda dependencia humana opcional (no bloqueante) para decidir si agregar nota aclaratoria mínima en documento histórico de reencauce.
- **Siguiente paso exacto**: ejecutar `CRX-005` para estandarizar checklist mínimo de cierre por ejecución Codex y validar su uso en bitácora.

## Entrada 2026-03-26-CRX-005 (checklist mínimo de cierre por ejecución)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `CRX-005`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: cerrar la gobernanza Codex con checklist mínima, reutilizable y verificable para cierre de cualquier corrida.
- **Fuentes de verdad consultadas**:
  - `AGENTS.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Archivos tocados**:
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Ubicar la **norma** de cierre en `AGENTS.md` (sección 11.1) para fijar obligatoriedad y criterios mínimos.
  2. Ubicar la **plantilla operativa reutilizable** en `docs/bitacora_codex.md` para uso directo por ejecución.
  3. Actualizar `CRX-005` a `DONE` en `docs/roadmap_codex.md` con evidencia explícita y sin ampliar alcance.
- **Checklist de cierre aplicada (CRX-005)**:
  1. Tarea correcta confirmada (`CRX-005` primera `TODO` no `BLOCKED`): **Sí**.
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí**.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí** (aplica como control para no declarar implementación de producto en esta tarea documental).
  10. Siguiente paso exacto definido: **Sí**.
- **Checks ejecutados**:
  - `test -f AGENTS.md && test -f docs/roadmap_codex.md && test -f docs/bitacora_codex.md`
  - `rg -n "## CRX-005|\\*\\*Estado\\*\\*: `DONE`" docs/roadmap_codex.md`
  - `rg -n "^## CRX-.*\\*\\*Estado\\*\\*: `TODO`|\\*\\*Estado\\*\\*: `TODO`" docs/roadmap_codex.md`
  - `rg -n "Checklist mínimo de cierre por ejecución \\(uso obligatorio\\)" docs/bitacora_codex.md`
  - `rg -n "## Entrada 2026-03-26-CRX-005|Checklist de cierre aplicada \\(CRX-005\\)" docs/bitacora_codex.md`
  - `git diff --name-only`
- **Resultado verificable**:
  - checklist mínima de cierre creada en ubicación operativa única y reutilizable en bitácora;
  - norma de obligatoriedad incorporada en `AGENTS.md`;
  - `CRX-005` marcado en `DONE` con evidencia en roadmap;
  - no quedan tareas `CRX` en `TODO`;
  - diff limitado a `AGENTS.md`, `docs/roadmap_codex.md` y `docs/bitacora_codex.md`.
- **Bloqueos (si aplica)**: ninguno.
- **Siguiente paso exacto**: mantener esta checklist como control obligatorio de cierre en toda ejecución futura y rechazar cierres `DONE` con cualquier ítem en `No`.

## Entrada 2026-03-26-CRX-006 (reencuadre roadmap hacia V2-R10)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `CRX-006`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: reactivar `docs/roadmap_codex.md` como fuente de ejecución atómica tras quedar sin tareas `TODO` y dejar trazado el siguiente paso correcto alineado con `V2-R10`.
- **Fuentes de verdad consultadas**:
  - `AGENTS.md`
  - `docs/90_estado_implementacion.md`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `docs/17_migracion_ecommerce_real.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Considerar `docs/roadmap_codex.md` obsoleto porque no tenía ninguna `TODO` activa mientras `docs/roadmap_ecommerce_real_v2.md` aún mantiene `V2-R10` en `PLANNED`.
  2. Limitar esta corrida a gobernanza documental y no abrir implementación de producto, porque la instrucción operativa exige actualizar el roadmap antes de implementar cuando está desalineado.
  3. Traducir el siguiente bloque vivo a una primera tarea atómica de auditoría (`V2G-001`) en lugar de asumir una implementación ciega sobre un incremento todavía macro.
  4. Preservar el diff preexistente de `AGENTS.md` sin modificarlo ni revertirlo, manteniendo el perímetro documental permitido.
- **Checklist de cierre aplicada (CRX-006)**:
  1. Tarea correcta confirmada: **Sí** (`docs/roadmap_codex.md` estaba sin `TODO`; esta corrida se dedicó a su reencuadre previo exigido antes de implementar).
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí** (el diff actual queda dentro de `AGENTS.md`, `docs/roadmap_codex.md` y `docs/bitacora_codex.md`).
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí** (aplica para no reabrir capacidades V1/V2 ya declaradas `DONE`).
  10. Siguiente paso exacto definido: **Sí**.
- **Checks ejecutados**:
  - `git status --short`
  - `git diff -- AGENTS.md`
  - `git diff -- docs/roadmap_codex.md`
  - `git diff -- docs/bitacora_codex.md`
  - `Select-String -Path docs/roadmap_ecommerce_real_v2.md -Pattern '### V2-R10|\\*\\*Estado\\*\\*: `PLANNED`'`
  - `Select-String -Path docs/90_estado_implementacion.md -Pattern 'release readiness|V2-R10|## 46\\.'`
  - `Get-ChildItem docs -Recurse -File | Select-String -Pattern 'V2-R10|go-live|release readiness|check_release_gate\\.py|check_deployed_stack\\.py' | Select-Object Path,LineNumber,Line | Format-Table -AutoSize | Out-String -Width 200`
  - `@' ... roadmap_codex.md first TODO detector ... '@ | python -` → devuelve `## V2G-001 — Auditoría de cierre de \`V2-R10\` (go-live checklist v2)`
  - `git diff --name-only`
- **Resultado verificable**:
  - `docs/roadmap_codex.md` vuelve a tener una primera tarea `TODO` no `BLOCKED` (`V2G-001`);
  - el siguiente paso queda trazado contra `docs/roadmap_ecommerce_real_v2.md` y documentación operativa real del repo;
  - no se tocaron capas de producto ni scripts en esta corrida;
  - el diff se mantiene en el perímetro documental permitido.
- **Bloqueos (si aplica)**: ninguno.
- **Siguiente paso exacto**: ejecutar `V2G-001` para auditar el cierre real de `V2-R10`, decidir si ya está cerrable o dejar la brecha exacta siguiente con evidencia.

## Entrada 2026-03-26-V2G-001 (auditoria cierre go-live v2)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `V2G-001`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: auditar si `V2-R10` era cerrable con el repo/documentación actual o si había que desglosar brechas exactas y bloqueos externos verificables.
- **Fuentes de verdad consultadas**:
  - `AGENTS.md`
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Qué se inspeccionó**:
  1. Roadmaps vivos (`docs/roadmap_codex.md`, `docs/roadmap_ecommerce_real_v2.md`, `docs/roadmap_cierre_ecommerce_real_incremental.md`) para validar estado real y cola abierta.
  2. Scripts canónicos de gate/readiness/smoke (`check_release_gate.py`, `check_release_readiness.py`, `check_deployed_stack.py`, `check_seo_contract.py`, `backup_restore_postgres.py`).
  3. Workflow CI `.github/workflows/quality_gate.yml` y prerequisitos del runner (`requirements.txt`, `frontend/package-lock.json`, ausencia local de `.venv` y `frontend/node_modules`).
- **Decisiones tomadas**:
  1. Cerrar `V2G-001` en `DONE` porque la auditoría ya resolvió el resultado pedido: `V2-R10` no es cerrable todavía y la brecha queda desglosada en tres tareas concretas.
  2. Priorizar `AUT-001` como primera `TODO` no `BLOCKED` porque hoy existe un wiring roto del gate en Windows: el bloque frontend puede quedarse en `SKIP` aunque `npm.cmd` sí esté disponible.
  3. Abrir `AUT-002` para corregir la deriva doc↔script del gate canónico; la documentación promete bloques que el script no ejecuta.
  4. Encapsular el cierre externo real de go-live en `AUT-003` como `BLOCKED`, en lugar de mezclarlo con fixes internos del repo.
  5. Dejar fuera de cola el ruido de entorno local (sin Django ni `node_modules`) porque CI sí instala dependencias antes de ejecutar el gate; no es evidencia suficiente de bug de producto.
- **Checks ejecutados**:
  - `python scripts/check_release_readiness.py` → `OK`.
  - `python scripts/check_release_gate.py` → `ERROR`; backend sin Django en este runner y bloque frontend `G` en `SKIP`.
  - `python -c "import shutil; print(shutil.which('npm')); print(shutil.which('npm.cmd')); print(shutil.which('node'))"` → `npm`/`npm.cmd`/`node` existen en PATH.
  - `python -c "import subprocess; subprocess.run(['npm','--version'], ...)"` → `FileNotFoundError`.
  - `python -c "import subprocess; subprocess.run(['npm.cmd','--version'], ...)"` → `0`, versión `11.9.0`.
  - `python -c "from pathlib import Path; text=Path('scripts/check_release_gate.py').read_text(...); ..."` → confirma ausencia de `check_release_readiness.py`, `check_operational_alerts_v2.py`, `retry_operational_tasks_v2.py`, `backup_restore_postgres.py` en el gate.
  - `Get-Content -Raw .github/workflows/quality_gate.yml` → confirma instalación previa de backend/frontend en CI antes de `check_release_gate.py`.
  - `Test-Path frontend/package-lock.json; Test-Path frontend/node_modules; Test-Path .venv` → `True / False / False`.
- **Resultado verificable**:
  - `V2G-001` queda cerrado con diagnóstico accionable, sin tocar código de producto.
  - La cola operativa queda refrescada a tres tareas pequeñas: `AUT-001` (`TODO`, `P0`), `AUT-002` (`TODO`, `P1`) y `AUT-003` (`BLOCKED`, `P1`).
  - La primera `TODO` no `BLOCKED` pasa a ser `AUT-001`, ejecutable y acotada a scripts/tests/documentación del gate.
  - Quedó fuera de cola:
    - instalar Django o `npm ci` localmente, porque el workflow CI ya cubre ese bootstrap;
    - cerrar `V2-R10` directamente, porque faltan smoke post-deploy y restore drill reales;
    - abrir features comerciales o reabrir checkout/pago/inventario/cuenta, porque `docs/90_estado_implementacion.md` no aporta evidencia de regresión en esas capacidades.
- **Bloqueos (si aplica)**: no hay bloqueo para la auditoría; el único bloqueo real detectado se trasladó a `AUT-003` con condición exacta.
- **Checklist de cierre aplicada (V2G-001)**:
  1. Tarea correcta confirmada (`V2G-001` era la primera `TODO` no `BLOCKED`): **Sí**.
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí**.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí**.
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `AUT-001` para corregir la resolución de npm en Windows dentro de `scripts/check_release_gate.py` y recuperar la validación frontend bloqueante del gate canónico.

## Entrada 2026-03-26-AUT-001 (gate frontend Windows)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `AUT-001`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: corregir el wiring del bloque frontend del gate canónico para que en Windows use `npm.cmd` cuando exista, sin tocar frontend de producto ni ampliar a `AUT-002`.
- **Fuentes de verdad consultadas**:
  - `AGENTS.md`
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `docs/release_readiness_minima.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `scripts/check_release_gate.py`
  - `scripts/check_seo_contract.py`
- **Archivos tocados**:
  - `scripts/check_release_gate.py`
  - `tests/scripts/test_check_release_gate_frontend.py`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Limitar el fix a la resolución del ejecutable `npm` por plataforma, reutilizando el patrón ya vigente en `scripts/check_seo_contract.py`, sin abrir la reconciliación doc↔script de `AUT-002`.
  2. Mantener intacto el contrato visible del bloque frontend (`lint`, `test:checkout-demo`, `test:cuenta-demo`, `test:calendario-ritual`, `build`); solo cambia el ejecutable invocado.
  3. Añadir un test unitario dedicado para cubrir tanto el resolvedor Windows como la invocación real del bloque frontend con `npm.cmd`.
- **Checks ejecutados**:
  - `python -m unittest tests.scripts.test_check_release_gate_snapshot tests.scripts.test_check_seo_contract tests.scripts.test_check_release_gate_frontend`
  - `git diff -- scripts/check_release_gate.py tests/scripts/test_check_release_gate_frontend.py`
  - `git status --short`
- **Resultado verificable**:
  - `scripts/check_release_gate.py` ya no fuerza `npm`; resuelve `npm.cmd` en Windows y usa ese ejecutable en lint, tests frontend y build.
  - `tests/scripts/test_check_release_gate_frontend.py` cubre el resolvedor y asegura que las cinco invocaciones frontend usan `npm.cmd` cuando corresponde.
  - La batería unitaria exigida por la tarea termina en `OK` con 5 tests.
- **Bloqueos (si aplica)**: ninguno.
- **Checklist de cierre aplicada (AUT-001)**:
  1. Tarea correcta confirmada (`AUT-001` era la primera `TODO` no `BLOCKED`): **Sí**.
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí**.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí** (aplica para no reabrir capacidades funcionales ya cerradas; solo se tocó wiring del gate).
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `AUT-002` para alinear la cobertura real de `scripts/check_release_gate.py` con `docs/13_testing_ci_y_quality_gate.md` y `docs/release_readiness_minima.md`.

## Entrada 2026-03-26-AUT-002 (contrato del gate canónico)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `AUT-002`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: reconciliar el contenido real de `scripts/check_release_gate.py` con el contrato documental vigente, sin abrir producto ni reimplementar operativa fuera de alcance.
- **Fuentes de verdad consultadas**:
  - `AGENTS.md`
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `docs/release_readiness_minima.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `.github/workflows/quality_gate.yml`
  - `scripts/check_release_gate.py`
  - `scripts/check_release_readiness.py`
  - `scripts/check_operational_alerts_v2.py`
  - `scripts/retry_operational_tasks_v2.py`
  - `scripts/backup_restore_postgres.py`
- **Archivos tocados**:
  - `scripts/check_release_gate.py`
  - `tests/scripts/test_check_release_gate_contract.py`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `docs/release_readiness_minima.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Implementar en el gate únicamente los bloques read-only y de alta confianza ya prometidos por la documentación y ejecutables en CI sin mutación: `check_release_readiness.py`, `check_operational_alerts_v2.py --fail-on blocker` y `retry_operational_tasks_v2.py --dry-run --json`.
  2. No meter `backup_restore_postgres.py` dentro del gate canónico: su `dry-run` depende de `DATABASE_URL`, `BOTICA_BACKUP_DIR` y, para restore, de un dump explícito; se deja como checklist pre-flight separado y así se corrige la promesa documental.
  3. Endurecer la semántica del gate para que cualquier script que devuelva `SKIP:` con exit code `0` se refleje como `SKIP` no bloqueante, evitando falsos `OK` en bloques de solo lectura no aplicables por entorno.
  4. Añadir un test contractual dedicado para fallar si `main()` deja fuera los bloques reconciliados o si el tratamiento de `SKIP:` se rompe.
- **Checks ejecutados**:
  - `python -m unittest tests.scripts.test_check_release_gate_snapshot tests.scripts.test_check_release_gate_frontend tests.scripts.test_check_release_gate_reconciliation tests.scripts.test_check_release_gate_contract` → `OK` (9 tests).
  - `python -m unittest tests.scripts.test_check_release_readiness tests.scripts.test_check_operational_alerts_v2 tests.scripts.test_retry_operational_tasks_v2` → `FAILED` por `ModuleNotFoundError: No module named 'django'` en este runner sin bootstrap backend; se registra como limitación de entorno y no como regresión del cambio porque `AUT-002` no incluye instalar dependencias y CI sí prepara ese entorno antes del gate.
  - `git diff --name-only` → diff restringido a `scripts/check_release_gate.py`, `tests/scripts/test_check_release_gate_contract.py`, `docs/13_testing_ci_y_quality_gate.md`, `docs/release_readiness_minima.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Resultado verificable**:
  - el gate ejecuta ya los bloques documentados de readiness, alertas v2 y retry dry-run;
  - la documentación deja de prometer backup/restore dentro del gate y lo reubica como pre-flight separado;
  - existe prueba contractual que falla si desaparecen los bloques reconciliados o si un `SKIP:` vuelve a colarse como `OK`.
- **Bloqueos (si aplica)**: ninguno para `AUT-002`; la única dependencia externa pendiente sigue encapsulada en `AUT-003`.
- **Checklist de cierre aplicada (AUT-002)**:
  1. Tarea correcta confirmada (`AUT-002` era la primera `TODO` no `BLOCKED`): **Sí**.
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí**.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí** (aplica para no reabrir capacidades V1/V2 ya cerradas; el cambio se limita al gate y documentación operativa).
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: cola ejecutable vacía; desbloquear `AUT-003` aportando `BACKEND_BASE_URL`, `FRONTEND_BASE_URL` y `BOTICA_RESTORE_DATABASE_URL` reales para poder ejecutar smoke post-deploy y restore drill.

## Entrada 2026-03-26-RADAR-COLA (cola ejecutable vacía)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `RADAR-COLA`
- **Estado final**: `DONE`
- **Revalidacion UTC de esta misma cola**: 2026-03-26T17:03:05Z
- **Resultado de la revalidacion**: siguen sin existir tareas `TODO` no `BLOCKED` y `AUT-003` conserva el mismo bloqueo externo.
- **Objetivo de la ejecución**: verificar si tras `AUT-002` existía una nueva tarea `TODO` no `BLOCKED` o si la cola había quedado vacía por dependencia externa.
- **Fuentes de verdad consultadas**:
  - `AGENTS.md`
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `scripts/check_deployed_stack.py`
  - `scripts/backup_restore_postgres.py`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. No abrir implementación ni reordenar el roadmap porque no queda ninguna tarea `TODO` no `BLOCKED`.
  2. Revisar explícitamente el criterio de desbloqueo de `AUT-003` antes de declarar cola vacía, tal como exige el protocolo `BLOCKED`.
  3. Mantener `AUT-003` en `BLOCKED` porque faltan las tres variables externas (`BACKEND_BASE_URL`, `FRONTEND_BASE_URL`, `BOTICA_RESTORE_DATABASE_URL`) y sigue sin existir un entorno temporal seguro para el restore drill.
- **Checks ejecutados**:
  - `Select-String -Path docs/roadmap_codex.md -Pattern 'TODO','BLOCKED','Estado' | ForEach-Object { "{0}:{1}" -f $_.LineNumber, $_.Line.Trim() }` → sin tareas en estado `TODO`.
  - `Get-Content docs/release_readiness_minima.md -Raw`
  - `Get-Content docs/deploy_railway.md -Raw`
  - `$names = 'BACKEND_BASE_URL','FRONTEND_BASE_URL','BOTICA_RESTORE_DATABASE_URL'; foreach ($name in $names) { ... }` → `BACKEND_BASE_URL=MISSING`, `FRONTEND_BASE_URL=MISSING`, `BOTICA_RESTORE_DATABASE_URL=MISSING`.
  - `Select-String -Path docs/release_readiness_minima.md,docs/deploy_railway.md,scripts/check_deployed_stack.py,scripts/backup_restore_postgres.py -Pattern 'BACKEND_BASE_URL','FRONTEND_BASE_URL','BOTICA_RESTORE_DATABASE_URL','restore-drill','check_deployed_stack','smoke' -Context 2,2`
  - `git -c safe.directory=C:/Users/arcas/.codex/worktrees/d70a/botica_bruja_lore status --short --branch`
- **Resultado verificable**:
  - no existe primera tarea `TODO` no `BLOCKED`; la cola ejecutable queda vacía;
  - `AUT-003` sigue bloqueada con criterio de desbloqueo no cumplido (`BACKEND_BASE_URL`, `FRONTEND_BASE_URL`, `BOTICA_RESTORE_DATABASE_URL` ausentes);
  - no se tocó código de producto; solo gobernanza documental para dejar trazabilidad del estado real.
- **Bloqueos (si aplica)**: la cola depende del desbloqueo externo de `AUT-003`.
- **Checklist de cierre aplicada (RADAR-COLA)**:
  1. Tarea correcta confirmada: **No aplica** (no hay ninguna `TODO` no `BLOCKED`; esta corrida se limita al radar exigido cuando la cola queda vacía).
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí**.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí** (aplica para no reabrir capacidades ya `DONE` ni forzar un cierre ficticio de `V2-R10`).
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: aportar `BACKEND_BASE_URL`, `FRONTEND_BASE_URL` y `BOTICA_RESTORE_DATABASE_URL` reales en un entorno temporal seguro y, con ellas, ejecutar `python scripts/check_deployed_stack.py` y `python scripts/backup_restore_postgres.py restore-drill --dump-file <dump real>`.

## Entrada 2026-03-26-RADAR-COLA-02 (revalidacion de cola ejecutable vacia)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `RADAR-COLA`
- **Estado final**: `DONE`
- **Revalidacion UTC de esta misma cola**: `2026-03-26T18:02:54Z`
- **Resultado de la revalidacion**: siguen sin existir tareas `TODO` no `BLOCKED` y `AUT-003` conserva el mismo bloqueo externo.
- **Objetivo de la ejecucion**: revalidar la cola operativa tras la ultima corrida automatica y dejar trazabilidad actualizada sin tocar codigo de producto.
- **Fuentes de verdad consultadas**:
  - `AGENTS.md`
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `scripts/check_deployed_stack.py`
  - `scripts/backup_restore_postgres.py`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. No abrir implementacion ni reordenar el roadmap porque no existe primera tarea `TODO` no `BLOCKED`.
  2. Revalidar de nuevo el criterio de desbloqueo de `AUT-003` antes de cerrar la corrida, tal como exige el protocolo `BLOCKED`.
  3. Mantener el resultado como radar documental de cola vacia mientras sigan ausentes `BACKEND_BASE_URL`, `FRONTEND_BASE_URL` y `BOTICA_RESTORE_DATABASE_URL`.
- **Checks ejecutados**:
  - `git -c safe.directory=C:/Users/arcas/.codex/worktrees/d70a/botica_bruja_lore status --short --branch` -> branch `codex/inspecciona-cola-del-roadmapff`, worktree limpio, `ahead 1` antes de esta corrida.
  - `$names = 'BACKEND_BASE_URL','FRONTEND_BASE_URL','BOTICA_RESTORE_DATABASE_URL'; foreach ($name in $names) { ... }` -> `BACKEND_BASE_URL=MISSING`, `FRONTEND_BASE_URL=MISSING`, `BOTICA_RESTORE_DATABASE_URL=MISSING`.
  - `$content = Get-Content -Raw "docs/roadmap_codex.md"; if ($content -match '(?m)^- \*\*Estado\*\*: `TODO`') { 'HAS_TODO' } else { 'NO_TODO_STATUS' }` -> `NO_TODO_STATUS`.
- **Resultado verificable**:
  - la cola ejecutable sigue vacia;
  - `AUT-003` continua `BLOCKED` por dependencias externas no satisfechas;
  - no se toca codigo de producto, solo trazabilidad documental del estado real.
- **Bloqueos (si aplica)**: la cola depende del desbloqueo externo de `AUT-003`.
- **Checklist de cierre aplicada (RADAR-COLA-02)**:
  1. Tarea correcta confirmada: **No aplica** (no hay ninguna `TODO` no `BLOCKED`; esta corrida se limita al radar exigido cuando la cola queda vacia).
  2. Una sola tarea ejecutada en la corrida: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**.
  4. Evidencia verificable registrada: **Si**.
  5. Checks ejecutados y registrados: **Si**.
  6. Roadmap actualizado: **Si**.
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Si** (aplica para no reabrir capacidades ya `DONE` ni forzar un cierre ficticio de `V2-R10`).
  10. Siguiente paso exacto definido: **Si**.
- **Siguiente paso exacto**: aportar `BACKEND_BASE_URL`, `FRONTEND_BASE_URL` y `BOTICA_RESTORE_DATABASE_URL` reales en un entorno temporal seguro y, con ellas, ejecutar `python scripts/check_deployed_stack.py` y `python scripts/backup_restore_postgres.py restore-drill --dump-file <dump real>`.

## Entrada 2026-03-26-RADAR-COLA-03 (revalidacion de cola ejecutable vacia)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `RADAR-COLA`
- **Estado final**: `DONE`
- **Revalidacion UTC de esta misma cola**: `2026-03-26T19:02:21Z`
- **Resultado de la revalidacion**: siguen sin existir tareas `TODO` no `BLOCKED` y `AUT-003` conserva el mismo bloqueo externo.
- **Objetivo de la ejecucion**: revalidar la cola operativa en esta corrida automatica y dejar trazabilidad actualizada sin tocar codigo de producto.
- **Fuentes de verdad consultadas**:
  - `AGENTS.md`
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `scripts/check_deployed_stack.py`
  - `scripts/backup_restore_postgres.py`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. No abrir implementacion ni reordenar el roadmap porque no existe primera tarea `TODO` no `BLOCKED`.
  2. Revalidar otra vez el criterio de desbloqueo de `AUT-003` antes de cerrar la corrida, segun el protocolo `BLOCKED`.
  3. Mantener el resultado como radar documental de cola vacia mientras sigan ausentes `BACKEND_BASE_URL`, `FRONTEND_BASE_URL` y `BOTICA_RESTORE_DATABASE_URL`.
- **Checks ejecutados**:
  - `git -c safe.directory=C:/Users/arcas/.codex/worktrees/d70a/botica_bruja_lore status --short --branch` -> branch `codex/inspecciona-cola-del-roadmapff`, worktree limpio, `ahead 2` antes de esta corrida.
  - `$content = Get-Content -Raw -Encoding utf8 docs/roadmap_codex.md; if ($content -match '(?m)^- \*\*Estado\*\*: `TODO`') { 'HAS_TODO' } else { 'NO_TODO_STATUS' }` -> `NO_TODO_STATUS`.
  - `$names = 'BACKEND_BASE_URL','FRONTEND_BASE_URL','BOTICA_RESTORE_DATABASE_URL'; foreach ($name in $names) { if ([string]::IsNullOrWhiteSpace([Environment]::GetEnvironmentVariable($name))) { "${name}=MISSING" } else { "${name}=SET" } }` -> `BACKEND_BASE_URL=MISSING`, `FRONTEND_BASE_URL=MISSING`, `BOTICA_RESTORE_DATABASE_URL=MISSING`.
  - `Select-String -Path docs/roadmap_codex.md -Pattern 'AUT-003','Radar de cola actual','Actualizacion radar UTC'` -> confirma `AUT-003` en `BLOCKED` y radar actualizado.
- **Resultado verificable**:
  - la cola ejecutable sigue vacia;
  - `AUT-003` continua `BLOCKED` por dependencias externas no satisfechas;
  - no se toca codigo de producto, solo trazabilidad documental del estado real.
- **Bloqueos (si aplica)**: la cola depende del desbloqueo externo de `AUT-003`.
- **Checklist de cierre aplicada (RADAR-COLA-03)**:
  1. Tarea correcta confirmada: **No aplica** (no hay ninguna `TODO` no `BLOCKED`; esta corrida se limita al radar exigido cuando la cola queda vacia).
  2. Una sola tarea ejecutada en la corrida: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**.
  4. Evidencia verificable registrada: **Si**.
  5. Checks ejecutados y registrados: **Si**.
  6. Roadmap actualizado: **Si**.
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Si** (aplica para no reabrir capacidades ya `DONE` ni forzar un cierre ficticio de `V2-R10`).
  10. Siguiente paso exacto definido: **Si**.
- **Siguiente paso exacto**: aportar `BACKEND_BASE_URL`, `FRONTEND_BASE_URL` y `BOTICA_RESTORE_DATABASE_URL` reales en un entorno temporal seguro y, con ellas, ejecutar `python scripts/check_deployed_stack.py` y `python scripts/backup_restore_postgres.py restore-drill --dump-file <dump real>`.

## Entrada 2026-03-26-RADAR-COLA-04 (revalidacion de cola ejecutable vacia)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `RADAR-COLA`
- **Estado final**: `DONE`
- **Revalidacion UTC de esta misma cola**: `2026-03-26T20:02:09Z`
- **Resultado de la revalidacion**: siguen sin existir tareas `TODO` no `BLOCKED` y `AUT-003` conserva el mismo bloqueo externo.
- **Objetivo de la ejecucion**: revalidar la cola operativa en esta corrida automatica y dejar trazabilidad actualizada sin tocar codigo de producto.
- **Fuentes de verdad consultadas**:
  - `AGENTS.md`
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `scripts/check_deployed_stack.py`
  - `scripts/backup_restore_postgres.py`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. No abrir implementacion ni reordenar el roadmap porque no existe primera tarea `TODO` no `BLOCKED`.
  2. Revalidar de nuevo el criterio de desbloqueo de `AUT-003` antes de cerrar la corrida, segun el protocolo `BLOCKED`.
  3. Mantener el resultado como radar documental de cola vacia mientras sigan ausentes `BACKEND_BASE_URL`, `FRONTEND_BASE_URL` y `BOTICA_RESTORE_DATABASE_URL`.
- **Checks ejecutados**:
  - `git -c safe.directory=C:/Users/arcas/.codex/worktrees/d70a/botica_bruja_lore status --short --branch`
  - `$content = Get-Content -Raw docs/roadmap_codex.md; if ($content -match '(?m)^- \*\*Estado\*\*: `TODO`') { 'HAS_TODO' } else { 'NO_TODO_STATUS' }`
  - `$names = 'BACKEND_BASE_URL','FRONTEND_BASE_URL','BOTICA_RESTORE_DATABASE_URL'; foreach ($name in $names) { $value = [Environment]::GetEnvironmentVariable($name); if ([string]::IsNullOrWhiteSpace($value)) { "${name}=MISSING" } else { "${name}=SET" } }`
  - `Select-String -Path docs/roadmap_codex.md -Pattern 'AUT-003','Radar de cola actual','Actualizacion radar UTC'`
- **Resultado verificable**:
  - la cola ejecutable sigue vacia;
  - `AUT-003` continua `BLOCKED` por dependencias externas no satisfechas;
  - no se toca codigo de producto, solo trazabilidad documental del estado real.
- **Bloqueos (si aplica)**: la cola depende del desbloqueo externo de `AUT-003`.
- **Checklist de cierre aplicada (RADAR-COLA-04)**:
  1. Tarea correcta confirmada: **No aplica** (no hay ninguna `TODO` no `BLOCKED`; esta corrida se limita al radar exigido cuando la cola queda vacia).
  2. Una sola tarea ejecutada en la corrida: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**.
  4. Evidencia verificable registrada: **Si**.
  5. Checks ejecutados y registrados: **Si**.
  6. Roadmap actualizado: **Si**.
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Si** (aplica para no reabrir capacidades ya `DONE` ni forzar un cierre ficticio de `V2-R10`).
  10. Siguiente paso exacto definido: **Si**.
- **Siguiente paso exacto**: aportar `BACKEND_BASE_URL`, `FRONTEND_BASE_URL` y `BOTICA_RESTORE_DATABASE_URL` reales en un entorno temporal seguro y, con ellas, ejecutar `python scripts/check_deployed_stack.py` y `python scripts/backup_restore_postgres.py restore-drill --dump-file <dump real>`.

## Entrada 2026-03-26-CRX-007 (bootstrap contrato 1)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `CRX-007`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: sanear el contrato documental mínimo para automations seguras, dejando una sola cola operativa, bitácora append-only explícita y estado factual consistente con la realidad implementada.
- **Fuentes de verdad consultadas**:
  - `docs/90_estado_implementacion.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/00_vision_proyecto.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `docs/release_readiness_minima.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `scripts/check_release_gate.py`
  - `scripts/check_release_readiness.py`
  - `scripts/check_repo_operational_integrity.py`
- **Archivos tocados**:
  - `AGENTS.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Alinear `AGENTS.md` con la precedencia meta de `docs/99_fuente_de_verdad.md` y endurecer la regla de cola vacía/backlog totalmente bloqueado sin abrir sistemas paralelos.
  2. Declarar `docs/bitacora_codex.md` como bitácora `append-only` de forma explícita, para que las automations no reinterpretaren correcciones como reescritura histórica.
  3. Sanear `docs/90_estado_implementacion.md` solo en su capa factual superior (estado global, tabla principal, ruta vigente y regla de lectura rápida) para eliminar contradicciones entre demo, ecommerce real/V2 y bloqueo externo actual.
  4. Registrar esta petición explícita del mantenedor dentro del mismo roadmap/bitácora operativos, sin inventar un sistema paralelo ni rebajar `AUT-003`.
- **Checks ejecutados**:
  - `python scripts/check_release_gate.py` -> `ERROR`; causas verificables en este runner: `ModuleNotFoundError: No module named 'django'` en bloques Django y comandos frontend `next` / `tsc` no disponibles.
  - `python scripts/check_release_readiness.py` -> `OK`.
  - `python scripts/check_repo_operational_integrity.py` -> `OK`.
  - `git -c safe.directory=C:/Users/arcas/.codex/worktrees/d70a/botica_bruja_lore diff --name-only` -> `AGENTS.md`, `docs/90_estado_implementacion.md`, `docs/bitacora_codex.md`, `docs/roadmap_codex.md`.
  - `$content = Get-Content -Raw 'docs/roadmap_codex.md'; if ($content -match '(?m)^- \*\*Estado\*\*: \`TODO\`') { 'HAS_TODO' } else { 'NO_TODO_STATUS' }` -> `HAS_TODO` antes del cierre documental de `CRX-007`.
  - `Select-String -Path 'docs/90_estado_implementacion.md' -Pattern '\| Checkout demo \| PLANIFICADO \|','\| Login / invitado \| PLANIFICADO \|','\| Historial de pedidos demo \| PLANIFICADO \|'` -> sin coincidencias tras el saneamiento.
- **Resultado verificable**:
  - el contrato operativo del repo queda listo para automations seguras sin sistemas paralelos;
  - la bitácora ya declara carácter `append-only`;
  - la fuente factual superior (`docs/90_estado_implementacion.md`) deja de contradecirse en su capa de lectura rápida para demo ↔ real ↔ V2;
  - el único bloqueo operativo vigente sigue siendo externo y está encapsulado en `AUT-003`;
  - las validaciones documentales/readiness pasan y el gate completo falla por limitaciones reales del entorno actual, registradas sin maquillaje.
- **Bloqueos (si aplica)**: ninguno para `CRX-007`; persiste únicamente el bloqueo externo de `AUT-003`.
- **Checklist de cierre aplicada (CRX-007)**:
  1. Tarea correcta confirmada (`CRX-007` registrada y ejecutada como única tarea extraordinaria en la misma cola operativa): **Sí**.
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí**.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí** (aplica precisamente para corregir contradicción factual en la fuente de verdad de mayor precedencia).
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: mantener la cola ejecutable vacía hasta desbloquear `AUT-003` aportando `BACKEND_BASE_URL`, `FRONTEND_BASE_URL` y `BOTICA_RESTORE_DATABASE_URL` reales para ejecutar `python scripts/check_deployed_stack.py` y `python scripts/backup_restore_postgres.py restore-drill --dump-file <dump real>`.

## Entrada 2026-03-26-RADAR-COLA-05 (revalidacion de cola ejecutable vacia)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `RADAR-COLA`
- **Estado final**: `DONE`
- **Revalidacion UTC de esta misma cola**: `2026-03-26T21:02:45.9885365Z`
- **Resultado de la revalidacion**: siguen sin existir tareas `TODO` no `BLOCKED`; `AUT-003` conserva el mismo bloqueo externo y el gate tecnico del runner sigue limitado por entorno incompleto.
- **Objetivo de la ejecucion**: revalidar la cola operativa en esta corrida automatica y dejar trazabilidad actualizada sin tocar codigo de producto.
- **Fuentes de verdad consultadas**:
  - `docs/90_estado_implementacion.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/00_vision_proyecto.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `scripts/check_release_readiness.py`
  - `scripts/check_release_gate.py`
  - `scripts/check_deployed_stack.py`
  - `scripts/backup_restore_postgres.py`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. No abrir implementacion ni reordenar el roadmap porque no existe primera tarea `TODO` no `BLOCKED`.
  2. Mantener `AUT-003` en `BLOCKED` porque siguen ausentes `BACKEND_BASE_URL`, `FRONTEND_BASE_URL` y `BOTICA_RESTORE_DATABASE_URL`, y por tanto no procede ejecutar `check_deployed_stack.py` ni `restore-drill`.
  3. Registrar como evidencia fresca que `check_release_readiness.py` sigue en `OK` y que `check_release_gate.py` sigue en `ERROR` por falta de dependencias de entorno (`django`, `next`, `tsc`), sin tratarlo como desbloqueo del go-live.
  4. Respetar el worktree heredado: esta corrida solo anade cambios en roadmap/bitacora y no toca `AGENTS.md` ni `docs/90_estado_implementacion.md`, aunque sigan modificados en el arbol de trabajo.
- **Checks ejecutados**:
  - `git -c safe.directory=C:/Users/arcas/.codex/worktrees/d70a/botica_bruja_lore status --short --branch` -> branch `codex/inspecciona-cola-del-roadmapff`, `ahead 1`, con diff heredado en `AGENTS.md`, `docs/90_estado_implementacion.md`, `docs/roadmap_codex.md` y `docs/bitacora_codex.md`.
  - `$content = Get-Content -Raw 'docs/roadmap_codex.md'; if ($content -match '(?m)^- \*\*Estado\*\*: \`TODO\`') { 'HAS_TODO' } else { 'NO_TODO_STATUS' }` -> `NO_TODO_STATUS`.
  - `$names = 'BACKEND_BASE_URL','FRONTEND_BASE_URL','BOTICA_RESTORE_DATABASE_URL','RESTORE_DATABASE_URL','DATABASE_URL'; foreach ($name in $names) { ... }` -> `BACKEND_BASE_URL=MISSING`, `FRONTEND_BASE_URL=MISSING`, `BOTICA_RESTORE_DATABASE_URL=MISSING`, `RESTORE_DATABASE_URL=MISSING`, `DATABASE_URL=MISSING`.
  - `python scripts/check_release_readiness.py` -> `OK`.
  - `python scripts/check_release_gate.py` -> `ERROR`; bloques Django fallan con `ModuleNotFoundError: No module named 'django'` y bloques frontend/SEO fallan porque `next` y `tsc` no estan disponibles en este runner.
- **Resultado verificable**:
  - la cola ejecutable sigue vacia;
  - `AUT-003` continua `BLOCKED` por dependencias externas no satisfechas;
  - `check_release_readiness.py` pasa y confirma el checklist/documentacion minima de release;
  - `check_release_gate.py` no pasa en este runner por limitacion de entorno, no por un desbloqueo nuevo de `V2-R10`;
  - no se toca codigo de producto; solo trazabilidad documental del estado real.
- **Bloqueos (si aplica)**: la cola depende del desbloqueo externo de `AUT-003`.
- **Checklist de cierre aplicada (RADAR-COLA-05)**:
  1. Tarea correcta confirmada: **No aplica** (no hay ninguna `TODO` no `BLOCKED`; esta corrida se limita al radar exigido cuando la cola queda vacia).
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí** (esta corrida solo añade cambios en `docs/roadmap_codex.md` y `docs/bitacora_codex.md`; el resto del diff visible es heredado y no se modificó en esta ejecución).
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí** (aplica para no reabrir capacidades ya `DONE` ni forzar un cierre ficticio de `V2-R10`).
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: aportar `BACKEND_BASE_URL`, `FRONTEND_BASE_URL` y `BOTICA_RESTORE_DATABASE_URL` reales en un entorno temporal seguro y, con ellas, ejecutar `python scripts/check_deployed_stack.py` y `python scripts/backup_restore_postgres.py restore-drill --dump-file <dump real>`.

## Entrada 2026-03-26-ROADMAP-BACKLOG-01 (apertura de backlog comercial y operativo posterior a V1/V2)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `ROADMAP-BACKLOG-01`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: romper la situación de cola vacía incorporando backlog nuevo, real y atómico en `docs/roadmap_codex.md`, usando evidencia de repo y sin tocar producto.
- **Contexto de cola al arrancar**: la cola operativa estaba vacía y solo persistía `AUT-003` en `BLOCKED` por dependencia externa verificable.
- **Fuentes de verdad consultadas**:
  - `docs/90_estado_implementacion.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/00_vision_proyecto.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/roadmap_cierre_ecommerce_real_incremental.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `.env.railway.example`
  - `backend/configuracion_django/settings.py`
  - `backend/configuracion_django/validaciones_entorno.py`
  - `backend/nucleo_herbal/presentacion/publica/urls.py`
  - `backend/nucleo_herbal/presentacion/publica/views.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/importacion/servicio.py`
  - `frontend/app/botica-natural/page.tsx`
  - `frontend/app/botica-natural/[slug]/page.tsx`
  - `frontend/app/velas-e-incienso/page.tsx`
  - `frontend/app/minerales-y-energia/page.tsx`
  - `frontend/app/herramientas-esotericas/page.tsx`
  - `frontend/componentes/botica-natural/`
  - `frontend/componentes/catalogo/rutasProductoPublico.ts`
  - `frontend/componentes/admin/sincronizacionProductosAdmin.ts`
  - `frontend/contenido/home/seccionesPrincipales.ts`
  - `frontend/tests/botica-natural.test.ts`
  - `frontend/tests/home-raiz-secciones.test.ts`
  - `frontend/tests/backoffice-flujos.test.ts`
  - `tests/nucleo_herbal/test_exposicion_publica.py`
  - `tests/nucleo_herbal/test_deploy_guards.py`
  - `scripts/check_release_readiness.py`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener `AUT-003` exactamente como estaba en `BLOCKED`, porque su dependencia externa sigue vigente.
  2. Abrir la nueva cola ejecutable solo en `docs/roadmap_codex.md`; no tocar roadmaps históricos V1/V2 porque la trazabilidad existente ya basta y no hacía falta una nota adicional.
  3. No reabrir como `TODO` el baseline de `botica-natural` ni el hardening base de Railway: ambos ya tienen evidencia `DONE`; se abren solo brechas residuales de auditoría, paridad, naming, datos, sync y QA.
  4. Dejar `OPS-RWY-001` como primera `TODO` no `BLOCKED`, porque es local, pequeña, verificable y ataca la incidencia operativa aportada por el mantenedor sin depender de Railway UI.
- **Candidatos añadidos finalmente al roadmap**:
  - `OPS-RWY-001`
  - `SEC-PAR-001`
  - `SEC-HER-001`
  - `CAT-DATA-001`
  - `CAT-UI-001`
  - `OPS-RWY-002`
  - `SEC-VEL-001`
  - `SEC-VEL-002`
  - `SEC-MIN-001`
  - `SEC-MIN-002`
  - `SEC-HER-002`
  - `SEC-HER-003`
  - `CAT-DATA-002`
  - `CAT-DATA-003`
  - `CAT-DATA-004`
  - `CAT-SYNC-001`
  - `CAT-QA-001`
  - `OPS-RWY-003` (`BLOCKED`)
- **Candidatos descartados o no reabiertos tal cual**:
  - No se reabrió `botica-natural` como feature base: el baseline ya está cerrado con evidencia en `R09`; la brecha real es de paridad reutilizable respecto a otras secciones.
  - No se reabrió el hardening de variables críticas Railway como si faltara implementación: `R15` ya cerró guardrails backend, `.env.railway.example` y readiness mínimo; la deuda residual es auditoría/preflight/validación externa.
  - `AUT-003` no se convirtió en `TODO`: se preservó como bloqueo externo de go-live y se separó del incidente Railway más acotado.
  - `CAT-DATA-002` no se abrió “desde cero”: se registró como brecha residual porque ya existe un seed mínimo parcial de `velas-e-incienso`.
- **Checks ejecutados**:
  - `python scripts/check_release_readiness.py` -> `OK`.
  - `Select-String -Path docs/roadmap_codex.md -Pattern '^## OPS-RWY-001','^## AUT-003','^## Radar de cola actual'` -> confirma backlog nuevo, `AUT-003` en `BLOCKED` y radar actualizado.
  - `$content = Get-Content -Raw docs/roadmap_codex.md; ...` -> `FIRST_BLOCK_PRESENT=YES`, `AUT003_BLOCKED=YES`.
  - `git diff -- docs/roadmap_codex.md` -> diff coherente, solo documental, sin tocar producto.
- **Resultado verificable**:
  - la cola ejecutable deja de estar vacía;
  - `AUT-003` sigue `BLOCKED` sin alteración de su criterio de desbloqueo;
  - el roadmap nuevo queda ordenado por auditorías locales, luego reusable/tests, después datos/sync/QA y finalmente validación externa;
  - el backlog no reabre cierres históricos ficticios: usa solo brechas residuales reales.
- **Bloqueos (si aplica)**:
  - `AUT-003` sigue bloqueada por URLs/credenciales reales y restore drill externo.
  - `OPS-RWY-003` queda `BLOCKED` por acceso externo a Railway UI/logs y variables reales.
- **Checklist de cierre aplicada (ROADMAP-BACKLOG-01)**:
  1. Tarea correcta confirmada: **No aplica** (corrida extraordinaria de gobernanza pedida explícitamente por el mantenedor para abrir cola nueva; no era ejecución de la primera `TODO` existente).
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí**.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí**.
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `OPS-RWY-001` contrastando la incidencia Railway con `.env.railway.example`, `docs/deploy_railway.md`, `docs/release_readiness_minima.md`, `backend/configuracion_django/settings.py`, `backend/configuracion_django/validaciones_entorno.py`, `scripts/check_release_readiness.py` y `tests/nucleo_herbal/test_deploy_guards.py`.

## Entrada 2026-03-26-OPS-RWY-001 (auditoria boot Railway)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `OPS-RWY-001`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: auditar la incidencia de arranque Railway para separar con evidencia qué guardrails ya existen en backend y qué brecha residual sigue abierta entre documentación, preflight y cobertura de tests.
- **Fuentes de verdad consultadas**:
  - `docs/90_estado_implementacion.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/00_vision_proyecto.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `.env.railway.example`
  - `backend/configuracion_django/settings.py`
  - `backend/configuracion_django/validaciones_entorno.py`
  - `scripts/check_release_readiness.py`
  - `tests/nucleo_herbal/test_deploy_guards.py`
  - `tests/scripts/test_check_release_readiness.py`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Ejecutar `OPS-RWY-001` como primera `TODO` no `BLOCKED` real de la cola actual, respetando el backlog nuevo ya registrado por petición explícita del mantenedor.
  2. No reabrir `R15`, porque `docs/90_estado_implementacion.md` ya acredita el hardening base y la inspección de `settings.py` + `validaciones_entorno.py` confirma el fail-fast backend vigente.
  3. Cerrar la auditoría dejando una sola brecha residual clara: el problema ya no es “falta de guardrail backend”, sino desalineación entre checklist visible de Railway, preflight automatizado y cobertura de tests.
  4. Mantener el worktree heredado sin tocar código de producto ni documentación operativa fuera del roadmap/bitácora; el endurecimiento funcional queda diferido a `OPS-RWY-002`.
- **Checks ejecutados**:
  - `git -c safe.directory=C:/Users/arcas/.codex/worktrees/d70a/botica_bruja_lore status --short --branch` -> branch `codex/inspecciona-cola-del-roadmapff`; el worktree ya traía diff documental en `docs/roadmap_codex.md` y `docs/bitacora_codex.md`, y esta corrida solo lo extiende.
  - `Select-String -Path backend/configuracion_django/settings.py,backend/configuracion_django/validaciones_entorno.py -Pattern 'DATABASE_URL|SECRET_KEY|PUBLIC_SITE_URL|PAYMENT_SUCCESS_URL|PAYMENT_CANCEL_URL|DEFAULT_FROM_EMAIL|EMAIL_BACKEND'` -> confirma guardrails de arranque para base de datos, secreto, URLs públicas/pago y correo seguro.
  - `Select-String -Path .env.railway.example,docs/deploy_railway.md,docs/release_readiness_minima.md -Pattern 'DATABASE_URL|SECRET_KEY|DEBUG=false|PUBLIC_SITE_URL|PAYMENT_SUCCESS_URL|PAYMENT_CANCEL_URL|DEFAULT_FROM_EMAIL|EMAIL_BACKEND|STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET'` -> `.env.railway.example` y `docs/release_readiness_minima.md` cubren el núcleo crítico; `docs/deploy_railway.md` no lista todavía `PAYMENT_SUCCESS_URL`, `PAYMENT_CANCEL_URL`, `STRIPE_SECRET_KEY` ni `STRIPE_WEBHOOK_SECRET` en el checklist principal de Railway UI.
  - `Select-String -Path tests/nucleo_herbal/test_deploy_guards.py,tests/scripts/test_check_release_readiness.py -Pattern 'DATABASE_URL|SECRET_KEY|PUBLIC_SITE_URL|PAYMENT_SUCCESS_URL|PAYMENT_CANCEL_URL|DEFAULT_FROM_EMAIL|EMAIL_BACKEND|Release readiness mínimo validado'` -> `test_deploy_guards.py` cubre `DATABASE_URL`, `SECRET_KEY`, `PUBLIC_SITE_URL` y `EMAIL_BACKEND`; no aparecen casos dedicados para `PAYMENT_SUCCESS_URL`, `PAYMENT_CANCEL_URL` ni `DEFAULT_FROM_EMAIL` inseguro; `test_check_release_readiness.py` solo blinda la ruta verde del script.
  - `python scripts/check_release_readiness.py` -> `OK`.
  - `python scripts/check_release_gate.py` -> `ERROR`; el runner carece de `django`, `next` y `tsc`, así que el gate no es verificable aquí como PASS de entorno completo.
- **Resultado verificable**:
  - el backend ya falla rápido por condiciones críticas de arranque y no hace falta reabrir `R15`;
  - la deuda residual exacta está en la capa previa al boot: `docs/deploy_railway.md` no refleja aún toda la lista mínima visible de Railway, `check_release_readiness.py` verifica marcadores pero no el contrato completo ni valores inseguros, y la cobertura de `test_deploy_guards.py` no blinda todavía URLs de pago ni `DEFAULT_FROM_EMAIL`;
  - `OPS-RWY-001` queda cerrada con un diagnóstico acotado y deja `OPS-RWY-002` como endurecimiento local del hilo Railway;
  - la cola general sigue activa y la primera `TODO` no `BLOCKED` pasa a ser `SEC-PAR-001`.
- **Bloqueos (si aplica)**: ninguno para `OPS-RWY-001`; se mantienen solo los bloqueos externos ya existentes de `AUT-003` y `OPS-RWY-003`.
- **Checklist de cierre aplicada (OPS-RWY-001)**:
  1. Tarea correcta confirmada: **Sí** (`OPS-RWY-001` era la primera `TODO` no `BLOCKED` del roadmap vigente).
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí** (solo `docs/roadmap_codex.md` y `docs/bitacora_codex.md`).
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí** (`R15` se mantiene `DONE` y la auditoría solo describe la brecha residual no implementada).
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `SEC-PAR-001` auditando qué piezas del baseline público de `botica-natural` son reutilizables y qué brecha exacta separa a `velas-e-incienso`, `minerales-y-energia` y `herramientas-esotericas` de esa paridad.

## Entrada 2026-03-26-SEC-PAR-001 (auditoria paridad baseline publico)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `SEC-PAR-001`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: inventariar con evidencia qué partes del baseline público `botica-natural` ya son reutilizables, qué piezas siguen acopladas al baseline y cuál es la brecha exacta que separa a velas, minerales y herramientas de una paridad pública DB-backed.
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `frontend/app/botica-natural/page.tsx`
  - `frontend/app/botica-natural/[slug]/page.tsx`
  - `frontend/app/velas-e-incienso/page.tsx`
  - `frontend/app/minerales-y-energia/page.tsx`
  - `frontend/app/herramientas-esotericas/page.tsx`
  - `frontend/componentes/botica-natural/`
  - `frontend/componentes/catalogo/rutasProductoPublico.ts`
  - `frontend/componentes/catalogo/relacionados/BloqueProductosRelacionados.tsx`
  - `frontend/componentes/catalogo/disponibilidad/EstadoDisponibilidadProducto.tsx`
  - `frontend/infraestructura/api/herbal.ts`
  - `backend/nucleo_herbal/presentacion/publica/views.py`
  - `backend/nucleo_herbal/presentacion/publica/urls.py`
  - `tests/nucleo_herbal/test_exposicion_publica.py`
  - `frontend/tests/botica-natural.test.ts`
  - `frontend/tests/cards-media-clickable.test.ts`
  - `frontend/tests/home-raiz-secciones.test.ts`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Cerrar `SEC-PAR-001` sin tocar código de producto, porque el entregable exigido por la tarea es un inventario verificable de reutilización y huecos, no una extracción/implementación.
  2. Considerar ya reusable la capa de datos pública por sección (backend + `frontend/infraestructura/api/herbal.ts`) y no reabrir esa superficie como problema de dominio o de infraestructura.
  3. Encapsular la brecha real en dos frentes posteriores separados: `SEC-HER-001` para naming canónico de herramientas y `CAT-UI-001` para extracción del contrato reusable de listado/detalle público.
  4. Mantener el orden del roadmap: aunque esta auditoría alimenta `CAT-UI-001`, la primera `TODO` no `BLOCKED` posterior queda en `SEC-HER-001`.
- **Checks ejecutados**:
  - `git -c safe.directory=C:/Users/arcas/.codex/worktrees/d70a/botica_bruja_lore status --short --branch` -> rama `codex/inspecciona-cola-del-roadmapff`; al arrancar solo había diff documental en `docs/roadmap_codex.md` y `docs/bitacora_codex.md`.
  - `Select-String -Path 'docs/roadmap_codex.md' -Pattern '^## SEC-PAR-001' -Context 0,20` -> confirma alcance, checks y estado `TODO` previo de la tarea elegida.
  - `Get-Content`/`Select-String` sobre `frontend/app/botica-natural/page.tsx`, `frontend/app/botica-natural/[slug]/page.tsx`, `frontend/componentes/botica-natural/`, `frontend/componentes/catalogo/rutasProductoPublico.ts`, `frontend/componentes/catalogo/relacionados/BloqueProductosRelacionados.tsx`, `frontend/infraestructura/api/herbal.ts`, `backend/nucleo_herbal/presentacion/publica/views.py` y `urls.py` -> confirma que backend/API ya son genéricos por sección, pero layout, routing y naming visual siguen acoplados a `botica-natural`.
  - `Get-ChildItem -Path 'frontend/app' -Recurse -Directory | Where-Object { $_.FullName -match 'botica-natural|velas-e-incienso|minerales-y-energia|herramientas-esotericas' }` -> solo existe `frontend/app/botica-natural/[slug]`; las otras tres secciones no tienen árbol de detalle.
  - `Get-Content` sobre `frontend/tests/botica-natural.test.ts`, `frontend/tests/cards-media-clickable.test.ts` y `frontend/tests/home-raiz-secciones.test.ts` -> evidencia contractual actual centrada en `botica-natural` y confirma que velas/minerales/herramientas siguen en hero-only.
  - `Get-ChildItem -Path '.' -Recurse -File | Select-String -Pattern '\"velas-e-incienso\"|\"minerales-y-energia\"|\"herramientas-esotericas\"'` -> confirma presencia de esas secciones en home, backoffice, contratos y seed, separando la brecha pública de la brecha de dominio/backoffice.
  - `python scripts/check_release_readiness.py` -> `OK`.
- **Resultado verificable**:
  - la referencia reusable ya existe en la capa de datos pública: listado por sección, detalle de producto y DTO con `seccion_publica`;
  - el bloqueo de paridad no está en backend, sino en frontend público: helper de rutas fijado a `/botica-natural/${slug}`, único `[slug]` público, componentes nombrados/estilados para baseline y tests que blindan ese acoplamiento;
  - `velas-e-incienso`, `minerales-y-energia` y `herramientas-esotericas` ya tienen presencia en home/backoffice/contratos, pero no tienen listado DB-backed, detalle público, vacíos/errores propios ni regresión equivalente;
  - `SEC-PAR-001` queda cerrada y la cola pasa a `SEC-HER-001` como primera `TODO` no `BLOCKED`.
- **Bloqueos (si aplica)**: ninguno para `SEC-PAR-001`.
- **Checklist de cierre aplicada (SEC-PAR-001)**:
  1. Tarea correcta confirmada: **Sí** (`SEC-PAR-001` era la primera `TODO` no `BLOCKED` del roadmap vigente).
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí** (solo `docs/roadmap_codex.md` y `docs/bitacora_codex.md`).
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí** (la auditoría contrasta explícitamente el baseline ya implementado con el backlog público aún no abierto en las otras tres secciones).
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `SEC-HER-001` contrastando naming visible, `seccion_publica` y `tipo_producto` de herramientas para congelar el mapa canónico antes de abrir catálogo público, seed e importación finales.

## Entrada 2026-03-27-SEC-HER-001 (naming canonico herramientas)
- **Fecha (UTC)**: 2026-03-27
- **ID de tarea**: `SEC-HER-001`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: congelar el mapa canónico entre slug de sección pública, naming visible y `tipo_producto` de herramientas antes de abrir catálogo público, seed e importación finales.
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `frontend/contenido/home/seccionesPrincipales.ts`
  - `frontend/componentes/admin/ModuloProductosAdmin.tsx`
  - `frontend/componentes/admin/sincronizacionProductosAdmin.ts`
  - `frontend/app/herramientas-esotericas/page.tsx`
  - `backend/nucleo_herbal/dominio/entidades.py`
  - `backend/nucleo_herbal/presentacion/backoffice_views/productos.py`
  - `backend/nucleo_herbal/presentacion/backoffice_views/productos_contrato.py`
  - `backend/nucleo_herbal/presentacion/backoffice_views/exportacion.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/importacion/servicio.py`
  - `tests/nucleo_herbal/test_entidades.py`
  - `tests/nucleo_herbal/test_casos_de_uso.py`
  - `tests/nucleo_herbal/test_exposicion_publica.py`
- **Archivos tocados**:
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener `herramientas-esotericas` como slug y naming visibles canónicos de sección pública porque es la convención ya implementada en home, ruta pública, backoffice, exportación y tests.
  2. Mantener `herramientas-rituales` como `tipo_producto` canónico porque es la familia comercial estable ya usada por dominio, contrato backoffice, seed demo y tests, y coincide con el lenguaje de `docs/05_modelo_de_dominio_y_entidades.md`.
  3. Declarar explícitamente que `seccion_publica` y `tipo_producto` son ejes distintos y no deben colapsarse: la primera nombra la superficie pública y la segunda clasifica la familia de producto.
  4. Descartar `herramientas` a secas como naming canónico en esta fase por falta de evidencia implementada y para no abrir alias nuevos antes de `SEC-HER-002`.
- **Checks ejecutados**:
  - `Select-String -Path 'docs/roadmap_codex.md' -Pattern '^## SEC-HER-001' -Context 0,20` -> confirmó que `SEC-HER-001` era la primera `TODO` no `BLOCKED` y acotó el perímetro permitido.
  - `Get-ChildItem -Recurse -File frontend,backend,tests,docs | Select-String -Pattern 'herramientas-esotericas|herramientas-rituales'` -> inventarió la evidencia real en home, ruta pública, backoffice, seed, exportación, contrato y tests.
  - `Select-String -Path 'docs/05_modelo_de_dominio_y_entidades.md' -Pattern 'Producto|herramienta ritual' -Context 0,3` -> confirmó que el documento rector de dominio ya encuadra “herramienta ritual” como tipo de producto.
  - `python scripts/check_release_readiness.py` -> `OK`.
- **Resultado verificable**:
  - `docs/05_modelo_de_dominio_y_entidades.md` deja explícito que `Producto` maneja `seccion_publica` como eje de navegación comercial y que para herramientas la convención canónica es `seccion_publica="herramientas-esotericas"` + `tipo_producto="herramientas-rituales"`.
  - `docs/90_estado_implementacion.md` refleja el estado factual vigente de ese naming sin reabrir código ni migraciones.
  - `docs/roadmap_codex.md` cierra `SEC-HER-001` con la decisión trazada y mueve la cola a `CAT-DATA-001`.
  - No se tocaron rutas, datos, seeds ni código funcional; el diff queda dentro del perímetro documental permitido.
- **Bloqueos (si aplica)**: ninguno para `SEC-HER-001`.
- **Checklist de cierre aplicada (SEC-HER-001)**:
  1. Tarea correcta confirmada: **Sí** (`SEC-HER-001` era la primera `TODO` no `BLOCKED` del roadmap vigente).
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí** (`docs/05_modelo_de_dominio_y_entidades.md`, `docs/90_estado_implementacion.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`).
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí** (la decisión se formaliza sin presentar como implementado ningún renombrado o catálogo nuevo).
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `CAT-DATA-001` para fijar cuántos productos publicados necesita cada sección, cuándo aplica vacío honesto y cuándo se permite fallback antes de abrir nuevas secciones públicas.

## Entrada 2026-03-27-CAT-DATA-001 (criterio minimo catalogo publico)
- **Fecha (UTC)**: 2026-03-27
- **ID de tarea**: `CAT-DATA-001`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: fijar el mínimo visible reutilizable por sección para abrir catálogo público sin humo, dejando trazado cuándo aplica vacío honesto y cuándo el fallback de `botica-natural` se preserva solo como excepción legado.
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `frontend/componentes/botica-natural/ListadoProductosBoticaNatural.tsx`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`
  - `scripts/validate_botica_natural_postgres_e2e.py`
- **Archivos tocados**:
  - `docs/02_alcance_y_fases.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener `botica-natural` como baseline público especial con umbral canónico de **5** productos publicados propios, porque ese número ya está fijado por `seed_demo_publico`, `docs/deploy_railway.md` y `scripts/validate_botica_natural_postgres_e2e.py`.
  2. Fijar **3** productos publicados propios como umbral mínimo para abrir nuevas secciones públicas DB-backed (`velas-e-incienso`, `minerales-y-energia`, `herramientas-esotericas`), para sostener compra directa y descubrimiento guiado sin catálogo humo.
  3. Declarar que `1` o `2` productos publicados solo valen como seed/curación interna; no justifican abrir una sección pública nueva.
  4. Preservar el fallback herbal de `botica-natural` solo como compatibilidad legado/bootstrap y prohibir su generalización a nuevas secciones para no mezclar catálogos entre `seccion_publica`.
  5. Limitar el vacío honesto a estados posteriores a la apertura pública de la sección o a filtros activos; no usarlo como sustituto del mínimo de catálogo requerido.
- **Checks ejecutados**:
  - `Select-String -Path docs/roadmap_codex.md -Pattern '^## CAT-DATA-001' -Context 0,20` -> confirmó que `CAT-DATA-001` era la primera `TODO` no `BLOCKED` del roadmap vigente.
  - `Select-String -Path backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py -Pattern 'listar_publicos_por_seccion|botica-natural|fallback' -Context 3,6` -> confirmó que el fallback herbal especial existe hoy solo para `botica-natural`.
  - `@' ... Counter(sections) ... '@ | python -` sobre `seed_demo_publico.py` -> confirmó masa seed factual actual: `botica-natural=5`, `velas-e-incienso=1`.
  - `Get-ChildItem -Recurse -File docs,scripts,tests,frontend,backend | Select-String -Pattern '5 productos|asegura los 5|devolviendo 5'` -> confirmó que el baseline de `botica-natural` ya está anclado también en deploy y validación E2E.
  - `python scripts/check_release_readiness.py` -> `OK`.
- **Resultado verificable**:
  - `docs/02_alcance_y_fases.md` deja fijado el contrato mínimo reusable por sección para abrir catálogo público en fase demo.
  - `docs/90_estado_implementacion.md` separa el estado factual actual (`botica-natural=5`, `velas-e-incienso=1`, resto sin seed equivalente) de la regla operativa futura (`3` para nuevas secciones).
  - `docs/roadmap_codex.md` cierra `CAT-DATA-001` con evidencia y mueve la primera `TODO` no `BLOCKED` a `CAT-UI-001`.
  - No se tocaron seeds, repositorios ni reglas runtime; el diff queda dentro del perímetro documental permitido.
- **Bloqueos (si aplica)**: ninguno para `CAT-DATA-001`.
- **Checklist de cierre aplicada (CAT-DATA-001)**:
  1. Tarea correcta confirmada: **Sí** (`CAT-DATA-001` era la primera `TODO` no `BLOCKED` del roadmap vigente).
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí** (`docs/02_alcance_y_fases.md`, `docs/90_estado_implementacion.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`).
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí** (la regla nueva distingue explícitamente entre baseline factual ya implementado y umbral mínimo aún no implementado para nuevas secciones).
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `CAT-UI-001` para separar el contrato reusable de listado/detalle público del baseline `botica-natural` antes de abrir nuevas secciones DB-backed.

## Entrada 2026-03-27-CAT-UI-001 (contrato reusable baseline publico)
- **Fecha (UTC)**: 2026-03-27
- **ID de tarea**: `CAT-UI-001`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: extraer el contrato reusable minimo del baseline publico `botica-natural` para que nuevas secciones no nazcan como copia dura de listado, mensajes y routing.
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `scripts/check_release_gate.py`
  - `scripts/check_release_readiness.py`
  - `scripts/check_deployed_stack.py`
  - `scripts/backup_restore_postgres.py`
  - `frontend/app/botica-natural/page.tsx`
  - `frontend/app/botica-natural/[slug]/not-found.tsx`
  - `frontend/componentes/botica-natural/ListadoProductosBoticaNatural.tsx`
  - `frontend/componentes/botica-natural/TarjetaProductoBoticaNatural.tsx`
  - `frontend/componentes/botica-natural/detalle/FichaProductoBoticaNatural.tsx`
  - `frontend/componentes/catalogo/rutasProductoPublico.ts`
  - `frontend/tests/botica-natural.test.ts`
  - `frontend/tests/cards-media-clickable.test.ts`
- **Archivos tocados**:
  - `frontend/componentes/botica-natural/contratoSeccionPublica.ts`
  - `frontend/componentes/catalogo/rutasProductoPublico.ts`
  - `frontend/componentes/botica-natural/ListadoProductosBoticaNatural.tsx`
  - `frontend/componentes/botica-natural/detalle/FichaProductoBoticaNatural.tsx`
  - `frontend/app/botica-natural/page.tsx`
  - `frontend/app/botica-natural/[slug]/not-found.tsx`
  - `frontend/tests/botica-natural.test.ts`
  - `frontend/tests/cards-media-clickable.test.ts`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Crear `frontend/componentes/botica-natural/contratoSeccionPublica.ts` como fuente unica del baseline publico para copy, labels, vacio y error de catalogo.
  2. Hacer explicito en `frontend/componentes/catalogo/rutasProductoPublico.ts` que el detalle publico soportado hoy sigue siendo solo la baseline, sin seguir hardcodeando la ruta completa en el helper.
  3. Mantener sin cambios de alcance la realidad de producto: no se abren rutas nuevas para `velas-e-incienso`, `minerales-y-energia` ni `herramientas-esotericas`; solo se deja el write-scope preparado.
  4. Reajustar `frontend/tests/cards-media-clickable.test.ts` para validar el fallback visual donde vive realmente (`ImagenProductoBoticaNatural`) en vez de asumirlo inline en la card.
- **Checks ejecutados**:
  - `Select-String -Path 'docs/roadmap_codex.md' -Pattern '^## CAT-UI-001' -Context 0,20` -> confirmó que `CAT-UI-001` era la primera `TODO` no `BLOCKED`.
  - `Get-Content` sobre `frontend/app/botica-natural/page.tsx`, `frontend/app/botica-natural/[slug]/not-found.tsx`, `frontend/componentes/botica-natural/ListadoProductosBoticaNatural.tsx`, `frontend/componentes/botica-natural/TarjetaProductoBoticaNatural.tsx`, `frontend/componentes/botica-natural/detalle/FichaProductoBoticaNatural.tsx`, `frontend/componentes/catalogo/rutasProductoPublico.ts`, `frontend/tests/botica-natural.test.ts` y `frontend/tests/cards-media-clickable.test.ts` -> inventario de superficie reusable y acoplamientos baseline.
  - `npm.cmd ci` (en `frontend/`) -> dependencias instaladas desde `package-lock.json` para poder validar el cambio en este worktree.
  - `npm.cmd run lint -- --file app/botica-natural/page.tsx --file app/botica-natural/[slug]/not-found.tsx --file componentes/botica-natural/ListadoProductosBoticaNatural.tsx --file componentes/botica-natural/detalle/FichaProductoBoticaNatural.tsx --file componentes/catalogo/rutasProductoPublico.ts --file componentes/botica-natural/contratoSeccionPublica.ts` -> `OK`.
  - `npm.cmd run test:botica-natural` -> `OK` (17/17).
  - `npm.cmd run clean:tmp-tests; .\\node_modules\\.bin\\tsc.cmd --module commonjs --target es2020 --outDir .tmp-tests tests/cards-media-clickable.test.ts; node .tmp-tests/cards-media-clickable.test.js` -> `OK` (6/6).
  - `python scripts/check_release_readiness.py` -> `OK`.
  - `git status --short` + `git diff --name-only` -> el worktree ya arrastraba diff documental previo en `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md` y `docs/90_estado_implementacion.md`; esta corrida no los tocó y dejó sus cambios propios dentro del perímetro permitido, incluyendo el nuevo `frontend/componentes/botica-natural/contratoSeccionPublica.ts`.
- **Resultado verificable**:
  - el baseline público ya tiene contrato reusable explícito para copy, labels, estado vacío/error y nombre visible de sección;
  - el helper de rutas deja trazado el soporte real de detalle público actual sin seguir acoplando el string completo `/botica-natural/${slug}`;
  - la página, el detalle y el `not-found` de `botica-natural` consumen el mismo contrato y reducen duplicación;
  - la cobertura específica del baseline queda actualizada y verde para el nuevo contrato reusable.
- **Bloqueos (si aplica)**: ninguno para `CAT-UI-001`.
- **Checklist de cierre aplicada (CAT-UI-001)**:
  1. Tarea correcta confirmada: **Sí** (`CAT-UI-001` era la primera `TODO` no `BLOCKED` del roadmap vigente).
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí** para los cambios introducidos en esta corrida; `git status --short` deja el nuevo contrato y los cambios de `CAT-UI-001` dentro de scope, mientras el worktree ya arrastraba diff documental previo fuera de scope y no se tocó.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí** (no se declara abierta ninguna sección pública nueva; solo se endurece el baseline existente y el write-scope futuro).
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `OPS-RWY-002` para alinear doc -> script -> tests del preflight Railway antes del boot; dentro del track multisección, `SEC-VEL-001` queda ya desbloqueado como siguiente dependencia lógica.

## Entrada 2026-03-27-OPS-RWY-002 (preflight Railway antes del boot)
- **Fecha (UTC)**: 2026-03-27
- **ID de tarea**: `OPS-RWY-002`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: cerrar la brecha residual entre guardrails backend ya implementados y el contrato preflight de release/deploy para Railway antes del boot, sin tocar Railway UI ni reabrir validaciones runtime ya cerradas.
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `.env.railway.example`
  - `scripts/check_release_gate.py`
  - `scripts/check_release_readiness.py`
  - `scripts/check_deployed_stack.py`
  - `scripts/backup_restore_postgres.py`
  - `backend/configuracion_django/settings.py`
  - `backend/configuracion_django/validaciones_entorno.py`
  - `tests/nucleo_herbal/test_deploy_guards.py`
- **Archivos tocados**:
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `scripts/check_release_readiness.py`
  - `tests/nucleo_herbal/test_deploy_guards.py`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener intacto el guardrail runtime ya cerrado en `backend/configuracion_django/validaciones_entorno.py`; el endurecimiento se limita a contrato documental, preflight automatizado y tests de evidencias.
  2. Declarar `docs/release_readiness_minima.md` como fuente canónica previa al boot y exigir que `docs/deploy_railway.md` replique esa lista bloqueante en la sección principal de variables Railway UI.
  3. Endurecer `scripts/check_release_readiness.py` para contrastar el mismo set de variables críticas entre `.env.railway.example`, `docs/release_readiness_minima.md` y `docs/deploy_railway.md`, en lugar de validar solo marcadores dispersos.
  4. Añadir cobertura explícita en `tests/nucleo_herbal/test_deploy_guards.py` para `PAYMENT_SUCCESS_URL`, `PAYMENT_CANCEL_URL`, `DEFAULT_FROM_EMAIL` ausente y `DEFAULT_FROM_EMAIL` con dominio `.local`.
  5. Aceptar la reejecución del gate en modo UTF-8 (`PYTHONUTF8=1`) como forma verificable de salvar una limitación de decodificación Windows ajena al alcance funcional del task.
- **Checks ejecutados**:
  - `Select-String -Path 'docs/roadmap_codex.md' -Pattern '^## OPS-RWY-002' -Context 0,20` -> confirmó que `OPS-RWY-002` era la primera `TODO` no `BLOCKED`.
  - `python scripts/check_release_readiness.py` -> `OK`.
  - `python manage.py test tests.nucleo_herbal.test_deploy_guards` -> `OK` (14 tests).
  - `python scripts/check_release_gate.py` -> `ERROR`; el runner Windows decodificó la salida de `npm run build` con `cp1252` y el gate cayó en `UnicodeDecodeError`/`AttributeError` antes de emitir veredicto funcional.
  - `$env:PYTHONUTF8='1'; python scripts/check_release_gate.py` -> `OK`; el gate técnico completo quedó en verde con el mismo código del repo y sin tocar alcance adicional.
  - `git status --short docs/release_readiness_minima.md docs/deploy_railway.md scripts/check_release_readiness.py tests/nucleo_herbal/test_deploy_guards.py docs/roadmap_codex.md docs/bitacora_codex.md` + `git diff --name-only -- ...` -> la corrida deja exactamente 6 archivos dentro del perímetro permitido de la tarea; el worktree ya arrastraba diff previo fuera de scope y no se tocó.
- **Resultado verificable**:
  - el checklist de release declara explícitamente la lista bloqueante previa al boot como fuente canónica y `docs/deploy_railway.md` ya replica esa lista en el bloque principal de Railway UI;
  - `check_release_readiness.py` detecta ahora divergencias doc↔script↔env example sobre `SECRET_KEY`, `DATABASE_URL`, `PUBLIC_SITE_URL`, `PAYMENT_SUCCESS_URL`, `PAYMENT_CANCEL_URL`, `DEFAULT_FROM_EMAIL`, `EMAIL_BACKEND`, `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`;
  - la suite `test_deploy_guards.py` cubre ya los casos faltantes de URLs de pago y `DEFAULT_FROM_EMAIL`, alineando el preflight con el guardrail backend real;
  - el gate canónico completo quedó verificado en este runner una vez fijado explícitamente el modo UTF-8 para la ejecución.
- **Bloqueos (si aplica)**:
  - ninguno para `OPS-RWY-002`;
  - `AUT-003` y `OPS-RWY-003` se mantienen como bloqueos externos independientes y sin cambios.
- **Checklist de cierre aplicada (OPS-RWY-002)**:
  1. Tarea correcta confirmada: **Sí** (`OPS-RWY-002` era la primera `TODO` no `BLOCKED` del roadmap vigente).
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí** (`docs/release_readiness_minima.md`, `docs/deploy_railway.md`, `scripts/check_release_readiness.py`, `tests/nucleo_herbal/test_deploy_guards.py`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`).
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí** (`R15` sigue `DONE`; esta corrida endurece exclusivamente el contrato preboot/documental y la evidencia de tests asociada).
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `SEC-VEL-001` para abrir `velas-e-incienso` como sección pública DB-backed apoyada en el baseline reusable ya estabilizado.

## Entrada 2026-03-27-ROADMAP-VELAS-PRIORIDAD (saneamiento de cola previo a `SEC-VEL-001`)
- **Fecha (UTC)**: 2026-03-27
- **ID de tarea**: `ROADMAP-VELAS-PRIORIDAD`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: corregir la prioridad operativa antes de tocar producto, porque `SEC-VEL-001` seguía marcada como primera `TODO` pese a no cumplir todavía el mínimo documental de catálogo público exigido para abrir `velas-e-incienso`.
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `scripts/check_release_gate.py`
  - `scripts/check_release_readiness.py`
  - `scripts/check_deployed_stack.py`
  - `scripts/backup_restore_postgres.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`
  - `backend/nucleo_herbal\infraestructura\persistencia_django\repositorios.py`
  - `frontend/app/velas-e-incienso/page.tsx`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Aplicar precedencia documental estricta: el umbral mínimo vigente de `docs/02_alcance_y_fases.md` y `docs/90_estado_implementacion.md` manda sobre la cola cuando una `TODO` contradice el estado factual.
  2. No tocar código de producto ni abrir `velas-e-incienso` públicamente con un solo seed, porque eso violaría el contrato de **3 productos publicados propios** fijado en `CAT-DATA-001`.
  3. Reordenar `docs/roadmap_codex.md` para que `CAT-DATA-002` pase a ser la primera `TODO` no `BLOCKED`, dejando `SEC-VEL-001` inmediatamente después como siguiente feature real.
  4. Mantener el saneamiento acotado a gobernanza operativa y trazabilidad; no se reabrieron ni alteraron los bloqueos externos de `AUT-003` y `OPS-RWY-003`.
- **Checks ejecutados**:
  - `Select-String -Path 'backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py' -Pattern '"seccion_publica": "velas-e-incienso"' -Encoding UTF8 | Measure-Object` -> `Count = 1`.
  - `Select-String -Path 'docs/02_alcance_y_fases.md','docs/90_estado_implementacion.md' -Pattern '3 productos publicados propios|mínimo 3 productos publicados propios' -Encoding UTF8` -> confirma el mínimo documental de **3** productos propios antes de abrir una sección pública nueva.
  - `Select-String -Path 'docs/roadmap_codex.md' -Pattern '^## CAT-DATA-002','^## SEC-VEL-001','^## Radar de cola actual' -Encoding UTF8` -> confirma el nuevo orden canónico de la cola y el radar actualizado.
  - `python scripts/check_release_readiness.py` -> `OK`.
  - `$env:PYTHONUTF8='1'; python scripts/check_release_gate.py` -> `OK`; el gate técnico canónico siguió verde tras el saneamiento documental.
  - `git status --short docs/roadmap_codex.md docs/bitacora_codex.md` + `git diff --name-only -- docs/roadmap_codex.md docs/bitacora_codex.md` -> la corrida deja exactamente 2 archivos dentro del perímetro permitido; el worktree mantiene diff heredado fuera de scope sin tocar.
- **Resultado verificable**:
  - `SEC-VEL-001` deja de figurar como primera `TODO` ejecutable sin soporte de datos suficiente.
  - `CAT-DATA-002` pasa a ser la primera `TODO` no `BLOCKED` para llevar `velas-e-incienso` al mínimo de 3 productos publicados propios antes de abrir catálogo público.
  - el radar del roadmap queda alineado con la evidencia real del seed y con el contrato mínimo ya fijado en `CAT-DATA-001`.
  - el saneamiento se verificó sin tocar runtime de producto y sin degradar el gate técnico canónico.
- **Bloqueos (si aplica)**:
  - ninguno para este saneamiento de cola;
  - `AUT-003` y `OPS-RWY-003` se mantienen como bloqueos externos independientes y sin cambios.
- **Checklist de cierre aplicada (ROADMAP-VELAS-PRIORIDAD)**:
  1. Tarea correcta confirmada: **No aplica como feature**; la primera `TODO` detectada (`SEC-VEL-001`) quedó invalidada por contradicción documental/factual y esta corrida se limitó al saneamiento previo permitido por Fase 1.
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**; solo se tocaron `docs/roadmap_codex.md` y `docs/bitacora_codex.md`.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí** (`docs/roadmap_codex.md`, `docs/bitacora_codex.md`).
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí**; la cola queda reordenada sin presentar como implementada una sección que aún no cumple el mínimo de catálogo.
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `CAT-DATA-002` para completar la base reproducible mínima de `velas-e-incienso` hasta 3 productos publicados propios antes de retomar `SEC-VEL-001`.

## Entrada 2026-03-27-CAT-DATA-002 (seed mínimo reproducible para `velas-e-incienso`)
- **Fecha (UTC)**: 2026-03-27
- **ID de tarea**: `CAT-DATA-002`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: completar la base mínima reproducible de `velas-e-incienso` hasta 3 productos publicados propios, sin abrir todavía UI pública ni ampliar taxonomía.
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `scripts/check_release_readiness.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`
  - `tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py`
- **Archivos tocados**:
  - `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`
  - `tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Cerrar la brecha de datos con el cambio mínimo: añadir exactamente dos productos seed publicados adicionales para `velas-e-incienso`, sin tocar importación genérica ni UI pública.
  2. Mantener el contrato actual de dominio/backoffice usando tipos ya canónicos (`inciensos-y-sahumerios` y `herramientas-rituales`) dentro de la misma sección pública.
  3. Blindar el umbral con test específico para `velas-e-incienso` en lugar de dejar la validación difusa en el total global del seed.
  4. No tocar `var/dev.sqlite3`; la validación ejecutable real del seed se resolvió sobre SQLite temporal fuera del repo para respetar el perímetro y evitar basura local.
- **Checks ejecutados**:
  - `python manage.py test tests.nucleo_herbal.infraestructura.test_seed_demo_publico_command` -> `OK` (3 tests; crea BD temporal de test, ejecuta `seed_demo_publico` y valida idempotencia + mínimos de botica y velas).
  - `python manage.py seed_demo_publico` -> `ERROR` sobre la SQLite local por `django.db.utils.OperationalError: no such table: nucleo_intencion`; se diagnosticó como falta de migraciones locales, no como fallo del seed.
  - `DATABASE_URL=sqlite:///TEMP/... DEBUG=true SECRET_KEY=seed-validation-key python manage.py migrate --noinput` -> `OK` sobre SQLite temporal fuera del repo.
  - `DATABASE_URL=sqlite:///TEMP/... DEBUG=true SECRET_KEY=seed-validation-key python manage.py seed_demo_publico` -> `OK` sobre SQLite temporal fuera del repo.
  - consulta ORM posterior sobre esa SQLite temporal -> `count=3` para `velas-e-incienso`, con slugs `incienso-ruda-proteccion`, `vela-lunar-blanca`, `vela-miel-dorada`.
  - `Select-String -Path docs/02_alcance_y_fases.md,docs/90_estado_implementacion.md -Pattern 'mínimo 3 productos publicados propios|3 productos publicados propios' -Encoding UTF8` -> `OK`; el umbral documental vigente sigue siendo **3**.
  - `python scripts/check_release_readiness.py` -> `OK`.
  - `git diff --name-only -- backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py docs/roadmap_codex.md docs/bitacora_codex.md` -> solo aparecen los 4 archivos de esta tarea; el worktree mantiene diff heredado fuera de scope sin tocar.
- **Resultado verificable**:
  - `seed_demo_publico.py` deja `velas-e-incienso` con 3 productos publicados propios y reproducibles.
  - el test dedicado obliga ya ese mínimo y evita reabrir la brecha en futuras corridas.
  - `CAT-DATA-002` queda `DONE` y `SEC-VEL-001` pasa a ser la primera `TODO` no `BLOCKED`.
- **Bloqueos (si aplica)**: ninguno para `CAT-DATA-002`.
- **Checklist de cierre aplicada (CAT-DATA-002)**:
  1. Tarea correcta confirmada: **Sí** (`CAT-DATA-002` era la primera `TODO` no `BLOCKED` del roadmap vigente).
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí** (`seed_demo_publico.py`, `test_seed_demo_publico_command.py`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`); el diff ajeno preexistente permanece intacto.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí**; el umbral documental de 3 productos propios se contrastó antes de cerrar y el seed queda alineado con ese contrato.
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `SEC-VEL-001` para abrir `velas-e-incienso` como sección pública DB-backed apoyada en el baseline reusable y en el seed mínimo ya validado.

## Entrada 2026-03-27-SEC-VEL-001 (catalogo publico `velas-e-incienso`)
- **Fecha (UTC)**: 2026-03-27
- **ID de tarea**: `SEC-VEL-001`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: abrir `velas-e-incienso` como seccion publica DB-backed con listado y detalle propios, reutilizando el baseline estabilizado de `botica-natural` sin mezclar otras secciones ni tocar dominio/backend de producto.
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `frontend/app/velas-e-incienso/page.tsx`
  - `frontend/componentes/botica-natural/contratoSeccionPublica.ts`
  - `frontend/componentes/botica-natural/ListadoProductosBoticaNatural.tsx`
  - `frontend/componentes/botica-natural/detalle/FichaProductoBoticaNatural.tsx`
  - `frontend/componentes/catalogo/rutasProductoPublico.ts`
  - `frontend/infraestructura/api/herbal.ts`
  - `frontend/componentes/shell/ContenedorPaginaComercial.tsx`
  - `frontend/componentes/secciones/HeroSeccionPrincipal.tsx`
  - `frontend/tests/botica-natural.test.ts`
- **Archivos tocados**:
  - `frontend/componentes/botica-natural/contratoSeccionPublica.ts`
  - `frontend/componentes/catalogo/rutasProductoPublico.ts`
  - `frontend/app/velas-e-incienso/page.tsx`
  - `frontend/app/velas-e-incienso/[slug]/page.tsx`
  - `frontend/app/velas-e-incienso/[slug]/not-found.tsx`
  - `frontend/tests/velas-e-incienso-publico.test.ts`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Reutilizar `ListadoProductosBoticaNatural` y `FichaProductoBoticaNatural` como baseline visual/comercial ya estabilizado, encapsulando solo la configuracion propia de `velas-e-incienso`.
  2. Mantener el scope en frontend publico: no se tocaron seeds, modelos ni vistas backend porque la API publica por seccion ya estaba disponible y `CAT-DATA-002` ya habia cerrado el minimo de 3 productos propios.
  3. Abrir un detalle publico propio en `/velas-e-incienso/[slug]` y rechazar slugs cuya `seccion_publica` no corresponda a velas, para no mezclar rutas entre secciones.
  4. Actualizar `docs/90_estado_implementacion.md` para que la fuente factual superior refleje la apertura publica real de velas y deje `SEC-VEL-002` como siguiente paso local.
- **Checks ejecutados**:
  - `npm run lint -- --file app/velas-e-incienso/page.tsx --file app/velas-e-incienso/[slug]/page.tsx --file app/velas-e-incienso/[slug]/not-found.tsx --file componentes/botica-natural/contratoSeccionPublica.ts --file componentes/catalogo/rutasProductoPublico.ts` -> `OK`.
  - `npm run test:botica-natural` -> `OK` (17 tests); el baseline reusable no regresa.
  - `./node_modules/.bin/tsc --module commonjs --target es2020 --outDir .tmp-tests tests/velas-e-incienso-publico.test.ts` -> `OK`.
  - `node .tmp-tests/velas-e-incienso-publico.test.js` -> `OK` (2 tests) para listado/routing/detalle de velas.
  - `npm run clean:tmp-tests` -> `OK`.
  - `npm run build` -> `OK`; Next genera `/velas-e-incienso` y `/velas-e-incienso/[slug]` como rutas validas.
  - `python scripts/check_release_readiness.py` -> `OK`.
  - `Select-String -Path docs/roadmap_codex.md -Pattern '^## SEC-VEL-001','^## SEC-VEL-002','^## Radar de cola actual' -Context 0,12` -> `OK`; `SEC-VEL-001` queda `DONE` y la primera `TODO` no `BLOCKED` pasa a `SEC-VEL-002`.
  - `Select-String -Path docs/90_estado_implementacion.md -Pattern '^## 6.1 Contrato activo de catálogo público por sección','^## 7. Ruta operativa vigente','velas-e-incienso ya está publicada|SEC-VEL-002' -Context 0,10` -> `OK`; la fuente factual queda alineada con la apertura publica de velas.
  - `git status --short -- frontend/componentes/botica-natural/contratoSeccionPublica.ts frontend/componentes/catalogo/rutasProductoPublico.ts frontend/app/velas-e-incienso/page.tsx frontend/app/velas-e-incienso/[slug]/page.tsx frontend/app/velas-e-incienso/[slug]/not-found.tsx frontend/tests/velas-e-incienso-publico.test.ts docs/90_estado_implementacion.md docs/roadmap_codex.md docs/bitacora_codex.md` -> `OK`; el diff de esta corrida queda acotado a 9 rutas dentro del perimetro permitido.
- **Resultado verificable**:
  - `velas-e-incienso` deja de ser una pagina solo-hero y pasa a consumir la API publica real de seccion con vacio honesto sobre el contrato reusable.
  - la ruta `/velas-e-incienso/[slug]` ya existe, compila y devuelve `not-found` si se intenta abrir un producto de otra `seccion_publica`.
  - `construirHrefFichaProductoPublico()` ya enruta productos de velas a su detalle publico propio, sin romper el baseline actual de `botica-natural`.
  - `docs/90_estado_implementacion.md` y `docs/roadmap_codex.md` quedan alineados con el estado implementado y dejan `SEC-VEL-002` como siguiente tarea ejecutable.
- **Bloqueos (si aplica)**:
  - ninguno para `SEC-VEL-001`;
  - residuo no bloqueante detectado: `frontend/infraestructura/api/herbal.ts` sigue logando con la etiqueta legacy `[botica-natural]` cuando falla el fetch de seccion durante prerender sin backend, pero no rompe contrato publico ni la feature cerrada.
- **Checklist de cierre aplicada (SEC-VEL-001)**:
  1. Tarea correcta confirmada: **Sí** (`SEC-VEL-001` era la primera `TODO` no `BLOCKED` del roadmap vigente).
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**; solo frontend publico reusable + trazabilidad factual asociada.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí** (`frontend/componentes/botica-natural/contratoSeccionPublica.ts`, `frontend/componentes/catalogo/rutasProductoPublico.ts`, `frontend/app/velas-e-incienso/page.tsx`, `frontend/app/velas-e-incienso/[slug]/page.tsx`, `frontend/app/velas-e-incienso/[slug]/not-found.tsx`, `frontend/tests/velas-e-incienso-publico.test.ts`, `docs/90_estado_implementacion.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`).
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí**; `docs/90_estado_implementacion.md` refleja ya la seccion publica de velas abierta y el siguiente paso local exacto.
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `SEC-VEL-002` para blindar `velas-e-incienso` con contratos automáticos de visibilidad, límite y vacío equivalentes al baseline.

## Entrada 2026-03-27-SEC-VEL-002 (contratos publicos de `velas-e-incienso`)
- **Fecha (UTC)**: 2026-03-27
- **ID de tarea**: `SEC-VEL-002`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: blindar `velas-e-incienso` con cobertura automática mínima equivalente al baseline público, sin reabrir runtime de producto ni ampliar alcance fuera de tests y trazabilidad.
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `frontend/tests/botica-natural.test.ts`
  - `frontend/tests/home-raiz-secciones.test.ts`
  - `frontend/tests/velas-e-incienso-publico.test.ts`
  - `tests/nucleo_herbal/test_exposicion_publica.py`
  - `frontend/app/velas-e-incienso/page.tsx`
  - `frontend/app/velas-e-incienso/[slug]/page.tsx`
  - `frontend/componentes/botica-natural/contratoSeccionPublica.ts`
  - `frontend/componentes/botica-natural/ListadoProductosBoticaNatural.tsx`
  - `frontend/infraestructura/api/herbal.ts`
- **Archivos tocados**:
  - `frontend/tests/velas-e-incienso-publico.test.ts`
  - `tests/nucleo_herbal/test_exposicion_publica.py`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener el alcance en hardening puro: solo tests frontend/backend y actualización documental del estado operativo, sin tocar runtime de catálogo ni contratos de API fuera del perímetro permitido.
  2. Reutilizar el baseline de `botica-natural` como espejo de contrato, pero expresando la regresión de velas en su propio fichero para no mezclar responsabilidades ni tocar `frontend/tests/botica-natural.test.ts`, que ya arrastra diff previo fuera de esta corrida.
  3. Cubrir el vacío honesto en los dos bordes relevantes: frontend (`obtenerProductosPublicosPorSeccion` devolviendo `[]`) y backend (`/api/v1/herbal/secciones/velas-e-incienso/productos/` sin fallback herbal).
  4. Actualizar `docs/90_estado_implementacion.md` porque la ruta factual vigente seguía apuntando a `SEC-VEL-002`; tras el cierre, el siguiente paso local exacto pasa a `SEC-MIN-001`.
- **Checks ejecutados**:
  - `python manage.py test tests.nucleo_herbal.test_exposicion_publica` -> `OK` (28 tests).
  - `npm run clean:tmp-tests` (en `frontend/`) -> `OK`.
  - `./node_modules/.bin/tsc --module commonjs --target es2020 --outDir .tmp-tests tests/types/fetch-next.d.ts tests/velas-e-incienso-publico.test.ts infraestructura/api/herbal.ts` (en `frontend/`) -> `OK`.
  - `node .tmp-tests/tests/velas-e-incienso-publico.test.js` (en `frontend/`) -> `OK` (4 tests).
  - `npm run test:home-raiz` (en `frontend/`) -> `FAIL` no bloqueante; cae por una aserción preexistente de literal en `app/botica-natural/page.tsx` (`"Botica Natural"` ausente) fuera del perímetro de `SEC-VEL-002`.
  - comprobación puntual con script Node sobre `app/velas-e-incienso/page.tsx`, `app/minerales-y-energia/page.tsx`, `app/herramientas-esotericas/page.tsx`, `app/tarot/page.tsx`, `app/rituales/page.tsx` y `app/agenda-mistica/page.tsx` -> `OK`; todas mantienen `idSeccion="..."`, confirmando que el `FAIL` exploratorio de `test:home-raiz` no procede de velas.
- **Resultado verificable**:
  - `frontend/tests/velas-e-incienso-publico.test.ts` cubre ya listado real, detalle público propio, hero/copy de sección y vacío honesto sin fallback en runtime frontend.
  - `tests/nucleo_herbal/test_exposicion_publica.py` protege backend contra dos regresiones clave de velas: mezclar productos de otra sección y reutilizar el fallback herbal legado de `botica-natural`.
  - `docs/roadmap_codex.md` deja `SEC-VEL-002` en `DONE` y mueve la primera `TODO` no `BLOCKED` a `SEC-MIN-001`.
  - `docs/90_estado_implementacion.md` queda alineado con el estado factual actual y con el siguiente paso local exacto.
- **Bloqueos (si aplica)**:
  - ninguno para `SEC-VEL-002`.
  - riesgo no bloqueante detectado: `npm run test:home-raiz` sigue cayendo por una aserción literal sobre `app/botica-natural/page.tsx` ajena a esta tarea y al runtime de velas.
- **Checklist de cierre aplicada (SEC-VEL-002)**:
  1. Tarea correcta confirmada: **Sí** (`SEC-VEL-002` era la primera `TODO` no `BLOCKED` del roadmap vigente).
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**; solo tests de velas y trazabilidad factual/operativa.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí** (`frontend/tests/velas-e-incienso-publico.test.ts`, `tests/nucleo_herbal/test_exposicion_publica.py`, `docs/90_estado_implementacion.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`).
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí**; la fuente factual ya no deja a velas como siguiente paso pendiente y mantiene coherencia con la cola local.
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `SEC-MIN-001` para abrir `minerales-y-energia` como sección pública DB-backed con listado y detalle equivalentes al baseline reusable.

## Entrada 2026-03-27-ROADMAP-MINERALES-PRIORIDAD (saneamiento de cola por seed mínimo y gate roto)
- **Fecha (UTC)**: 2026-03-27
- **ID de tarea**: `ROADMAP-MINERALES-PRIORIDAD`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: sanear la cola multisección para que las aperturas públicas respeten el mínimo contractual de catálogo y para reflejar que el gate canónico ahora está roto por una deriva real de conteos del bootstrap.
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `scripts/check_release_gate.py`
  - `scripts/check_release_readiness.py`
  - `scripts/check_deployed_stack.py`
  - `scripts/backup_restore_postgres.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/90_estado_implementacion.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. No abrir `SEC-MIN-001` porque contradice el contrato vigente: `minerales-y-energia` exige 3 productos publicados propios antes de inaugurar catálogo público DB-backed y el seed actual no los aporta.
  2. Elevar una prioridad más urgente que las features de catálogo: `AUT-004` pasa a ser la primera `TODO` porque `python scripts/check_release_gate.py` falla en `C4)` por una deriva entre el seed público vigente (8 productos) y el test contractual del bootstrap (6).
  3. Reordenar la cola de secciones para que `CAT-DATA-003` anteceda a `SEC-MIN-001` y `CAT-DATA-004` anteceda a `SEC-HER-002`, evitando abrir catálogo sin masa mínima.
  4. Mantener el alcance en saneamiento documental canónico; no se tocó frontend, backend ni datos seed del producto.
- **Checks ejecutados**:
  - `Select-String -Path docs/02_alcance_y_fases.md,docs/90_estado_implementacion.md -Pattern 'mínimo 3 productos publicados propios|3 productos publicados propios|minerales-y-energia' -Encoding UTF8` -> `OK`; confirma el umbral contractual y que minerales aún no tiene seed mínima ni sección pública abierta.
  - `Select-String -Path backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py -Pattern 'minerales-y-energia|velas-e-incienso|botica-natural' -Encoding UTF8` -> `OK`; confirma que el seed actual no contiene productos de `minerales-y-energia`.
  - `python scripts/check_release_readiness.py` -> `OK`.
  - `python scripts/check_release_gate.py` -> `ERROR`; falla en `C4) Test scripts operativos críticos` porque `tests/scripts/test_check_bootstrap_demo_expected_counts.py` espera `productos_publicados = 6` y el seed vigente ya publica 8.
  - `git diff --name-only -- docs/roadmap_codex.md docs/90_estado_implementacion.md docs/bitacora_codex.md` -> `OK`; el diff queda limitado a los 3 documentos canónicos de esta corrida.
- **Resultado verificable**:
  - `docs/roadmap_codex.md` deja de presentar `SEC-MIN-001` como primera `TODO` ejecutable sin seed mínima previa y eleva `AUT-004` como siguiente trabajo real para recuperar el gate.
  - `CAT-DATA-003` queda como siguiente tarea de producto para minerales y `CAT-DATA-004` queda antes de la apertura pública de herramientas.
  - `docs/90_estado_implementacion.md` alinea la ruta operativa vigente y los bloqueos conocidos con la deriva detectada en el gate.
- **Bloqueos (si aplica)**:
  - ninguno para este saneamiento documental;
  - riesgo operativo abierto: el gate canónico permanece en rojo hasta cerrar `AUT-004`.
- **Checklist de cierre aplicada (ROADMAP-MINERALES-PRIORIDAD)**:
  1. Tarea correcta confirmada: **Sí**; la primera `TODO` detectada (`SEC-MIN-001`) quedó invalidada por contradicción documental/factual y esta corrida se limitó al saneamiento previo permitido por Fase 1.
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**; solo se tocaron `docs/roadmap_codex.md`, `docs/90_estado_implementacion.md` y `docs/bitacora_codex.md`.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí**.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí**; no se presenta como implementada una sección que sigue sin seed mínima.
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `AUT-004` para alinear los conteos esperados del bootstrap demo con el seed público vigente y recuperar el gate canónico antes de seguir con `CAT-DATA-003`.

## Entrada 2026-03-27-RADAR-GATE-DOBLE-DERIVA (saneamiento mínimo de cola)
- **Fecha (UTC)**: `2026-03-27`
- **ID de tarea**: `RADAR-GATE-DOBLE-DERIVA`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: revalidar la cola operativa, confirmar si seguía existiendo una primera `TODO` no `BLOCKED` real y sanear `docs/roadmap_codex.md`/`docs/bitacora_codex.md` al detectar una segunda deriva local del gate no trazada todavía.
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `scripts/check_release_gate.py`
  - `scripts/check_release_readiness.py`
  - `scripts/check_deployed_stack.py`
  - `scripts/backup_restore_postgres.py`
  - `tests/scripts/test_check_bootstrap_demo_expected_counts.py`
  - `tests/scripts/test_check_release_gate_contract.py`
  - `tests/scripts/test_check_release_gate_frontend.py`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener `AUT-004` como primera `TODO` no `BLOCKED` para no desalinear la cola operativa con el siguiente paso factual ya vigente en `docs/90_estado_implementacion.md`, pero reducir su promesa al cierre real de `C4)` en lugar de atribuirle por sí sola la recuperación completa del gate.
  2. Materializar `AUT-005` como nueva tarea `TODO` inmediatamente posterior a `AUT-004`, porque el gate canónico ya muestra un segundo fallo local verificable en Windows: el wrapper de `scripts/check_release_gate.py` aborta al capturar la salida Unicode de `npm run build` aunque el build real termine bien.
  3. Mantener sin cambios los bloqueos externos `AUT-003` y `OPS-RWY-003`; siguen faltando `BACKEND_BASE_URL`, `FRONTEND_BASE_URL`, `BOTICA_RESTORE_DATABASE_URL` y acceso externo verificable a Railway/restore drill.
  4. Limitar el saneamiento al perímetro permitido por la automation: solo roadmap y bitácora canónicos, sin tocar producto, tests ni scripts en esta corrida.
- **Checks ejecutados**:
  - `python scripts/check_release_readiness.py` -> `OK`.
  - `python scripts/check_release_gate.py` -> `ERROR`; primero falla en `C4) Test scripts operativos críticos` por `8 != 6` y después aborta en `G) Frontend - build` con `UnicodeDecodeError`/`AttributeError` al capturar la salida de `npm run build`.
  - `python manage.py test tests.scripts.test_check_bootstrap_demo_expected_counts` -> `FAIL`; `productos_publicados` sigue esperando `6` mientras el seed canónico ya publica `8`.
  - `npm.cmd run build` (en `frontend/`) -> `OK`; Next.js compila y genera páginas correctamente, acotando el segundo fallo al wrapper del gate.
  - `$content = Get-Content scripts/check_release_gate.py; foreach ($i in 40..95 + 180..210) { ... }` -> `OK`; confirma uso de `subprocess.run(..., text=True, capture_output=True)` y consumo directo de `result.stdout.strip()` / `result.stderr.strip()` en el bloque que aborta.
  - `$names = 'BACKEND_BASE_URL','FRONTEND_BASE_URL','BOTICA_RESTORE_DATABASE_URL','DATABASE_URL'; foreach ($name in $names) { ... }` -> `BACKEND_BASE_URL=MISSING`, `FRONTEND_BASE_URL=MISSING`, `BOTICA_RESTORE_DATABASE_URL=MISSING`, `DATABASE_URL=MISSING`.
  - `git diff --name-only -- docs/roadmap_codex.md docs/bitacora_codex.md` -> `OK`; el diff queda limitado a los dos documentos canónicos permitidos.
- **Resultado verificable**:
  - la cola sigue activa y sí existe una primera `TODO` no `BLOCKED` real: `AUT-004`;
  - queda trazada una segunda tarea local real (`AUT-005`) antes de volver a producto, evitando que futuras automations asuman falsamente que `AUT-004` basta para dejar el gate recuperado;
  - los bloqueos externos de go-live/Railway siguen siendo reales y no se rebajaron sin evidencia;
  - no se detectó motivo para declarar cola vacía ni para abrir roadmap paralelo.
- **Bloqueos (si aplica)**:
  - ninguno para este saneamiento documental;
  - continúan los bloqueos externos ya conocidos de `AUT-003` y `OPS-RWY-003`.
- **Checklist de cierre aplicada (RADAR-GATE-DOBLE-DERIVA)**:
  1. Tarea correcta confirmada: **Sí**; la primera `TODO` detectada (`AUT-004`) seguía siendo real, pero la cola no era honesta porque omitía un segundo fallo local del gate ya verificable; la corrida se limitó al saneamiento mínimo permitido.
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**; solo se tocaron `docs/roadmap_codex.md` y `docs/bitacora_codex.md`.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí**.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí**; el siguiente paso local exacto sigue siendo `AUT-004`, aunque ahora queda explicitado el endurecimiento inmediato posterior `AUT-005`.
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `AUT-004` para alinear los conteos esperados del bootstrap demo con el seed público vigente; a continuación, ejecutar `AUT-005` para endurecer `scripts/check_release_gate.py` en Windows antes de seguir con `CAT-DATA-003`.

## Entrada 2026-03-27-AUT-004 (conteos bootstrap demo alineados)
- **Fecha (UTC)**: `2026-03-27`
- **ID de tarea**: `AUT-004`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: cerrar la deriva contractual de `C4)` alineando los conteos esperados del bootstrap demo con el seed público canónico vigente, sin mezclar el hardening posterior del wrapper frontend (`AUT-005`).
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `scripts/check_release_gate.py`
  - `scripts/check_release_readiness.py`
  - `scripts/check_deployed_stack.py`
  - `scripts/backup_restore_postgres.py`
  - `scripts/check_bootstrap_demo_expected_counts.py`
  - `scripts/bootstrap_demo_release.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`
  - `tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py`
  - `tests/scripts/test_check_bootstrap_demo_expected_counts.py`
- **Archivos tocados**:
  - `tests/scripts/test_check_bootstrap_demo_expected_counts.py`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener el alcance estrictamente en `AUT-004`: no se tocó `scripts/check_release_gate.py` ni tests de frontend porque el crash Unicode ya está materializado como tarea separada (`AUT-005`).
  2. No modificar `scripts/check_bootstrap_demo_expected_counts.py` ni `scripts/bootstrap_demo_release.py` porque el contrato productivo ya derivaba `8` productos públicos desde el seed canónico; la deriva estaba únicamente en el test contractual.
  3. Actualizar `docs/90_estado_implementacion.md` y `docs/roadmap_codex.md` para que la fuente factual/operativa deje de señalar `AUT-004` como pendiente y pase a `AUT-005` como siguiente paso local exacto.
- **Checks ejecutados**:
  - `python manage.py test tests.scripts.test_check_bootstrap_demo_expected_counts` -> `FAIL` antes del cambio; `test_calcular_conteos_esperados_desde_seed_canonico` fallaba con `AssertionError: 8 != 6`.
  - `python manage.py test tests.nucleo_herbal.infraestructura.test_seed_demo_publico_command` -> `OK`; el seed sigue garantizando 8 productos públicos (`5` en `botica-natural` + `3` en `velas-e-incienso`).
  - `python manage.py test tests.scripts.test_check_bootstrap_demo_expected_counts tests.nucleo_herbal.infraestructura.test_seed_demo_publico_command` -> `FAIL` en el primer rerun tras editar; un `IndentationError` en el test editado se corrigió dentro del mismo ciclo.
  - `python manage.py test tests.scripts.test_check_bootstrap_demo_expected_counts tests.nucleo_herbal.infraestructura.test_seed_demo_publico_command` -> `OK`; el contrato de bootstrap y el seed canónico quedan reconciliados en una misma ejecución.
  - `python scripts/check_release_gate.py` -> `ERROR`; `C4) Test scripts operativos críticos` ya pasa y el siguiente bloqueo local real aparece en `G) Frontend - build` por `UnicodeDecodeError`/`AttributeError` al capturar la salida de `npm run build`.
  - `python scripts/check_release_readiness.py` -> `OK`.
  - `git diff --name-only -- tests/scripts/test_check_bootstrap_demo_expected_counts.py docs/90_estado_implementacion.md docs/roadmap_codex.md docs/bitacora_codex.md` -> `OK`; el diff queda acotado a 4 rutas dentro del perímetro permitido.
- **Resultado verificable**:
  - `tests/scripts/test_check_bootstrap_demo_expected_counts.py` ya refleja el total canónico de `8` productos públicos.
  - `C4)` deja de fallar por deriva de conteos y el siguiente bloqueo local real del gate queda aislado en `AUT-005`.
  - `docs/90_estado_implementacion.md` y `docs/roadmap_codex.md` quedan alineados con la nueva prioridad local exacta sin abrir trabajo paralelo.
- **Bloqueos (si aplica)**:
  - ninguno para `AUT-004`;
  - bloqueo local siguiente ya materializado: `AUT-005` por crash Unicode del wrapper frontend en Windows;
  - continúan sin cambios los bloqueos externos `AUT-003` y `OPS-RWY-003`.
- **Checklist de cierre aplicada (AUT-004)**:
  1. Tarea correcta confirmada: **Sí**; `AUT-004` seguía siendo la primera `TODO` no `BLOCKED` del roadmap vigente.
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**; solo test contractual + trazabilidad factual/operativa asociada.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí** (`tests/scripts/test_check_bootstrap_demo_expected_counts.py`, `docs/90_estado_implementacion.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`).
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí**; la fuente factual ya no deja `AUT-004` como siguiente paso pendiente.
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `AUT-005` para endurecer `scripts/check_release_gate.py` en Windows antes de seguir con `CAT-DATA-003`.

## Entrada 2026-03-27-AUT-005 (gate Windows endurecido para build frontend)
- **Fecha (UTC)**: `2026-03-27`
- **ID de tarea**: `AUT-005`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: recuperar la observabilidad real del gate en Windows evitando que `scripts/check_release_gate.py` aborte al capturar o imprimir la salida Unicode de `npm run build`.
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `scripts/check_release_gate.py`
  - `scripts/check_release_readiness.py`
  - `scripts/check_deployed_stack.py`
  - `scripts/backup_restore_postgres.py`
  - `tests/scripts/test_check_release_gate_frontend.py`
  - `tests/scripts/test_check_release_gate_contract.py`
- **Archivos tocados**:
  - `scripts/check_release_gate.py`
  - `tests/scripts/test_check_release_gate_frontend.py`
  - `tests/scripts/test_check_release_gate_contract.py`
  - `docs/roadmap_codex.md`
  - `docs/90_estado_implementacion.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener el alcance estrictamente en el wrapper del gate y sus tests, sin tocar runtime de producto ni comandos de build/frontend fuera del perímetro de `AUT-005`.
  2. Cambiar la captura de procesos en `scripts/check_release_gate.py` a modo binario y centralizar la decodificación con fallback seguro para evitar `UnicodeDecodeError` en `subprocess` cuando `next build` emite bytes UTF-8 incompatibles con `cp1252`.
  3. Endurecer también la impresión en consola con degradación segura de caracteres no representables para evitar el segundo fallo real detectado (`UnicodeEncodeError` al imprimir símbolos como `✓` en la consola Windows).
  4. Restringir la heurística `SKIP:` a salidas efectivamente canónicas de una sola línea para que el gate no rebaje bloques reales a `SKIP` por líneas incidentales dentro de tests.
- **Checks ejecutados**:
  - `python scripts/check_release_gate.py` -> `ERROR` antes del cambio; reproduce `UnicodeDecodeError` en `subprocess.py` y `AttributeError` en `result.stdout.strip()` al llegar a `G) Frontend - build`.
  - `npm.cmd run build` (en `frontend/`) -> `OK`; acota el fallo al wrapper del gate.
  - `python -m unittest tests.scripts.test_check_release_gate_frontend tests.scripts.test_check_release_gate_contract` -> `FAIL` en la primera iteración de validación; aparece `UnicodeEncodeError` al imprimir `✓` en consola Windows y se corrige dentro de la misma corrida.
  - `python -m unittest tests.scripts.test_check_release_gate_frontend tests.scripts.test_check_release_gate_contract` -> `OK`; cobertura final del hardening en verde.
  - `python scripts/check_release_gate.py` -> `OK`; el gate completo vuelve a cerrar en verde y `G) Frontend - build` deja de abortar.
  - `python scripts/check_release_readiness.py` -> `OK`.
  - `git diff --name-only` -> `OK`; diff final acotado a `scripts/check_release_gate.py`, tests del gate y trazabilidad documental canónica.
- **Resultado verificable**:
  - `scripts/check_release_gate.py` ya no cae ni al capturar ni al imprimir salida Unicode de `next build` en Windows.
  - el resumen final de `python scripts/check_release_gate.py` vuelve a dejar `C4)` y `G) Frontend - build` en `OK`.
  - `docs/roadmap_codex.md` y `docs/90_estado_implementacion.md` dejan `CAT-DATA-003` como siguiente paso local exacto.
- **Bloqueos (si aplica)**:
  - ninguno para `AUT-005`;
  - permanecen sin cambios los bloqueos externos `AUT-003` y `OPS-RWY-003` por falta de URLs/credenciales reales y entorno temporal seguro de restore drill.
- **Checklist de cierre aplicada (AUT-005)**:
  1. Tarea correcta confirmada: **Sí**; `AUT-005` era la primera `TODO` no `BLOCKED` del roadmap vigente.
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**; solo wrapper del gate, tests asociados y trazabilidad canónica.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí** (`scripts/check_release_gate.py`, `tests/scripts/test_check_release_gate_frontend.py`, `tests/scripts/test_check_release_gate_contract.py`, `docs/roadmap_codex.md`, `docs/90_estado_implementacion.md`, `docs/bitacora_codex.md`).
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí**; el estado factual deja de señalar `AUT-005` como pendiente y mueve la cola local a `CAT-DATA-003`.
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `CAT-DATA-003` para crear la base mínima reproducible de `minerales-y-energia` antes de abrir la sección pública.

## Entrada 2026-03-27-CAT-DATA-003 (seed mínimo reproducible para minerales)
- **Fecha (UTC)**: `2026-03-27`
- **ID de tarea**: `CAT-DATA-003`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: crear la base mínima reproducible de `minerales-y-energia` en el seed canónico, sin abrir todavía la sección pública y sin mezclar la feature de catálogo DB-backed.
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `scripts/check_release_gate.py`
  - `scripts/check_release_readiness.py`
  - `scripts/check_deployed_stack.py`
  - `scripts/backup_restore_postgres.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/importacion/esquemas.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/importacion/servicio.py`
  - `backend/nucleo_herbal/presentacion/backoffice_views/productos_contrato.py`
  - `frontend/componentes/admin/sincronizacionProductosAdmin.ts`
  - `frontend/componentes/admin/ModuloProductosAdmin.tsx`
  - `tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py`
  - `tests/scripts/test_check_bootstrap_demo_expected_counts.py`
- **Archivos tocados**:
  - `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`
  - `tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py`
  - `tests/scripts/test_check_bootstrap_demo_expected_counts.py`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Resolver `CAT-DATA-003` solo con seed canónico + pruebas + trazabilidad, sin abrir todavía `frontend/app/minerales-y-energia/` ni tocar contratos públicos de catálogo.
  2. Usar el tipo de producto canónico `minerales-y-piedras` y mantener `seccion_publica="minerales-y-energia"` para no romper el mapa ya aceptado por backoffice y dominio.
  3. Añadir exactamente 3 productos publicados propios de minerales (`cuarzo-cristal-rodado`, `amatista-punta-suave`, `obsidiana-negra-bruta`) para cumplir el umbral de `CAT-DATA-001` sin inflar alcance editorial.
  4. Alinear el contrato de conteos de bootstrap a `11` productos públicos para no reabrir la deriva que ya había cerrado `AUT-004`.
  5. Mantener intactos los cambios preexistentes del worktree ligados a `AUT-005` (`scripts/check_release_gate.py`, `tests/scripts/test_check_release_gate_contract.py`, `tests/scripts/test_check_release_gate_frontend.py`), sin revertirlos ni mezclarlos en esta tarea.
- **Checks ejecutados**:
  - `python manage.py test tests.nucleo_herbal.infraestructura.test_seed_demo_publico_command tests.scripts.test_check_bootstrap_demo_expected_counts` -> `OK`; el seed es idempotente, crea `11` productos públicos y garantiza `3` para `minerales-y-energia`.
  - `python scripts/check_release_gate.py` -> `OK`; el gate canónico completo permanece en verde tras ampliar el seed de catálogo.
  - `python scripts/check_release_readiness.py` -> `OK`.
  - `git status --short` -> `OK`; confirma que el worktree ya venía con cambios previos de `AUT-005` y que esta corrida añade cambios en 6 archivos propios de `CAT-DATA-003`.
  - `git diff --stat -- backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py tests/scripts/test_check_bootstrap_demo_expected_counts.py docs/90_estado_implementacion.md docs/roadmap_codex.md docs/bitacora_codex.md` -> `OK`; diff acotado a 6 archivos, `151` inserciones y `23` borrados.
- **Resultado verificable**:
  - `seed_demo_publico.py` ya deja una base mínima reproducible de `minerales-y-energia` con 3 productos propios publicados.
  - la prueba de seed confirma los slugs exactos de minerales y el contrato de bootstrap pasa a `11` productos públicos sin romper el gate.
  - `docs/90_estado_implementacion.md` y `docs/roadmap_codex.md` mueven el siguiente paso local exacto a `SEC-MIN-001`.
- **Bloqueos (si aplica)**:
  - ninguno para `CAT-DATA-003`;
  - permanecen sin cambios los bloqueos externos `AUT-003` y `OPS-RWY-003` por falta de URLs/credenciales reales y entorno temporal seguro de restore drill.
- **Checklist de cierre aplicada (CAT-DATA-003)**:
  1. Tarea correcta confirmada: **Sí**; `CAT-DATA-003` era la primera `TODO` no `BLOCKED` vigente en `docs/roadmap_codex.md`.
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**; solo seed, pruebas asociadas y trazabilidad canónica.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí**; el diff propio de esta corrida queda acotado a los 6 archivos permitidos de `CAT-DATA-003`, aunque el worktree conserva cambios previos de `AUT-005` que no se tocaron.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí**; se registra solo la base mínima reproducible de seed y no se presenta como implementada la sección pública de minerales.
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `SEC-MIN-001` para abrir `minerales-y-energia` como sección pública DB-backed reutilizando el baseline ya existente.

## Entrada 2026-03-27-SEC-MIN-001 (catalogo publico DB-backed de minerales)
- **Fecha (UTC)**: `2026-03-27`
- **ID de tarea**: `SEC-MIN-001`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: abrir `minerales-y-energia` como sección pública DB-backed con listado y detalle equivalentes al baseline reutilizado, sin mezclar todavía la cobertura contractual amplia de `SEC-MIN-002`.
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `scripts/check_release_gate.py`
  - `scripts/check_release_readiness.py`
  - `scripts/check_deployed_stack.py`
  - `scripts/backup_restore_postgres.py`
  - `frontend/app/velas-e-incienso/page.tsx`
  - `frontend/app/velas-e-incienso/[slug]/page.tsx`
  - `frontend/componentes/botica-natural/contratoSeccionPublica.ts`
  - `frontend/componentes/catalogo/rutasProductoPublico.ts`
  - `frontend/infraestructura/api/herbal.ts`
  - `frontend/tests/velas-e-incienso-publico.test.ts`
  - `tests/nucleo_herbal/test_exposicion_publica.py`
- **Archivos tocados**:
  - `frontend/app/minerales-y-energia/page.tsx`
  - `frontend/app/minerales-y-energia/[slug]/page.tsx`
  - `frontend/app/minerales-y-energia/[slug]/not-found.tsx`
  - `frontend/componentes/botica-natural/contratoSeccionPublica.ts`
  - `frontend/componentes/catalogo/rutasProductoPublico.ts`
  - `frontend/tests/minerales-y-energia-publico.test.ts`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Reutilizar el baseline público ya probado en `velas-e-incienso` para no abrir una implementación paralela ni tocar backend fuera de alcance.
  2. Mantener la responsabilidad del detalle público en el frontend: la página de minerales valida `seccion_publica` y rechaza slugs de otras secciones con `notFound()`.
  3. Extender el contrato reutilizable de sección pública y el helper de rutas solo con `minerales-y-energia`, sin alterar el fallback legado de `botica-natural`.
  4. Añadir una prueba frontend mínima específica de minerales para cerrar la feature con validación real, dejando la cobertura contractual más amplia para `SEC-MIN-002`.
- **Checks ejecutados**:
  - `npm.cmd run clean:tmp-tests` -> `OK`.
  - `npx tsc --module commonjs --target es2020 --outDir .tmp-tests tests/minerales-y-energia-publico.test.ts infraestructura/api/herbal.ts` -> `FAIL`; el comando aislado no incluía `tests/types/fetch-next.d.ts` y TypeScript rechazó `next` en `RequestInit`.
  - `npx tsc --module commonjs --target es2020 --outDir .tmp-tests tests/minerales-y-energia-publico.test.ts tests/types/fetch-next.d.ts infraestructura/api/herbal.ts` -> `OK`.
  - `node .tmp-tests/tests/minerales-y-energia-publico.test.js` -> `OK`.
  - `python scripts/check_release_gate.py` -> `OK`.
  - `python scripts/check_release_readiness.py` -> `OK`.
  - `Select-String -Path "docs/02_alcance_y_fases.md","docs/90_estado_implementacion.md" -Pattern "mínimo 3 productos publicados propios|minerales-y-energia" -Encoding UTF8` -> `OK`; confirma umbral mínimo de 3 productos propios y estado factual actualizado de la sección.
  - `$names = 'BACKEND_BASE_URL','FRONTEND_BASE_URL','BOTICA_RESTORE_DATABASE_URL','DATABASE_URL'; foreach ($name in $names) { ... }` -> `BACKEND_BASE_URL=MISSING`, `FRONTEND_BASE_URL=MISSING`, `BOTICA_RESTORE_DATABASE_URL=MISSING`, `DATABASE_URL=MISSING`.
  - `git status --short -- "frontend/app/minerales-y-energia" "frontend/componentes/botica-natural/contratoSeccionPublica.ts" "frontend/componentes/catalogo/rutasProductoPublico.ts" "frontend/tests/minerales-y-energia-publico.test.ts" "docs/90_estado_implementacion.md" "docs/roadmap_codex.md" "docs/bitacora_codex.md"` -> `OK`; el perímetro propio de la tarea queda acotado a 9 rutas, sin tocar los cambios previos del worktree fuera de ese conjunto.
- **Resultado verificable**:
  - `minerales-y-energia` ya expone listado DB-backed y detalle público propios reutilizando el contrato comercial existente.
  - el helper de rutas públicas ya dirige productos de minerales a `/minerales-y-energia/[slug]` y el detalle rechaza slugs de otras secciones.
  - la validación mínima específica de minerales pasa en ejecución real y el gate canónico completo permanece en verde tras abrir la sección.
  - `docs/90_estado_implementacion.md` y `docs/roadmap_codex.md` ya dejan `SEC-MIN-002` como siguiente paso local exacto.
- **Bloqueos (si aplica)**:
  - ninguno para `SEC-MIN-001`;
  - permanecen sin cambios los bloqueos externos `AUT-003` y `OPS-RWY-003` por falta de URLs/credenciales reales y entorno temporal seguro de restore drill.
- **Checklist de cierre aplicada (SEC-MIN-001)**:
  1. Tarea correcta confirmada: **Sí**; `SEC-MIN-001` era la primera `TODO` no `BLOCKED` vigente en `docs/roadmap_codex.md`.
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**; solo frontend público reutilizable, prueba mínima específica y trazabilidad canónica.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí**; el perímetro propio queda acotado por `git status --short -- ...` a las 9 rutas permitidas de la tarea, mientras el worktree conserva cambios previos no tocados.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí**; la sección pública de minerales ahora se declara implementada solo porque ya existe listado/detalle navegables y validación ejecutada.
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `SEC-MIN-002` para añadir la cobertura contractual mínima de visibilidad, límite y vacío honesto para `minerales-y-energia`.

## Entrada 2026-03-27-SEC-MIN-002 (regresion minima publica de minerales)
- **Fecha (UTC)**: `2026-03-27`
- **ID de tarea**: `SEC-MIN-002`
- **Estado final**: `DONE`
- **Objetivo de la ejecución**: endurecer la nueva sección pública de `minerales-y-energia` con cobertura contractual mínima equivalente al baseline, sin reabrir producto ni mezclar nuevas features.
- **Fuentes de verdad consultadas**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `AGENTS.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `docs/release_readiness_minima.md`
  - `docs/deploy_railway.md`
  - `scripts/check_release_gate.py`
  - `scripts/check_release_readiness.py`
  - `scripts/check_deployed_stack.py`
  - `scripts/backup_restore_postgres.py`
  - `frontend/tests/minerales-y-energia-publico.test.ts`
  - `frontend/tests/velas-e-incienso-publico.test.ts`
  - `frontend/tests/home-raiz-secciones.test.ts`
  - `tests/nucleo_herbal/test_exposicion_publica.py`
  - `backend/nucleo_herbal/presentacion/publica/views.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`
- **Archivos tocados**:
  - `frontend/tests/minerales-y-energia-publico.test.ts`
  - `tests/nucleo_herbal/test_exposicion_publica.py`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener el alcance en hardening puro: solo pruebas y trazabilidad canónica, sin volver a tocar `frontend/app/minerales-y-energia/` ni el backend de producto ya abierto en `SEC-MIN-001`.
  2. Replicar el patrón de cierre de `SEC-VEL-002` para minerales: frontend cubre contrato público visible y backend protege el listado propio y el vacío honesto sin fallback.
  3. Dejar explícito en frontend que `obtenerProductosPublicosPorSeccion("minerales-y-energia")` mantiene visibles 6 productos válidos sin recorte ni fallback inventado.
  4. Dejar explícito en backend que la API pública de minerales devuelve solo productos propios, ordenados por slug, y permanece vacía cuando la sección no tiene catálogo publicado.
- **Checks ejecutados**:
  - `python manage.py test tests.nucleo_herbal.test_exposicion_publica` -> `OK`; 30 tests en verde con los nuevos casos de minerales.
  - `npx tsc --module commonjs --target es2020 --outDir .tmp-tests tests/minerales-y-energia-publico.test.ts tests/types/fetch-next.d.ts infraestructura/api/herbal.ts` (en `frontend/`) -> `OK`.
  - `node .tmp-tests/tests/minerales-y-energia-publico.test.js` (en `frontend/`) -> `OK`; 5 pruebas en verde.
  - `python scripts/check_release_gate.py` -> `OK`.
  - `python scripts/check_release_readiness.py` -> `OK`.
- **Resultado verificable**:
  - `tests/nucleo_herbal/test_exposicion_publica.py` ya cubre `minerales-y-energia` con listado público propio y ordenado de 6 registros visibles, y vacío honesto sin fallback herbal.
  - `frontend/tests/minerales-y-energia-publico.test.ts` ya cubre visibilidad del listado de 6 productos, contrato reusable de sección pública, detalle propio y vacío honesto del cliente público.
  - `docs/90_estado_implementacion.md` y `docs/roadmap_codex.md` ya dejan `CAT-DATA-004` como siguiente paso local exacto.
- **Bloqueos (si aplica)**:
  - ninguno para `SEC-MIN-002`;
  - permanecen sin cambios los bloqueos externos `AUT-003` y `OPS-RWY-003` por falta de URLs/credenciales reales y entorno temporal seguro de restore drill.
- **Checklist de cierre aplicada (SEC-MIN-002)**:
  1. Tarea correcta confirmada: **Sí**; `SEC-MIN-002` era la primera `TODO` no `BLOCKED` vigente en `docs/roadmap_codex.md`.
  2. Una sola tarea ejecutada en la corrida: **Sí**.
  3. Alcance respetado sin sobrealcance: **Sí**; solo pruebas y trazabilidad canónica del hardening de minerales.
  4. Evidencia verificable registrada: **Sí**.
  5. Checks ejecutados y registrados: **Sí**.
  6. Roadmap actualizado: **Sí**.
  7. Bitácora actualizada: **Sí**.
  8. Diff dentro del perímetro permitido: **Sí**; el trabajo propio queda acotado a 5 rutas permitidas, mientras el worktree conserva cambios previos no tocados fuera de este bloque.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **Sí**; la sección pública de minerales ya estaba implementada y esta corrida solo cierra su red mínima de regresión.
  10. Siguiente paso exacto definido: **Sí**.
- **Siguiente paso exacto**: ejecutar `CAT-DATA-004` para definir y cargar la base mínima reproducible de la sección canónica de herramientas.
