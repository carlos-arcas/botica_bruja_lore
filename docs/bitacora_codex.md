# Bitácora operativa Codex

## Propósito
Registro trazable de cada ejecución autónoma: tarea, archivos tocados, decisiones, checks, resultado, bloqueos y siguiente paso exacto.

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

## Entrada 2026-04-26-V2G-001 (auditoria cierre go-live v2)
- **Fecha (UTC)**: 2026-04-26
- **ID de tarea**: `V2G-001`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: contrastar el alcance pendiente de `V2-R10` con scripts, tests y documentacion reales para decidir con evidencia si puede cerrarse o queda bloqueado por dependencias externas.
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
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/release_readiness_minima.md`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `docs/deploy_railway.md`
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/90_estado_implementacion.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Cerrar `V2G-001` como auditoria `DONE`, porque la evidencia local permite decidir el estado real de `V2-R10`.
  2. Marcar `V2-R10` como `BLOCKED` externo, no como `DONE`, porque falta smoke post-deploy real y restore drill real contra entorno seguro.
  3. Crear `V2G-002` en `BLOCKED` para que el siguiente desbloqueo no improvise alcance ni active pagos reales.
- **Checklist de cierre aplicada (V2G-001)**:
  1. Tarea correcta confirmada: **Si** (`V2G-001` era la primera `TODO` no `BLOCKED`).
  2. Una sola tarea ejecutada en la corrida: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se tocaron backend, frontend, negocio, deploy real, backup real ni restore real.
  4. Evidencia verificable registrada: **Si**.
  5. Checks ejecutados y registrados: **Si**.
  6. Roadmap actualizado: **Si**.
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**.
  9. Definido vs implementado validado con `docs/90`: **Si**; capacidades R01-R09 permanecen cerradas y `V2-R10` queda como bloqueo externo.
  10. Siguiente paso exacto definido: **Si** (`V2G-002`, bloqueado hasta disponer de URLs desplegadas y PostgreSQL temporal seguro).
- **Checks ejecutados**:
  - `git status --short` -> sin cambios iniciales.
  - consulta de procesos del repo con `Get-CimInstance Win32_Process ... Contains($RepoRoot)` -> sin ejecucion activa del repo.
  - `.venv\Scripts\python.exe scripts\check_release_readiness.py` -> OK.
  - `.venv\Scripts\python.exe scripts\check_operational_alerts_v2.py --fail-on none --json` -> OK, sin alertas.
  - `.venv\Scripts\python.exe scripts\retry_operational_tasks_v2.py --dry-run --json` -> OK, sin candidatos ni mutaciones.
  - `.venv\Scripts\python.exe scripts\backup_restore_postgres.py backup --dry-run --backup-dir <temp> --database-url postgresql://user:secret@localhost:5432/botica` -> OK, sin dump real.
  - `.venv\Scripts\python.exe scripts\backup_restore_postgres.py restore-drill --dry-run --restore-database-url postgresql://user:secret@localhost:5432/botica_restore --dump-file <temp-sample>` -> OK; archivo temporal eliminado.
  - `.venv\Scripts\python.exe scripts\check_deployed_stack.py` -> esperado BLOCKED por configuracion: falta `BACKEND_BASE_URL`.
  - `.venv\Scripts\python.exe scripts\check_release_gate.py` -> OK; incluye `tests.scripts` con 44 tests y conciliacion operativa sin inconsistencias. Los pasos frontend quedan en `SKIP` informativo porque `npm` no esta disponible en el entorno del gate.
- **Resultado verificable**:
  - `V2G-001` queda `DONE` con evidencia en `docs/roadmap_codex.md`.
  - `V2-R10` queda `BLOCKED` en `docs/roadmap_ecommerce_real_v2.md` por dependencias externas concretas.
  - `docs/90_estado_implementacion.md` refleja el estado real: go-live v2 bloqueado externamente, no cerrado.
  - `V2G-002` queda creado como tarea bloqueada para el desbloqueo operacional futuro.
- **Bloqueos (si aplica)**: smoke post-deploy real requiere `BACKEND_BASE_URL` y `FRONTEND_BASE_URL`; backup/restore real requiere `DATABASE_URL`, `BOTICA_BACKUP_DIR` fuera del repo y `BOTICA_RESTORE_DATABASE_URL` contra base temporal segura.
- **Siguiente paso exacto**: desbloquear `V2G-002` cuando existan entorno desplegado/staging y PostgreSQL temporal autorizados, sin pagos reales ni banco/PSP real.

## Entrada 2026-04-27-RUN-001 (check no destructivo de setup/run_app)
- **Fecha (UTC)**: 2026-04-27
- **ID de tarea**: `RUN-001`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: crear y validar un modo no destructivo para comprobar `setup_entorno.bat` y `run_app.bat` sin instalar dependencias ni arrancar servidores persistentes.
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
- **Archivos tocados**:
  - `run_app.bat`
  - `setup_entorno.bat`
  - `docs/roadmap_codex.md`
  - `docs/90_estado_implementacion.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Al no existir tarea `TODO` ejecutable (`V2G-002` esta `BLOCKED` por infraestructura externa), se crea `RUN-001` por el alcance permanente de funcionamiento real de `run_app/setup`.
  2. Se implementa `--check`/`/check` en ambos `.bat` para validar entorno sin instalar ni arrancar servidores.
  3. Se separa el smoke real de servidores en `RUN-002`, porque requiere arrancar procesos, controlar puertos y cerrar PIDs en una iteracion propia.
- **Incidencia durante validacion**:
  - La primera version de `run_app.bat --check` ejecutaba los bloques `start` antes de salir. Se corrigio dentro de la misma tarea moviendo la salida `--check` antes de cualquier arranque.
  - Los procesos abiertos por esa validacion pertenecian inequivocamente al repo actual y fueron cerrados por PID: `16040`, `1528`, `34316`, `10460`, `10516`, `26684`, `35460`, `33828`, `14488`, `13620`, `12152`, `13012`, `19572`, `31700`, `30392`, `16660`, `18376`, `25828`.
- **Checklist de cierre aplicada (RUN-001)**:
  1. Tarea correcta confirmada: **Si**; no habia `TODO` ejecutable y se creo tarea atomica por alcance operativo permanente.
  2. Una sola tarea ejecutada en la corrida: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se modifico producto ni se activo pago real.
  4. Evidencia verificable registrada: **Si**.
  5. Checks ejecutados y registrados: **Si**.
  6. Roadmap actualizado: **Si**.
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**.
  9. Definido vs implementado validado con `docs/90`: **Si**; la capacidad queda registrada como operacion local, no como go-live real.
  10. Siguiente paso exacto definido: **Si** (`RUN-002`).
- **Checks ejecutados**:
  - preflight de lock/procesos/git status -> sin lock ni procesos iniciales; habia cambios documentales pendientes aceptados como contexto por instruccion del usuario.
  - `cmd /c setup_entorno.bat --check` -> OK; valida `.venv`, `requirements.txt`, `npm` y `frontend\node_modules` sin instalar.
  - `cmd /c run_app.bat --check` -> OK; valida setup, backend y frontend sin iniciar servidores tras la correccion.
  - consulta de procesos por ruta absoluta del repo -> sin procesos vivos al cierre de la validacion.
- **Resultado verificable**:
  - `setup_entorno.bat --check` funciona como check no destructivo.
  - `run_app.bat --check` funciona como check no destructivo y no deja procesos vivos.
  - `RUN-001` queda `DONE` y `RUN-002` queda como primera tarea `TODO` para smoke real controlado.
- **Bloqueos (si aplica)**: ninguno.
- **Siguiente paso exacto**: ejecutar `RUN-002` para arrancar backend/frontend en puertos libres, validar respuesta basica y cerrar PIDs registrados.
