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
- **Siguiente paso exacto**: ejecutar `CRX-003` para formalizar protocolo de `BLOCKED`/desbloqueo con campos mínimos y consistencia AGENTS?roadmap?bitácora.

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
  1. Secuencia macro histórica C1?C6 (`docs/14`) vs estado real posterior ya implementado (`docs/90`).
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
  - `@' ... roadmap_codex.md first TODO detector ... '@ | python -` ? devuelve `## V2G-001 — Auditoría de cierre de \`V2-R10\` (go-live checklist v2)`
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

## Entrada 2026-04-27-RUN-002 (smoke controlado backend/frontend local)
- **Fecha (UTC)**: 2026-04-27
- **ID de tarea**: `RUN-002`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: comprobar que backend Django y frontend Next arrancan en local/demo, responden a una peticion basica y se cierran por PID registrado.
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
  - `docs/roadmap_codex.md`
  - `docs/90_estado_implementacion.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Ejecutar `RUN-002` como primera tarea `TODO` no `BLOCKED`.
  2. Usar puertos altos (`18080`, `13080`) tras comprobar que estaban libres, para no interferir con procesos ajenos.
  3. Arrancar Django con `--noreload` para reducir procesos no controlados; aun asi se registraron y cerraron todos los procesos del repo detectados.
  4. Considerar valido el `404` de la raiz Django como smoke de disponibilidad, porque confirma servidor vivo y alcanzable aunque el backend no exponga home publica en `/`.
- **Checklist de cierre aplicada (RUN-002)**:
  1. Tarea correcta confirmada: **Si** (`RUN-002` era la primera `TODO` no `BLOCKED`).
  2. Una sola tarea ejecutada en la corrida: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se modifico producto ni se activo pago real.
  4. Evidencia verificable registrada: **Si**.
  5. Checks ejecutados y registrados: **Si**.
  6. Roadmap actualizado: **Si**.
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**.
  9. Definido vs implementado validado con `docs/90`: **Si**; queda registrado como smoke local, no como go-live real.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - preflight de lock/procesos/git status -> sin lock, sin procesos y sin cambios pendientes.
  - lectura obligatoria de `AGENTS.md` y docs troncales.
  - `cmd /c run_app.bat --check` -> OK, sin iniciar servidores.
  - `Get-NetTCPConnection -LocalPort 18080,13080` -> ambos puertos libres.
  - backend: `.venv\Scripts\python.exe manage.py runserver 127.0.0.1:18080 --noreload` -> proceso iniciado.
  - frontend: `node frontend\node_modules\next\dist\bin\next dev -p 13080 -H 127.0.0.1` -> proceso iniciado.
  - `Invoke-WebRequest http://127.0.0.1:18080/` -> `404` esperado de Django en raiz.
  - `Invoke-WebRequest http://127.0.0.1:13080/` -> `200`, contenido recibido.
  - cierre de PIDs asociados al repo -> `17668`, `19528`, `11800`, `32752`.
  - revision final de procesos por ruta absoluta del repo -> sin procesos vivos.
- **Resultado verificable**:
  - backend y frontend arrancan localmente en puertos libres;
  - ambos responden por HTTP;
  - no quedan procesos vivos asociados al repo;
  - `RUN-002` queda `DONE`.
- **Bloqueos (si aplica)**: ninguno.
- **Siguiente paso exacto**: seleccionar en la proxima iteracion la primera `TODO` no `BLOCKED`; si no existe, crear una tarea atomica nueva orientada al flujo ecommerce local/demo sin pagos reales.

## Entrada 2026-04-28-ELS-001 (reencauce ecommerce local simulado)
- **Fecha (UTC)**: 2026-04-28
- **ID de tarea**: `ELS-001`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: reencauzar oficialmente la fuente de verdad hacia ecommerce local real con pago simulado, deprecando progresivamente la demo legacy sin implementar todavia la pasarela simulada.
- **Fuentes de verdad consultadas**:
  - `AGENTS.md`
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/05_modelo_de_dominio_y_entidades.md`
  - `docs/07_arquitectura_tecnica.md`
  - `docs/08_decisiones_tecnicas_no_negociables.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/10_checkout_y_flujos_ecommerce.md`
  - `docs/17_migracion_ecommerce_real.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Archivos tocados**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Declarar `/checkout`, `/pedido/[id_pedido]` y `/mi-cuenta` como rutas principales de la fase local.
  2. Declarar `/encargo`, `/pedido-demo` y `cuenta-demo` como legacy deprecado/controlado, sin borrado inmediato.
  3. Reservar Stripe para futuro y fijar que el pago simulado entrara por puerto/adaptador.
  4. Mantener `V2-R10` bloqueado para go-live externo: la validacion local con pago simulado no activa pagos reales ni despliegue real.
- **Checklist de cierre aplicada (ELS-001)**:
  1. Tarea correcta confirmada: **Si**; no habia `TODO` ejecutable no bloqueado y el usuario pidio un reencauce documental explicito.
  2. Una sola tarea ejecutada en la corrida: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se tocaron frontend, backend funcional, endpoints, Stripe ni CTAs.
  4. Evidencia verificable registrada: **Si**.
  5. Checks ejecutados y registrados: **Si**.
  6. Roadmap actualizado: **Si**.
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**.
  9. Definido vs implementado validado con `docs/90`: **Si**; la fase queda `PLANIFICADO`, no `DONE`.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - lectura obligatoria de `AGENTS.md` y docs troncales.
  - lectura especifica de `docs/90_estado_implementacion.md`, `docs/roadmap_ecommerce_real_v2.md`, `docs/10_checkout_y_flujos_ecommerce.md`, `docs/17_migracion_ecommerce_real.md` y `docs/02_alcance_y_fases.md`.
  - `git diff --check` -> OK; solo avisos de normalizacion LF/CRLF en Windows, sin errores de whitespace.
  - `.venv\Scripts\python.exe scripts\check_repo_operational_integrity.py` -> OK; integridad operativa/documental validada.
  - `git status --short` -> diff limitado a documentacion permitida y nuevo roadmap local simulado.
- **Resultado verificable**:
  - existe `docs/roadmap_ecommerce_local_simulado.md`;
  - `docs/90_estado_implementacion.md` refleja nueva fase sin declarar implementacion;
  - `docs/roadmap_ecommerce_real_v2.md` no contradice el bloqueo de `V2-R10`;
  - queda claro que la pasarela de pago es la unica pieza simulada y que la demo legacy se depreca sin eliminarse.
- **Bloqueos (si aplica)**: ninguno.
- **Siguiente paso exacto**: ejecutar `ELS-002`, deprecacion UX de demo legacy, sin borrar rutas demo ni cambiar todavia el contrato funcional real.

## Entrada 2026-04-28-ELS-002 (deprecacion UX demo legacy)
- **Fecha (UTC)**: 2026-04-28
- **ID de tarea**: `ELS-002`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: quitar protagonismo publico al flujo demo legacy y orientar la navegacion comercial normal hacia `/checkout`.
- **Fuentes de verdad consultadas**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `frontend/app/checkout/page.tsx`
  - `frontend/app/encargo/page.tsx`
  - componentes de catalogo/ficha/cesta con CTAs comerciales
  - tests frontend de shell, checkout real, cesta, catalogo, fichas y legales
- **Archivos tocados**:
  - `frontend/contenido/shell/navegacionGlobal.ts`
  - `frontend/componentes/shell/FooterComercial.tsx`
  - `frontend/componentes/catalogo/cesta/VistaCestaRitual.tsx`
  - `frontend/app/cesta/page.tsx`
  - `frontend/app/encargo/page.tsx`
  - `frontend/componentes/catalogo/detalle/FichaProductoCatalogo.tsx`
  - `frontend/componentes/botica-natural/detalle/FichaProductoBoticaNatural.tsx`
  - `frontend/contenido/legal/paginasLegalesComerciales.ts`
  - `frontend/componentes/legal/PaginaLegalComercial.tsx`
  - `frontend/tests/shell-global.test.ts`
  - `frontend/tests/checkout-real-ui.test.ts`
  - `frontend/tests/fichas-publicas-seo.test.ts`
  - `frontend/tests/legal-comercial.test.ts`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. La navegacion principal publica expone `/checkout` y retira `/encargo` y `/cuenta-demo`.
  2. La cesta serializa la seleccion hacia `/checkout?cesta=...` como CTA principal y conserva `/encargo?origen=seleccion` como orientacion secundaria.
  3. Las fichas de coleccion y Botica Natural incorporan `Comprar ahora` hacia `/checkout?producto=...`.
  4. `/encargo` se presenta como canal de consulta personalizada, sin borrarlo ni romper `FlujoEncargoConsulta`.
  5. Las paginas informativas conservan encargo como CTA secundario, no como accion principal.
- **Checklist de cierre aplicada (ELS-002)**:
  1. Tarea correcta confirmada: **Si** (`ELS-002` era la primera `TODO` no `BLOCKED`).
  2. Una sola tarea ejecutada en la corrida: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se toco backend, Stripe, endpoints ni modelo de pedido.
  4. Evidencia verificable registrada: **Si**.
  5. Checks ejecutados y registrados: **Si**.
  6. Roadmap actualizado: **Si**.
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra solo deprecacion UX, no pago simulado.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `npm --prefix frontend run test:shell` -> OK.
  - `npm --prefix frontend run test:checkout-real` -> OK.
  - `npm --prefix frontend run test:cesta` -> OK.
  - `npm --prefix frontend run test:legal` -> OK.
  - `npm --prefix frontend run test:fichas-seo` -> OK.
  - `npm --prefix frontend run lint` -> OK.
  - `npm --prefix frontend run test:catalogo-detalle` -> OK.
  - `npm --prefix frontend run build` -> OK.
  - `npm --prefix frontend run test:catalogo` -> OK al repetirlo en solitario; la primera ejecucion fallo por `EPERM` al limpiar `.tmp-tests` mientras otros comandos paralelos usaban la misma carpeta temporal.
  - `git diff --check` -> OK; solo avisos LF/CRLF de Windows.
- **Resultado verificable**:
  - recorrido publico normal navega hacia `/checkout`;
  - `/encargo` sigue existiendo como consulta personalizada secundaria;
  - `/pedido-demo` y `cuenta-demo` no se promocionan como CTAs principales;
  - build frontend pasa.
- **Bloqueos (si aplica)**: ninguno.
- **Siguiente paso exacto**: ejecutar `ELS-003`, pasarela simulada local por puerto/adaptador, sin activar Stripe ni pagos reales.

## Entrada 2026-04-28-ELS-003 (pasarela simulada local por puerto)
- **Tarea seleccionada**: `ELS-003 - Pasarela simulada local por puerto`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: incorporar una pasarela local simulada como adaptador del puerto de pago, seleccionable por configuracion y sin mover la simulacion a dominio, vistas ni componentes.
- **Documentos/fuentes leidas**:
  - `AGENTS.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `backend/nucleo_herbal/aplicacion/puertos/pasarela_pago.py`
  - `backend/nucleo_herbal/infraestructura/pagos_stripe.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_pago_pedidos.py`
  - `backend/nucleo_herbal/presentacion/publica/dependencias.py`
  - `backend/nucleo_herbal/dominio/pedidos.py`
  - tests backend existentes de pago/pedido/post-pago relacionados.
- **Archivos tocados**:
  - `backend/nucleo_herbal/infraestructura/pagos_simulados.py`
  - `backend/nucleo_herbal/dominio/pedidos.py`
  - `backend/nucleo_herbal/presentacion/publica/dependencias.py`
  - `backend/configuracion_django/settings.py`
  - `tests/nucleo_herbal/test_pago_real.py`
  - `tests/nucleo_herbal/test_api_pago_real.py`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. `ProveedorPago` se amplia a `"stripe" | "simulado_local"` y se valida contra `PROVEEDORES_PAGO_VALIDOS`.
  2. La pasarela simulada vive en infraestructura e implementa `PuertoPasarelaPago`.
  3. El `id_externo_pago` simulado es auditable y determinista por pedido/operacion (`SIM-{id_pedido}-{operation_id}` normalizado).
  4. `BOTICA_PAYMENT_PROVIDER` queda por defecto en `simulado_local`; `stripe` sigue disponible bajo configuracion explicita.
  5. Webhook, confirmacion simulada, reembolsos simulados y post-pago simulado quedan fuera de esta fase.
- **Checklist de cierre aplicada (ELS-003)**:
  1. Tarea correcta confirmada: **Si** (`ELS-003` era la primera `TODO` no `BLOCKED`).
  2. Una sola tarea ejecutada en la corrida: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se toco frontend, Stripe real, endpoints nuevos, stock ni post-pago.
  4. Evidencia verificable registrada: **Si**.
  5. Checks ejecutados y registrados: **Si**.
  6. Roadmap actualizado: **Si**.
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; hay cambios previos ELS-001/ELS-002 no revertidos.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra adaptador implementado y confirmacion pendiente.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `.\\.venv\\Scripts\\python.exe manage.py test tests.nucleo_herbal.test_pago_real tests.nucleo_herbal.test_api_pago_real` -> OK, 21 tests.
  - `.\\.venv\\Scripts\\python.exe manage.py test tests.nucleo_herbal.test_pago_real tests.nucleo_herbal.test_api_pago_real tests.nucleo_herbal.test_api_pedidos_real tests.nucleo_herbal.test_casos_de_uso_pedidos_real tests.nucleo_herbal.test_operacion_pedidos_real tests.nucleo_herbal.infraestructura.test_devoluciones_postventa backend.nucleo_herbal.infraestructura.persistencia_django.tests.test_post_pago_inventario` -> fallo de entorno: `ModuleNotFoundError: No module named 'pytest'` al importar `tests.nucleo_herbal.test_casos_de_uso_pedidos_real`.
  - `.\\.venv\\Scripts\\python.exe manage.py test tests.nucleo_herbal.test_pago_real tests.nucleo_herbal.test_api_pago_real tests.nucleo_herbal.test_api_pedidos_real tests.nucleo_herbal.test_operacion_pedidos_real tests.nucleo_herbal.infraestructura.test_devoluciones_postventa backend.nucleo_herbal.infraestructura.persistencia_django.tests.test_post_pago_inventario` -> OK, 84 tests.
  - `.\\.venv\\Scripts\\python.exe manage.py check` -> OK.
  - `git diff --check` -> OK; solo avisos LF/CRLF de Windows.
  - `git diff --numstat` -> OK; no aparecen binarios en el diff versionado.
- **Resultado verificable**:
  - existe pasarela simulada limpia por puerto/adaptador;
  - el wiring selecciona proveedor por configuracion;
  - Stripe queda disponible pero no activo por defecto local;
  - `PedidoDemo` no participa en la nueva capacidad.
- **Bloqueos (si aplica)**: ninguno; queda una limitacion de entorno para ejecutar el modulo pytest-only sin instalar `pytest`.
- **Siguiente paso exacto**: ejecutar `ELS-004`, consolidar checkout real como flujo unico local, sin borrar legacy ni implementar confirmacion/webhook simulado fuera de fase.

## Entrada 2026-04-28-ELS-004 (confirmacion local de pago simulado)
- **Tarea seleccionada**: `ELS-004 - Confirmacion local de pago simulado`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: permitir confirmar una intencion `simulado_local` en local y procesar el pedido real como pagado reutilizando `ProcesarPostPagoPedido`.
- **Documentos/fuentes leidas**:
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_pago_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_post_pago_pedidos.py`
  - `backend/nucleo_herbal/presentacion/publica/views_pago_pedidos.py`
  - `backend/nucleo_herbal/presentacion/publica/urls_pedidos.py`
  - `backend/nucleo_herbal/dominio/pedidos.py`
  - `backend/nucleo_herbal/infraestructura/pagos_simulados.py`
  - tests de pago y post-pago existentes.
- **Archivos tocados**:
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_pago_pedidos.py`
  - `backend/nucleo_herbal/presentacion/publica/dependencias.py`
  - `backend/nucleo_herbal/presentacion/publica/views_pago_pedidos.py`
  - `backend/nucleo_herbal/presentacion/publica/urls_pedidos.py`
  - `tests/nucleo_herbal/test_pago_real.py`
  - `tests/nucleo_herbal/test_api_pago_real.py`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. La confirmacion simulada tiene caso de uso propio (`ConfirmarPagoSimuladoPedido`) y no vive en la vista.
  2. El caso de uso valida pedido existente, proveedor `simulado_local`, referencia externa e inexistencia de cancelacion.
  3. La transicion a pagado, descuento de stock, incidencia y email se delegan en `ProcesarPostPagoPedido`.
  4. El endpoint devuelve el pedido actualizado con el serializador existente de pedido real.
  5. Stripe conserva su webhook y se rechaza confirmar por ruta simulada un pedido con proveedor `stripe`.
- **Checklist de cierre aplicada (ELS-004)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente ELS-004 como confirmacion simulada y se reencauzo el roadmap operativo.
  2. Una sola tarea ejecutada en la corrida: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se toco frontend, documento fiscal, backoffice, Stripe real ni reembolso simulado.
  4. Evidencia verificable registrada: **Si**.
  5. Checks ejecutados y registrados: **Si**.
  6. Roadmap actualizado: **Si**.
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos ELS-001/ELS-003 sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra confirmacion local implementada y webhook simulado pendiente.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `.\\.venv\\Scripts\\python.exe manage.py test tests.nucleo_herbal.test_pago_real tests.nucleo_herbal.test_api_pago_real` -> OK, 28 tests.
  - `.\\.venv\\Scripts\\python.exe manage.py test backend.nucleo_herbal.infraestructura.persistencia_django.tests.test_post_pago_inventario tests.nucleo_herbal.test_api_pago_real tests.nucleo_herbal.test_pago_real` -> OK, 36 tests.
  - `.\\.venv\\Scripts\\python.exe manage.py check` -> OK.
  - `git diff --check` -> OK; solo avisos LF/CRLF de Windows.
  - `git diff --numstat` -> OK; no aparecen binarios en el diff versionado.
- **Resultado verificable**:
  - pedido real con intencion `simulado_local` se confirma en local;
  - stock y email se procesan por post-pago real;
  - falta de stock deja incidencia operativa sin descuento parcial;
  - pedido Stripe no puede confirmarse por endpoint simulado;
  - webhook Stripe sigue pasando tests.
- **Bloqueos (si aplica)**: ninguno.
- **Siguiente paso exacto**: ejecutar `ELS-005`, consolidar `/checkout` como flujo unico local y conectar la confirmacion simulada desde frontend sin borrar legacy.

## Entrada 2026-04-28-ELS-005 (UI de pago simulado en checkout real)
- **Tarea seleccionada**: `ELS-005 - UI de pago simulado en checkout real`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: permitir completar desde frontend el flujo pedido real -> intencion `simulado_local` -> confirmacion local -> retorno success del pedido real.
- **Documentos/fuentes leidas**:
  - `frontend/app/checkout/page.tsx`
  - `frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx`
  - `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`
  - `frontend/infraestructura/api/pedidos.ts`
  - tests frontend de checkout real
  - endpoint backend `POST /api/v1/pedidos/{id_pedido}/confirmar-pago-simulado/`.
- **Archivos tocados**:
  - `frontend/contenido/pedidos/pagoSimuladoLocal.ts`
  - `frontend/infraestructura/api/pedidos.ts`
  - `frontend/app/api/pedidos/[id_pedido]/confirmar-pago-simulado/route.ts`
  - `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`
  - `frontend/tests/checkout-real.test.ts`
  - `frontend/tests/checkout-real-ui.test.ts`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. La deteccion de pago simulado se encapsula en `resolverEsPagoSimuladoLocal`, comparando proveedor `simulado_local`.
  2. La UI prepara la confirmacion local tras `iniciarPagoPedido` cuando el proveedor devuelto es simulado.
  3. La accion visible usa copy de pasarela local: "Pago simulado local" y "Confirmar pago de prueba".
  4. La confirmacion redirige a `/pedido/[id_pedido]?retorno_pago=success` reutilizando `construirUrlRetornoPedido`.
  5. La ruta externa de pago queda disponible para proveedores no simulados; no se elimina Stripe del codigo.
- **Checklist de cierre aplicada (ELS-005)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio ELS-005 como UI de pago simulado y se actualizo el roadmap operativo.
  2. Una sola tarea ejecutada en la corrida: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se toco backend, cuenta real, backoffice, `/encargo` ni Stripe frontend real.
  4. Evidencia verificable registrada: **Si**.
  5. Checks ejecutados y registrados: **Si**.
  6. Roadmap actualizado: **Si**.
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos ELS-001 a ELS-004 sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra UI de pago simulado implementada.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `npm --prefix frontend run test:checkout-real` -> OK.
  - `npm --prefix frontend run lint` -> OK.
  - `npm --prefix frontend run build` -> OK.
  - `git diff --check` -> OK; solo avisos LF/CRLF de Windows.
  - `git diff --numstat` -> OK; no aparecen binarios en el diff versionado.
- **Resultado verificable**:
  - el recibo real puede iniciar pago, detectar `simulado_local` y mostrar confirmacion local;
  - el cliente API llama a `/api/pedidos/{id}/confirmar-pago-simulado`;
  - la UI no muestra confirmacion simulada para proveedor no simulado;
  - no se usa `/encargo` ni `PedidoDemo` para cerrar la compra.
- **Bloqueos (si aplica)**: ninguno.
- **Siguiente paso exacto**: ejecutar `ELS-006`, consolidar `/checkout` como flujo unico local y eliminar restos de copy/atajos que presenten la compra normal como coexistencia temporal.

## Entrada 2026-04-28-ELS-006 (stock preventivo antes de pago)
- **Tarea seleccionada**: `ELS-006 - Stock preventivo antes de iniciar pago`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: impedir que un pedido real avance a intencion de pago o confirmacion simulada cuando el inventario disponible no cubre sus lineas.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_pago_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_post_pago_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/puertos/repositorios_inventario.py`
  - `backend/nucleo_herbal/aplicacion/errores_pedidos.py`
  - `backend/nucleo_herbal/dominio/pedidos.py`
  - tests de pago real, pago simulado y post-pago/inventario.
- **Archivos tocados en esta ejecucion**:
  - `backend/nucleo_herbal/aplicacion/stock_preventivo_pedidos.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_pago_pedidos.py`
  - `backend/nucleo_herbal/presentacion/publica/dependencias.py`
  - `backend/nucleo_herbal/presentacion/publica/views_pago_pedidos.py`
  - `tests/nucleo_herbal/test_pago_real.py`
  - `tests/nucleo_herbal/test_api_pago_real.py`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Crear `ValidarStockPreventivoPedido` en aplicacion, no en vistas ni dominio, usando `RepositorioInventario`.
  2. Reutilizar `ErrorStockPedido` y `LineaStockError` para mantener contrato serializable `stock_no_disponible` con detalle por linea.
  3. Validar stock en `IniciarPagoPedido` antes de llamar a la pasarela para no crear intenciones si falla inventario.
  4. Revalidar en `ConfirmarPagoSimuladoPedido` antes de `ProcesarPostPagoPedido`; la rama idempotente ya confirmada queda antes para no fallar por stock ya descontado.
  5. Mantener `ProcesarPostPagoPedido` intacto como segunda barrera para concurrencia, webhooks y cambios tardios.
- **Checklist de cierre aplicada (ELS-006)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente `ELS-006` de stock preventivo y se actualizo el roadmap operativo para reflejarlo.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se toco frontend, reservas, multi-almacen, logistica ni Stripe real.
  4. Evidencia verificable registrada: **Si**; tests backend y checks registrados.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos ELS-001 a ELS-005 sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra ELS-006 como implementado sin declarar go-live externo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `pytest -q tests/nucleo_herbal/test_pago_real.py tests/nucleo_herbal/test_api_pago_real.py backend/nucleo_herbal/infraestructura/persistencia_django/tests/test_post_pago_inventario.py` -> no ejecutado: `pytest` no esta en PATH.
  - `.venv\Scripts\python.exe -m pytest -q ...` -> no ejecutado: `pytest` no esta instalado en `.venv`.
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_pago_real tests.nucleo_herbal.test_api_pago_real backend.nucleo_herbal.infraestructura.persistencia_django.tests.test_post_pago_inventario` -> **OK**, 41 tests.
  - `.venv\Scripts\python.exe manage.py check` -> **OK**.
  - `git diff --check` -> **OK**; solo avisos de normalizacion LF/CRLF en Windows.
- **Evidencia de cierre**:
  - iniciar pago con stock insuficiente devuelve conflicto y no persiste referencia externa;
  - iniciar pago con unidad incompatible devuelve conflicto y no crea intencion;
  - confirmar pago simulado revalida stock y no marca pagado si falla;
  - post-pago sigue cubierto con incidencia de stock y descuento idempotente;
  - Stripe conserva tests de intencion y webhook.
- **Siguiente paso exacto**: ejecutar `ELS-007`, checkout real como flujo unico local, sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-007 (stock visible en superficies comerciales)
- **Tarea seleccionada**: `ELS-007 - Disponibilidad de stock visible en ficha, cesta y checkout`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: exponer disponibilidad suficiente en ficha, cesta y checkout para que el usuario detecte bloqueos de stock antes de iniciar pago.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - endpoints publicos actuales de producto/catalogo
  - repositorios/API frontend de catalogo
  - componentes de ficha de producto y cesta
  - `frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx`
  - `frontend/infraestructura/api/pedidos.ts`
  - tests frontend de catalogo, cesta y checkout.
- **Archivos tocados en esta ejecucion**:
  - `backend/nucleo_herbal/aplicacion/dto.py`
  - `backend/nucleo_herbal/aplicacion/disponibilidad_publica.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_rituales.py`
  - `backend/nucleo_herbal/presentacion/publica/serializadores.py`
  - `backend/nucleo_herbal/presentacion/tests/test_publico_producto_detalle.py`
  - `frontend/infraestructura/api/herbal.ts`
  - `frontend/contenido/catalogo/disponibilidadStock.ts`
  - `frontend/contenido/catalogo/checkoutReal.ts`
  - `frontend/componentes/catalogo/disponibilidad/EstadoDisponibilidadProducto.tsx`
  - `frontend/componentes/catalogo/detalle/FichaProductoCatalogo.tsx`
  - `frontend/componentes/catalogo/cesta/BotonAgregarCarrito.tsx`
  - `frontend/componentes/catalogo/cesta/VistaCestaRitual.tsx`
  - `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`
  - `frontend/package.json`
  - `frontend/tests/checkout-real.test.ts`
  - `frontend/tests/cesta-ritual.test.ts`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener el contrato publico existente `disponible`/`estado_disponibilidad` y ampliarlo de forma aditiva con `disponible_compra`, `cantidad_disponible` y `mensaje_disponibilidad`.
  2. Centralizar reglas de UI de disponibilidad en `frontend/contenido/catalogo/disponibilidadStock.ts`, fuera de componentes.
  3. Bloquear compra directa en ficha y avance a `/checkout` en cesta cuando la linea no sea comprable.
  4. Mostrar errores preventivos de stock del backend en el recibo/checkout con copy comercial, sin exponer codigos tecnicos.
  5. Conservar `/encargo` solo como consulta secundaria cuando el producto no es comprable.
- **Checklist de cierre aplicada (ELS-007)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente stock visible para ficha, cesta y checkout.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se implementaron reservas temporales, cambios de precio, backoffice ni pago simulado nuevo.
  4. Evidencia verificable registrada: **Si**; contrato, UI y tests quedan documentados.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos ELS-001 a ELS-006 sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra ELS-007 como implementado sin declarar go-live externo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `.venv\Scripts\python.exe manage.py test backend.nucleo_herbal.presentacion.tests.test_publico_producto_detalle tests.nucleo_herbal.test_api_pago_real backend.nucleo_herbal.infraestructura.persistencia_django.tests.test_post_pago_inventario` -> **OK**, 33 tests.
  - `.venv\Scripts\python.exe manage.py check` -> **OK**.
  - `npm --prefix frontend test -- checkout-real.test.ts cesta-ritual.test.ts botica-natural.test.ts checkout-real-ui.test.ts rituales-disponibilidad-contrato.test.ts` -> no ejecutado: el paquete no define script generico `test`.
  - `npm --prefix frontend run test:cesta` -> **OK**, 16 tests.
  - `npm --prefix frontend run test:checkout-real` -> **OK**, 55 tests.
  - `npm --prefix frontend run test:botica-natural` -> **OK**, 17 tests.
  - `npm --prefix frontend run test:rituales-disponibilidad` -> **OK**, 2 tests.
  - `npm --prefix frontend run lint` -> **OK**.
  - `npm --prefix frontend run build` -> primer intento fallo por contrato frontend demasiado estricto en productos relacionados; corregido y segundo intento **OK**.
  - `npm --prefix frontend run test:catalogo` -> **OK**, 12 tests.
  - `npm --prefix frontend run test:catalogo-detalle` -> **OK**, 10 tests.
  - `npm --prefix frontend run test:structured-data-seo` -> **OK**, 8 tests.
- **Evidencia de cierre**:
  - el producto publico expone disponibilidad consumible por frontend;
  - ficha de producto muestra disponibilidad y bloquea compra directa sin stock;
  - cesta marca lineas no comprables y bloquea el avance a checkout;
  - checkout/recibo muestra errores preventivos de stock devueltos por backend;
  - el copy publico evita codigos tecnicos y no reactiva `/encargo` como compra.
- **Siguiente paso exacto**: ejecutar `ELS-008`, consolidar checkout real como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-008 (cesta real limpia)
- **Tarea seleccionada**: `ELS-008 - Cesta real limpia: solo lineas comprables`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: convertir la cesta en una superficie ecommerce real que no arrastra lineas artesanales, no catalogadas o fuera de contrato hacia `/checkout`.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `frontend/contenido/catalogo/cestaRitual.ts`
  - `frontend/contenido/catalogo/checkoutReal.ts`
  - componentes de cesta/carrito
  - componentes de ficha que anaden productos
  - tests frontend de cesta y checkout.
- **Archivos tocados en esta ejecucion**:
  - `frontend/contenido/catalogo/cestaReal.ts`
  - `frontend/componentes/catalogo/cesta/VistaCestaRitual.tsx`
  - `frontend/package.json`
  - `frontend/tests/cesta-ritual.test.ts`
  - `frontend/tests/checkout-real-ui.test.ts`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Crear `cestaReal.ts` como helper puro para clasificar lineas en `comprable`, `requiere_consulta`, `invalida` o `sin_stock`.
  2. Mantener `cestaRitual.ts` como compatibilidad/persistencia existente y no borrar logica legacy.
  3. Serializar hacia `/checkout` solo `convertirCestaAItemsCheckoutReal(cesta)`.
  4. Bloquear el CTA principal si hay cualquier linea de consulta, invalida o sin stock, aunque existan lineas comprables.
  5. Mostrar `/encargo?origen=seleccion` solo como salida secundaria para lineas de consulta personalizada.
- **Checklist de cierre aplicada (ELS-008)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente cesta real limpia como prompt 08.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se toco backend, pago, backoffice, promociones ni descuentos.
  4. Evidencia verificable registrada: **Si**; tests frontend y build registrados.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos ELS-001 a ELS-007 sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra ELS-008 como implementado sin go-live externo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `npm --prefix frontend run test:cesta` -> **OK**, 20 tests.
  - `npm --prefix frontend run test:checkout-real` -> **OK**, 56 tests.
  - `npm --prefix frontend run test:catalogo` -> **OK**, 12 tests.
  - `npm --prefix frontend run test:catalogo-detalle` -> **OK**, 10 tests.
  - `npm --prefix frontend run lint` -> **OK**.
  - `npm --prefix frontend run build` -> **OK**.
- **Evidencia de cierre**:
  - cesta con solo lineas comprables permite checkout;
  - cesta con linea fuera de contrato bloquea el CTA real;
  - las lineas de consulta ofrecen salida secundaria a `/encargo`;
  - eliminar la linea bloqueante desbloquea el checkout;
  - no se genera payload real con lineas fuera de contrato.
- **Siguiente paso exacto**: ejecutar `ELS-009`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-009 (cuenta real principal)
- **Tarea seleccionada**: `ELS-009 - Cuenta real como unica cuenta visible`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: consolidar `/mi-cuenta` como cuenta visible del ecommerce real y retirar protagonismo a `cuenta-demo` sin borrar legacy.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - frontend de `/mi-cuenta`
  - frontend de `cuenta-demo`
  - API frontend de cuentas reales y demo
  - checkout real
  - tests frontend de cuenta, checkout y navegacion.
- **Archivos tocados en esta ejecucion**:
  - `frontend/componentes/cuenta_cliente/PanelCuentaCliente.tsx`
  - `frontend/contenido/cuenta_cliente/rutasCuentaCliente.ts`
  - `frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx`
  - `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`
  - `frontend/app/checkout/page.tsx`
  - `frontend/tests/cuenta-cliente.test.ts`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener `RUTAS_CUENTA_CLIENTE.legadoDemo` como ruta legacy, pero retirar su CTA visible desde `/mi-cuenta`.
  2. Mostrar en `/mi-cuenta` datos de cuenta, pedidos reales, direcciones guardadas, enlaces a pedido real y documento fiscal.
  3. Limpiar copy publico de checkout/recibo para que hable de compra y pedido reales, no de coexistencia demo.
  4. No tocar backend: el checkout ya prioriza sesion/direcciones de cuenta real y permite invitado.
  5. Ejecutar test legacy de `cuenta-demo` para validar que la deprecacion UX no borra compatibilidad.
- **Checklist de cierre aplicada (ELS-009)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente cuenta real principal como prompt 09.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se borraron rutas, modelos ni endpoints demo, y no se tocaron pagos.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos ELS-001 a ELS-008 sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra cuenta real principal sin declarar retirada destructiva de legacy.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `npm --prefix frontend run test:cuenta-cliente` -> **OK**, 7 tests.
  - `npm --prefix frontend run test:checkout-real` -> **OK**, 56 tests.
  - `npm --prefix frontend run test:shell` -> **OK**, 10 tests.
  - `npm --prefix frontend run test:cuenta-demo` -> **OK**, 19 tests.
  - `npm --prefix frontend run lint` -> **OK**.
  - `npm --prefix frontend run build` -> **OK**.
- **Evidencia de cierre**:
  - navegacion principal no expone `/cuenta-demo` y mantiene `/mi-cuenta`;
  - `/mi-cuenta` ya no muestra CTA "Legado demo";
  - cuenta real muestra pedidos reales, direcciones guardadas y documento fiscal;
  - checkout real no depende de `CuentaDemo` y usa cuenta real/invitado;
  - `cuenta-demo` sigue pasando tests legacy.
- **Siguiente paso exacto**: ejecutar `ELS-010`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-010 (recibo real local)
- **Tarea seleccionada**: `ELS-010 - Pedido real, recibo y documento fiscal sin olor a demo`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: pulir `/pedido/[id_pedido]`, recibo y documento fiscal para que operen como ecommerce real local con pago simulado, sin lenguaje de demo antigua.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `frontend/app/pedido/[id_pedido]/page.tsx`
  - `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`
  - `frontend/infraestructura/api/pedidos.ts`
  - `backend/nucleo_herbal/presentacion/publica/documento_pedido_html.py`
  - `backend/nucleo_herbal/presentacion/publica/views_pedidos.py`
  - tests frontend/backend de pedido real y documento fiscal.
- **Archivos tocados en esta ejecucion**:
  - `frontend/contenido/pedidos/reciboPedidoReal.ts`
  - `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`
  - `frontend/app/pedido/[id_pedido]/page.tsx`
  - `frontend/tests/checkout-real-ui.test.ts`
  - `frontend/tests/pedido-real-operacion-ui.test.ts`
  - `frontend/package.json`
  - `backend/nucleo_herbal/presentacion/publica/documento_pedido_html.py`
  - `tests/nucleo_herbal/test_api_pedidos_real.py`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Extraer copy/estado de recibo a `reciboPedidoReal.ts` para reducir reglas en JSX.
  2. Cambiar el recibo a copy de detalle de pedido: fecha, estado, pago, contacto, entrega, lineas, totales, documento fiscal y seguimiento.
  3. Comunicar `simulado_local` como "Pago confirmado en entorno local simulado" sin presentar toda la tienda como demo.
  4. Mantener documento fiscal HTML como documento trazable con desglose, sin prometer numeracion fiscal legal avanzada.
  5. No tocar calculo fiscal, pasarela, stock, backoffice ni `/pedido-demo`.
- **Checklist de cierre aplicada (ELS-010)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente recibo real local como prompt 10.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se cambiaron fiscalidad profunda, pago, stock, backoffice, PDF ni legacy.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos ELS-001 a ELS-009 sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra recibo real local sin declarar go-live externo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_api_pedidos_real` -> **OK**, 23 tests.
  - `npm --prefix frontend run test:checkout-real` -> **OK**, 57 tests.
  - `npm --prefix frontend run test:cuenta-cliente` -> **OK**, 7 tests.
  - `npm exec -- tsc --module commonjs --target es2020 --outDir .tmp-tests tests/pedido-real-operacion-ui.test.ts && node .tmp-tests/pedido-real-operacion-ui.test.js` -> **OK**, 4 tests.
  - `.venv\Scripts\python.exe manage.py check` -> **OK**.
  - `npm --prefix frontend run lint` -> **OK**.
  - `npm --prefix frontend run build` -> **OK**.
- **Evidencia de cierre**:
  - `/pedido/[id_pedido]` ya no usa copy de "real v1", "pedido demo", "coexistencia" o "legacy";
  - recibo real muestra documento fiscal, cuenta, seguimiento y seguir comprando;
  - pago simulado aparece como entorno local simulado;
  - documento fiscal HTML incluye proveedor, nota local simulada cuando aplica y desglose fiscal.
- **Siguiente paso exacto**: ejecutar `ELS-011`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-011 (backoffice operativo ecommerce local)
- **Tarea seleccionada**: `ELS-011 - Backoffice operativo minimo para ecommerce local`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: preparar Django Admin para operar pedidos reales locales creados desde `/checkout` con pago simulado.
- **Nota de orden**: se ejecuta backoffice por prompt explicito del usuario, adelantandolo frente al bloque documental previo de checkout unico; la reordenacion queda registrada en roadmap y bitacora.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `backend/nucleo_herbal/dominio/pedidos.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_backoffice_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/admin_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/models_pedidos.py`
  - tests existentes de operacion de pedidos y admin.
- **Archivos tocados en esta ejecucion**:
  - `backend/nucleo_herbal/infraestructura/persistencia_django/admin_pedidos.py`
  - `tests/nucleo_herbal/infraestructura/test_admin_django.py`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Reutilizar `MarcarPedidoPreparando`, `MarcarPedidoEnviado` y `MarcarPedidoEntregado` desde aplicacion para acciones de Django Admin.
  2. Usar los campos editables del pedido (`transportista`, `codigo_seguimiento`, `envio_sin_seguimiento`, `observaciones_operativas`) como control manual previo al envio.
  3. Mantener `PedidoDemo` sin cambios y sin mezclarlo con acciones de `PedidoRealModelo`.
  4. No crear panel nuevo: Django Admin cubre el backoffice minimo pedido.
  5. No tocar modelos ni migraciones.
- **Checklist de cierre aplicada (ELS-011)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente backoffice operativo minimo como prompt 11.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se cambio checkout, pasarela, modelos, CRM ni flujos demo.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos ELS-001 a ELS-010 sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra backoffice operativo minimo sin go-live externo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.infraestructura.test_admin_django` -> **OK**, 20 tests.
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_api_backoffice` -> **OK**, 6 tests.
- **Evidencia de cierre**:
  - admin de pedidos reales lista email, cliente, total, estado, pago, proveedor y pago simulado;
  - filtros operativos permiten localizar estados, revision manual, incidencia de stock y pago simulado;
  - acciones admin preparan, envian y entregan pedidos reales mediante casos de uso;
  - envio sin tracking se rechaza salvo marca explicita de envio sin seguimiento;
  - logs de aplicacion incluyen actor, pedido, estado anterior/nuevo, `operation_id` y resultado.
- **Siguiente paso exacto**: ejecutar `ELS-012`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-012 (postventa local simulada/manual)
- **Tarea seleccionada**: `ELS-012 - Reembolso y devolucion simulada/manual coherente`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: adaptar devoluciones, reembolso y restitucion a pago `simulado_local` con operacion manual, segura y trazable.
- **Nota de orden**: se ejecuta postventa local por prompt explicito del usuario; el checkout unico queda desplazado a `ELS-013`.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `backend/nucleo_herbal/dominio/pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/models_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/admin_pedidos.py`
  - casos de uso existentes de reembolso/restitucion
  - tests de devoluciones/postventa existentes.
- **Archivos tocados en esta ejecucion**:
  - `backend/nucleo_herbal/dominio/pedidos.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_postventa_local.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/models_pedidos.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/admin_pedidos.py`
  - `tests/nucleo_herbal/test_operacion_pedidos_real.py`
  - `tests/nucleo_herbal/infraestructura/test_devoluciones_postventa.py`
  - `tests/nucleo_herbal/infraestructura/test_admin_django.py`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Crear `casos_de_uso_postventa_local.py` para no mezclar reembolso simulado con el caso historico Stripe/incidencia.
  2. Ejecutar reembolso simulado solo para `proveedor_pago=simulado_local`, con id externo `SIM-REF-{id_pedido}-{operation_id}`.
  3. No enviar emails nuevos desde el caso de reembolso simulado/manual.
  4. Usar restitucion postventa separada para devoluciones aceptadas, manteniendo la restitucion antigua de cancelacion por incidencia sin relajarla.
  5. Considerar que la restitucion no aplica si el pedido no desconto inventario.
- **Checklist de cierre aplicada (ELS-012)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente postventa local simulada/manual como prompt 12.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se creo portal, no se cambiaron modelos, no se activo Stripe ni se toco fiscalidad profunda.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md`, `docs/roadmap_ecommerce_local_simulado.md`, nota V2).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos ELS-001 a ELS-011 sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra postventa local sin declarar go-live externo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_operacion_pedidos_real` -> **OK**, 25 tests.
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.infraestructura.test_devoluciones_postventa` -> **OK**, 15 tests.
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.infraestructura.test_admin_django` -> **OK**, 20 tests tras ajuste de expectativa.
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.infraestructura.test_repositorio_pedidos_real` -> **OK**, 5 tests.
  - `.venv\Scripts\python.exe manage.py test backend.nucleo_herbal.infraestructura.persistencia_django.tests.test_post_pago_inventario` -> **OK**, 8 tests.
- **Evidencia de cierre**:
  - devolucion aceptada `simulado_local` ejecuta reembolso sin llamada a Stripe;
  - reembolso simulado/manual es idempotente y deja `fecha_reembolso`;
  - restitucion postventa incrementa inventario y registra un unico movimiento;
  - proveedores no simulados se omiten en admin local;
  - devolucion aceptada queda resuelta cuando reembolso y restitucion aplicable estan cerrados.
- **Siguiente paso exacto**: ejecutar `ELS-013`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-013 (SEO y noindex operativo)
- **Tarea seleccionada**: `ELS-013 - SEO y noindex operativo`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: asegurar que rutas transaccionales, privadas y legacy demo quedan no indexables sin degradar SEO de catalogo/fichas/editorial.
- **Nota de orden**: se ejecuta SEO/noindex por prompt explicito del usuario; checkout unico queda desplazado a `ELS-014`.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - helper SEO frontend `frontend/infraestructura/seo/metadataSeo.ts`
  - contrato SEO `docs/seo_contrato.json`
  - rutas `/checkout`, `/pedido/[id_pedido]`, `/encargo`, `/pedido-demo`, `/mi-cuenta`, auth y backoffice
  - tests SEO, checkout, cuenta, shell y legacy demo existentes.
- **Archivos tocados en esta ejecucion**:
  - `docs/seo_contrato.json`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
  - `frontend/app/checkout/page.tsx`
  - `frontend/app/pedido/[id_pedido]/page.tsx`
  - `frontend/app/mi-cuenta/page.tsx`
  - `frontend/app/mi-cuenta/pedidos/page.tsx`
  - `frontend/app/mi-cuenta/direcciones/page.tsx`
  - `frontend/app/acceso/page.tsx`
  - `frontend/app/registro/page.tsx`
  - `frontend/app/recuperar-password/page.tsx`
  - `frontend/app/verificar-email/page.tsx`
  - `frontend/app/login/page.tsx`
  - `frontend/app/admin/login/page.tsx`
  - `frontend/app/admin/(panel)/layout.tsx`
  - `frontend/tests/seo-contrato-regresion.test.ts`
- **Decisiones tomadas**:
  1. Mantener la politica SEO existente: `noindex` con `follow=true` mediante `construirMetadataSeo`.
  2. No crear sitemap/robots en Next porque el repo ya los publica desde Django y los valida contra `docs/seo_contrato.json`.
  3. Declarar cuenta, auth y backoffice como transaccionales/noindex en el contrato para que el sitemap los excluya.
  4. Conservar catalogo, fichas y editorial como indexables/canonical segun contrato existente.
  5. No tocar contenido comercial ni rutas legacy; solo metadata/contrato.
- **Checklist de cierre aplicada (ELS-013)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente SEO/noindex operativo como prompt 13.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se cambio funcionalidad de checkout, backend funcional, URLs ni contenido de producto.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos ELS-001 a ELS-012 sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra noindex operativo sin declarar go-live externo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `npm --prefix frontend run test:seo:contrato` -> **OK**.
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_seo_contrato_backend tests.nucleo_herbal.test_healthcheck` -> **OK**, 14 tests.
  - `npm --prefix frontend run lint` -> **OK**.
  - `npm --prefix frontend run test:checkout-real` -> **OK**, 57 tests.
  - `npm --prefix frontend run test:cuenta-cliente` -> **OK**, 7 tests.
  - `npm --prefix frontend run test:shell` -> **OK**, 10 tests.
  - `npm --prefix frontend run test:checkout-demo` -> **OK**, 35 tests.
  - `npm --prefix frontend run build` -> **OK**.
  - `git diff --check` -> **OK** con avisos CRLF existentes.
- **Evidencia de cierre**:
  - checkout, pedido real, cuenta, auth y backoffice declaran metadata `noindex`;
  - legacy demo y `/encargo` permanecen no indexables y fuera del sitemap contractual;
  - contrato SEO backend excluye transaccionales/noindex del sitemap;
  - pruebas SEO confirman que catalogo/fichas/editorial conservan metadata indexable y canonical.
- **Siguiente paso exacto**: ejecutar `ELS-014`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-014 (limpieza de copy comercial)
- **Tarea seleccionada**: `ELS-014 - Limpieza de copy comercial`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: retirar de superficies publicas el lenguaje de demo tecnica, V1, legacy, coexistencia, contrato/API/payload y ajustar el tono a tienda artesanal/editorial.
- **Nota de orden**: se ejecuta copy comercial por prompt explicito del usuario; checkout unico queda desplazado a `ELS-015`.
- **Lectura de contexto realizada**:
  - `docs/00_vision_proyecto.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - componentes de home, ficha, cesta, checkout real, pedido real, cuenta real y rutas legacy visibles
  - tests frontend de checkout, cesta, encargo, cuenta, legal, landings/fichas SEO y Botica Natural.
- **Archivos tocados en esta ejecucion**:
  - copy frontend publico en home, fichas, cesta, checkout, recibo, pedido, cuenta, consulta artesanal y rutas legacy conservadas
  - tests frontend textuales relacionados
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener nombres internos `PedidoDemo`, `CuentaDemo`, `Payload*` y rutas legacy cuando son contratos de codigo, pero retirarlos del copy visible.
  2. Sustituir referencias a "pago simulado local" por "pago de prueba en entorno local" solo en recibo/pago donde la transparencia es necesaria.
  3. Cambiar mensajes de disponibilidad para no mencionar backend/API ni prometer reserva de stock.
  4. Mantener `/encargo`, `/pedido-demo` y `cuenta-demo` accesibles con copy secundario/controlado.
  5. No tocar logica de pagos, URLs, backend funcional ni claims de producto.
- **Checklist de cierre aplicada (ELS-014)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente limpieza de copy comercial como prompt 14.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se cambiaron pagos, URLs, backend funcional ni rutas legacy.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos ELS-001 a ELS-013 sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra limpieza de copy sin declarar go-live externo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - Busqueda final de terminos prohibidos en frontend publico principal -> **OK**, sin coincidencias para frases visibles prohibidas.
  - `npm --prefix frontend run lint` -> **OK**.
  - `npm --prefix frontend run test:checkout-real` -> **OK**, 57 tests.
  - `npm --prefix frontend run test:checkout-demo` -> **OK**, 35 tests.
  - `npm --prefix frontend run test:encargo` -> **OK**, 24 tests.
  - `npm --prefix frontend run test:cesta` -> **OK**, 20 tests.
  - `npm --prefix frontend run test:cuenta-cliente` -> **OK**, 7 tests.
  - `npm --prefix frontend run test:cuenta-demo` -> **OK**, 19 tests.
  - `npm --prefix frontend run test:legal` -> **OK**, 6 tests.
  - `npm --prefix frontend run test:landings-seo` -> **OK**, 2 tests.
  - `npm --prefix frontend run test:fichas-seo` -> **OK**, 3 tests.
  - `npm --prefix frontend run test:botica-natural` -> **OK**, 17 tests.
  - `npm --prefix frontend run build` -> **OK**.
  - `git diff --check` -> **OK** con avisos CRLF existentes.
- **Evidencia de cierre**:
  - superficies publicas principales no muestran "pedido demo", "cuenta demo", "real v1", "legacy", "coexistencia", "backend/API" o "contrato final" como copy visible;
  - el recibo real conserva transparencia de entorno local sin presentar la tienda como demo;
  - legacy conserva rutas y contratos internos, con copy rebajado y no promocional;
  - tests textuales y build validan el nuevo tono comercial.
- **Siguiente paso exacto**: ejecutar `ELS-015`, crear gate local ecommerce simulado sin desbloquear go-live externo ni activar pagos reales.

## Entrada 2026-04-28-ELS-015 (gate local ecommerce simulado)
- **Tarea seleccionada**: `ELS-015 - Gate local ecommerce simulado`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: crear un quality gate local, estatico y de solo lectura para validar ecommerce real local con pago simulado sin declarar go-live externo.
- **Nota de orden**: se ejecuta gate local por prompt explicito del usuario; checkout unico queda desplazado a `ELS-016`.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `scripts/check_release_gate.py`
  - `scripts/check_release_readiness.py`
  - `scripts/check_operational_reconciliation.py`
  - `scripts/check_repo_operational_integrity.py`
  - tests existentes de scripts operativos
  - `docs/13_testing_ci_y_quality_gate.md`.
- **Archivos tocados en esta ejecucion**:
  - `scripts/check_ecommerce_local_simulado.py`
  - `tests/scripts/test_check_ecommerce_local_simulado.py`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Implementar un gate estatico y de solo lectura para no requerir servidores, Playwright, URLs externas ni base remota.
  2. Usar severidades `OK`, `WARNING` y `BLOCKER`, con `WARNING` no bloqueante por defecto.
  3. Emitir JSON con `--json` y permitir endurecimiento local con `--fail-on warning`.
  4. Tratar legacy existente y documentado como `WARNING`, no como fallo, porque sigue siendo compatibilidad controlada.
  5. Reafirmar en el gate que `V2-R10` sigue bloqueado y no se activan pagos reales.
- **Checklist de cierre aplicada (ELS-015)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente gate local ecommerce simulado como prompt 15.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se lanzo servidor, no se hizo E2E, no se toco Stripe ni release gate principal.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos ELS-001 a ELS-014 sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra gate local sin declarar go-live externo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `.venv\Scripts\python.exe manage.py test tests.scripts.test_check_ecommerce_local_simulado` -> **OK**, 4 tests.
  - `.venv\Scripts\python.exe manage.py test tests.scripts` -> **OK**, 48 tests.
  - `python scripts/check_ecommerce_local_simulado.py` -> **OK**, 0 BLOCKER, 1 WARNING, 16 OK.
  - `python scripts/check_ecommerce_local_simulado.py --json` -> **OK**, JSON valido con 0 BLOCKER, 1 WARNING, 16 OK.
  - `.venv\Scripts\python.exe manage.py check` -> **OK**.
  - `git diff --check` -> **OK** con avisos CRLF existentes.
- **Evidencia de cierre**:
  - gate local valida contratos minimos de roadmap, rutas, pago simulado, confirmacion, checkout/recibo, cuenta, backoffice, noindex, CTAs a `/pedido-demo` y bloqueo `V2-R10`;
  - tests cubren fixture OK, blocker por roadmap ausente, warning legacy documentado, JSON y exit code.
- **Siguiente paso exacto**: ejecutar `ELS-016`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-016 (seed local comprable)
- **Tarea seleccionada**: `ELS-016 - Seed local comprable`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: asegurar datos locales minimos para ejecutar producto publicado -> stock disponible -> cesta -> checkout -> pago simulado -> pedido real -> documento/recibo.
- **Nota de orden**: se ejecuta seed local comprable por prompt explicito del usuario; checkout unico queda desplazado a `ELS-017`.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `scripts/bootstrap_demo_release.py`
  - `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`
  - modelos ORM de producto, secciones, cuenta cliente e inventario
  - tests existentes de bootstrap/seed.
- **Archivos tocados en esta ejecucion**:
  - `scripts/bootstrap_ecommerce_local_simulado.py`
  - `tests/scripts/test_bootstrap_ecommerce_local_simulado.py`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Crear un script local explicito en `scripts/` en vez de ampliar `seed_demo_publico`, para no mezclar `PedidoDemo`/demo legacy con ecommerce real local.
  2. Sembrar productos con prefijo `LOCAL-ECOM-` y actualizar por SKU para evitar duplicados.
  3. Garantizar un producto comprable por seccion publica comercial relevante: `botica-natural`, `velas-e-incienso`, `minerales-y-energia`, `herramientas-esotericas`.
  4. Crear inventario con unidad base igual a unidad comercial para pasar stock preventivo.
  5. Incluir cuenta cliente local con direccion predeterminada como apoyo opcional, sin crear pedidos ni pagos.
  6. Implementar `--dry-run` con rollback transaccional y `--json` para tooling local.
- **Checklist de cierre aplicada (ELS-016)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente datos locales minimos comprables como prompt 16.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se tocaron checkout, pasarela, Stripe, migraciones, imagenes ni datos de produccion.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Pendiente de cierre final**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra seed local sin declarar go-live externo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `.venv\Scripts\python.exe manage.py test tests.scripts.test_bootstrap_ecommerce_local_simulado` -> **OK**, 4 tests.
  - `python -m py_compile scripts/bootstrap_ecommerce_local_simulado.py` -> **OK**; artefactos `.pyc` generados para el nuevo script/test eliminados despues.
- **Evidencia de cierre**:
  - bootstrap local crea secciones, intencion/planta local, cuatro productos publicados comprables, inventario compatible y cuenta cliente opcional;
  - tests cubren producto comprable, inventario compatible, tipos fiscales/unidades validas, idempotencia, no duplicacion y dry-run.
- **Siguiente paso exacto**: ejecutar `ELS-017`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

### Actualizacion de cierre ELS-016
- `scripts/bootstrap_ecommerce_local_simulado.py` ajustado a 298 LOC tras verificacion de tamano razonable.
- `.venv\Scripts\python.exe manage.py test tests.scripts.test_bootstrap_ecommerce_local_simulado` -> **OK**, 4 tests tras el ajuste final.
- `.venv\Scripts\python.exe manage.py test backend.nucleo_herbal.presentacion.tests.test_publico_producto_detalle backend.nucleo_herbal.presentacion.tests.test_backoffice_inventario` -> **OK**, 14 tests.
- `.venv\Scripts\python.exe manage.py check` -> **OK**.
- `python scripts/bootstrap_ecommerce_local_simulado.py --dry-run` -> **OK**, rollback transaccional sin persistir.
- `python scripts/bootstrap_ecommerce_local_simulado.py --dry-run --json` -> **OK**.
- `git diff --check` -> **OK** con avisos CRLF existentes.
- Nota: una primera ejecucion paralela de `--dry-run` y `--dry-run --json` contra SQLite produjo `database is locked`; se repitio en secuencia y paso correctamente. No es bloqueo del script, sino limitacion esperable de SQLite local ante escrituras simultaneas.

## Entrada 2026-04-28-ELS-017 (regresion compra local simulada)
- **Tarea seleccionada**: `ELS-017 - Regresion compra local simulada`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: proteger por tests el recorrido catalogo -> ficha -> cesta -> checkout -> pago simulado -> pedido real -> recibo/documento -> cuenta.
- **Nota de orden**: se ejecuta regresion de compra local por prompt explicito del usuario; checkout unico queda como siguiente tarea `ELS-018`.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - tests backend de pedido real, pago, stock, cuenta y documento
  - tests frontend de cesta, checkout real, cuenta y navegacion
  - `scripts/check_ecommerce_local_simulado.py`
  - `docs/13_testing_ci_y_quality_gate.md`
- **Archivos tocados en esta ejecucion**:
  - `tests/nucleo_herbal/test_regresion_compra_local_simulada.py`
  - `frontend/tests/compra-local-simulada.test.ts`
  - `frontend/package.json`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Crear regresion por capas en vez de introducir Playwright/E2E pesado, porque no hay infraestructura E2E dedicada en este alcance.
  2. Cubrir backend con API real Django para catalogo/ficha, creacion de pedido, pago simulado, stock, documento y cuenta real.
  3. Cubrir frontend con contratos puros de cesta, payload checkout, cliente API de pedidos, pago simulado y CTAs principales.
  4. Afirmar explicitamente que el flujo principal no usa `PedidoDemo`, `/pedido-demo`, `cuenta-demo` ni `/encargo` como compra.
  5. Documentar la matriz de cobertura y el hueco aceptado de E2E browser.
- **Checklist de cierre aplicada (ELS-017)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente regresion completa del recorrido de compra local como prompt 17.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se introdujo E2E pesado, no se toco Stripe real, no se borro legacy ni se cambio diseno.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos ELS-001 a ELS-016 sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra regresion QA sin declarar go-live externo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_regresion_compra_local_simulada` -> **OK**, 3 tests.
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_api_pago_real tests.nucleo_herbal.test_api_pedidos_real tests.nucleo_herbal.test_api_cuentas_cliente` -> **OK**, 51 tests.
  - `npm --prefix frontend run test:compra-local` -> **OK**, 3 tests.
  - `npm --prefix frontend run test:checkout-real` -> **OK**, 57 tests.
  - `npm --prefix frontend run test:cesta` -> **OK**, 20 tests.
  - `npm --prefix frontend run test:cuenta-cliente` -> **OK**, 7 tests.
  - `.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py` -> **OK**, 0 BLOCKER, 1 WARNING esperado por legacy visible documentado, 16 OK.
  - `.venv\Scripts\python.exe manage.py check` -> **OK**.
  - `npm --prefix frontend run lint` -> **OK**.
  - `npm --prefix frontend run build` -> **OK**.
  - `git diff --check` -> **OK** con avisos CRLF existentes.
- **Evidencia de cierre**:
  - compra invitado llega a pedido real pagado con `simulado_local`, descuento de inventario, documento fiscal y sin `PedidoDemo`;
  - compra de usuario real con direccion guardada aparece en cuenta real;
  - stock insuficiente bloquea iniciar pago sin crear intencion;
  - frontend valida conversion de cesta comprable a payload real y API de confirmacion simulada sin rutas legacy;
  - matriz de recorrido queda documentada en `docs/13_testing_ci_y_quality_gate.md`.
- **Siguiente paso exacto**: ejecutar `ELS-018`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-018 (rendimiento frontend ecommerce)
- **Tarea seleccionada**: `ELS-018 - Rendimiento frontend ecommerce`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: optimizar rendimiento percibido de home -> catalogo/secciones -> ficha -> cesta -> checkout -> pedido sin cambiar negocio.
- **Nota de orden**: se ejecuta rendimiento frontend por prompt explicito del usuario; checkout unico queda desplazado a `ELS-019`.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - rutas frontend de home, Botica Natural, ficha, cesta, checkout y pedido
  - componentes de imagen/card, metadata SEO y configuracion Next
  - tests frontend de catalogo, tarjetas, cesta, checkout y compra local.
- **Archivos tocados en esta ejecucion**:
  - `frontend/componentes/botica-natural/AccionesTarjetaProductoBoticaNatural.tsx`
  - `frontend/componentes/botica-natural/TarjetaProductoBoticaNatural.tsx`
  - `frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx`
  - `frontend/tests/botica-natural.test.ts`
  - `frontend/tests/cards-media-clickable.test.ts`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Dividir la tarjeta de producto para que imagen/texto/enlaces se rendericen sin hidratar toda la card.
  2. Mantener cantidad/carrito en `AccionesTarjetaProductoBoticaNatural`, que es el unico subcomponente cliente nuevo.
  3. Memoizar `resolverContextoPreseleccionado` en checkout para evitar reparsing de cesta/slug en cada render.
  4. No tocar imagenes binarias, configuracion de CDN, backend, pagos ni reglas de negocio.
  5. No introducir medicion Web Vitals/E2E browser porque no existe runner estable en esta fase.
- **Checklist de cierre aplicada (ELS-018)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente optimizacion de rendimiento frontend como prompt 18.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se cambio negocio, backend, pasarela, diseno global ni imagenes binarias.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra optimizacion frontend sin declarar go-live externo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `npm --prefix frontend run test:botica-natural` -> **OK**, 18 tests.
  - `npm --prefix frontend run test:checkout-real` -> **OK**, 57 tests.
  - `npm --prefix frontend run test:compra-local` -> **OK**, 3 tests.
  - `npm --prefix frontend run test:cesta` -> **OK**, 20 tests.
  - `npx tsc --module commonjs --target es2020 --outDir .tmp-tests tests/cards-media-clickable.test.ts && node .tmp-tests/cards-media-clickable.test.js` -> **OK**, 6 tests.
  - `.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py` -> **OK**, 0 BLOCKER, 1 WARNING esperado por legacy visible documentado, 16 OK.
  - `npm --prefix frontend run lint` -> **OK**.
  - `npm --prefix frontend run build` -> **OK**; `/botica-natural` baja de 4.36 kB a 3.26 kB y `/checkout` de 9.49 kB a 9.44 kB en el reporte Next local.
  - `git diff --check` -> **OK** con avisos CRLF existentes.
- **Evidencia de cierre**:
  - la card publica de Botica Natural ya no contiene `"use client"`;
  - la interaccion de carrito queda acotada al subcomponente cliente;
  - checkout conserva flujo real, errores de stock y pago simulado;
  - build frontend pasa y no quedan `.tmp-tests` ni `.next` versionables.
- **Siguiente paso exacto**: ejecutar `ELS-019`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-019 (accesibilidad y usabilidad de compra)
- **Tarea seleccionada**: `ELS-019 - Accesibilidad y usabilidad de compra`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: mejorar accesibilidad y usabilidad del flujo catalogo/ficha -> cesta -> checkout -> pago simulado -> pedido sin cambiar negocio.
- **Nota de orden**: se ejecuta accesibilidad por prompt explicito del usuario; checkout unico queda desplazado a `ELS-020`.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - componentes de ficha, cesta, checkout, selector de lineas y recibo real
  - tests frontend de checkout, cesta, pedido y compra local.
- **Archivos tocados en esta ejecucion**:
  - `frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx`
  - `frontend/componentes/catalogo/cesta/VistaCestaRitual.tsx`
  - `frontend/componentes/catalogo/seleccion/ListaLineasSeleccion.tsx`
  - `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`
  - `frontend/tests/checkout-real-ui.test.ts`
  - `frontend/tests/cesta-ritual.test.ts`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Asociar campos del checkout con `label/htmlFor`, `id`, `aria-invalid` y errores enlazados.
  2. Enfocar el bloque de error del checkout cuando aparece un error de validacion o stock.
  3. Mantener botones deshabilitados, pero enlazarlos a explicaciones visibles con `aria-describedby`.
  4. Mejorar controles de cantidad/eliminacion en cesta sin cambiar el modelo ni el comportamiento de carrito.
  5. Anunciar carga, mensajes y pago simulado en recibo con roles/ARIA, sin cambiar pago ni backend.
- **Checklist de cierre aplicada (ELS-019)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente accesibilidad y usabilidad del flujo de compra como prompt 19.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se cambio negocio, backend, pago, imagenes, servicios externos ni rediseÃ±o global.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra mejora de accesibilidad sin declarar go-live externo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `npm --prefix frontend run test:checkout-real` -> **OK**, 59 tests.
  - `npm --prefix frontend run test:cesta` -> **OK**, 21 tests.
  - `npm --prefix frontend run test:compra-local` -> **OK**, 3 tests.
  - `npx tsc --module commonjs --target es2020 --outDir .tmp-tests tests/pedido-real-operacion-ui.test.ts && node .tmp-tests/pedido-real-operacion-ui.test.js` -> **OK**, 4 tests.
  - `.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py` -> **OK**, 0 BLOCKER, 1 WARNING esperado por legacy visible documentado, 16 OK.
  - `npm --prefix frontend run lint` -> **OK**.
  - `npm --prefix frontend run build` -> **OK**.
  - `git diff --check` -> **OK** con avisos CRLF existentes.
- **Evidencia de cierre**:
  - checkout real es mas navegable por teclado y comunica errores con foco/ARIA;
  - cesta explica bloqueos y mejora cantidad/eliminacion para lector de pantalla;
  - recibo/pedido anuncia carga, estados y pago simulado local;
  - no quedan `.tmp-tests` ni `.next` versionables.
- **Siguiente paso exacto**: ejecutar `ELS-020`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-020 (seguridad local ecommerce simulado)
- **Tarea seleccionada**: `ELS-020 - Seguridad local ecommerce simulado`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: revisar y endurecer seguridad basica de fase local simulada para secretos, proveedor de pago, Stripe futuro, confirmacion simulada y exposicion.
- **Nota de orden**: se ejecuta seguridad local por prompt explicito del usuario; checkout unico queda desplazado a `ELS-021`.
- **Lectura de contexto realizada**:
  - `.env.railway.example`
  - `frontend/.env.example`
  - `backend/configuracion_django/settings.py`
  - `backend/configuracion_django/validaciones_entorno.py`
  - `backend/nucleo_herbal/presentacion/publica/dependencias.py`
  - `backend/nucleo_herbal/infraestructura/pagos_simulados.py`
  - `backend/nucleo_herbal/infraestructura/pagos_stripe.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_pago_pedidos.py`
  - tests de pago/ACL/deploy guards.
- **Archivos tocados en esta ejecucion**:
  - `.env.railway.example`
  - `frontend/.env.example`
  - `backend/configuracion_django/validaciones_entorno.py`
  - `backend/configuracion_django/settings.py`
  - `backend/nucleo_herbal/aplicacion/casos_de_uso_pago_pedidos.py`
  - `tests/nucleo_herbal/test_deploy_guards.py`
  - `tests/nucleo_herbal/test_api_pago_real.py`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Validar proveedor de pago al cargar settings, no tarde en el wiring.
  2. Mantener `simulado_local` como default seguro.
  3. Requerir configuracion completa si se selecciona `stripe`, incluso en local.
  4. Eliminar email de contacto de logs de pago.
  5. Documentar que Stripe queda reservado para futuro y que secretos no van en frontend.
- **Checklist de cierre aplicada (ELS-020)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente seguridad local como prompt 20.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se activo Stripe, no se hizo pentest, no se cambio negocio.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra seguridad local sin go-live externo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_deploy_guards` -> **OK**, 12 tests.
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_api_pago_real` -> **OK**, 18 tests.
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_api_pedidos_real tests.nucleo_herbal.test_regresion_compra_local_simulada` -> **OK**, 26 tests.
  - `.venv\Scripts\python.exe manage.py check` -> **OK**.
  - `.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py` -> **OK**, 0 BLOCKER, 1 WARNING esperado por legacy visible documentado, 16 OK.
  - `git diff --check` -> **OK**.
- **Evidencia de cierre**:
  - proveedor invalido falla temprano;
  - Stripe seleccionado sin claves falla sin imprimir valores secretos;
  - confirmacion simulada rechaza pedidos cancelados y proveedor no simulado;
  - logs de pago no incluyen email de contacto;
  - variables de entorno documentan modo seguro por defecto.
- **Siguiente paso exacto**: ejecutar `ELS-021`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-021 (analitica local de embudo)
- **Tarea seleccionada**: `ELS-021 - Analitica local de embudo sin terceros`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: medir localmente el embudo vista producto -> cesta -> checkout -> pedido -> pago simulado -> pedido pagado sin servicios externos ni datos personales.
- **Nota de orden**: se ejecuta analitica local por prompt explicito del usuario; checkout unico queda desplazado a `ELS-022`.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `frontend/componentes/catalogo/detalle/FichaProductoCatalogo.tsx`
  - `frontend/componentes/botica-natural/detalle/FichaProductoBoticaNatural.tsx`
  - `frontend/componentes/catalogo/cesta/BotonAgregarCarrito.tsx`
  - `frontend/componentes/botica-natural/AccionesTarjetaProductoBoticaNatural.tsx`
  - `frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx`
  - `frontend/infraestructura/api/pedidos.ts`
  - tests frontend de cesta, checkout y compra local.
- **Archivos tocados en esta ejecucion**:
  - `frontend/contenido/analitica/embudoLocal.ts`
  - `frontend/componentes/analitica/EventoVistaProducto.tsx`
  - `frontend/componentes/catalogo/detalle/FichaProductoCatalogo.tsx`
  - `frontend/componentes/botica-natural/detalle/FichaProductoBoticaNatural.tsx`
  - `frontend/componentes/catalogo/cesta/BotonAgregarCarrito.tsx`
  - `frontend/componentes/botica-natural/AccionesTarjetaProductoBoticaNatural.tsx`
  - `frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx`
  - `frontend/infraestructura/api/pedidos.ts`
  - `frontend/tests/analitica-local.test.ts`
  - `frontend/package.json`
  - `frontend/.env.example`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Usar analitica local frontend por consola estructurada en vez de endpoint persistente para evitar nueva superficie HTTP y almacenamiento innecesario.
  2. Centralizar contrato y emision en `embudoLocal.ts`, sin `console.info` disperso por componentes.
  3. Mantener `checkout_abandonado` fuera de alcance porque inferirlo sin tracking invasivo requiere mas senales de sesion/navegacion.
  4. Excluir PII del contrato: email, telefono, nombre, direccion y codigo postal.
- **Checklist de cierre aplicada (ELS-021)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente analitica local como prompt 21.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se creo dashboard, endpoint, persistencia ni servicio externo.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra analitica local sin terceros ni persistencia.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `npm --prefix frontend run test:analitica-local` -> **OK**, 4 tests.
  - `npm --prefix frontend run test:checkout-real` -> **OK**, 59 tests.
  - `npm --prefix frontend run test:compra-local` -> **OK**, 3 tests.
  - `npm --prefix frontend run test:cesta` -> **OK**, 21 tests.
  - `npm --prefix frontend run lint` -> **OK**.
  - `npm --prefix frontend run build` -> **OK**.
  - `git diff --check` -> **OK** con avisos CRLF existentes.
- **Evidencia de cierre**:
  - eventos locales disponibles: `producto_visto`, `producto_anadido_cesta`, `checkout_iniciado`, `pedido_creado`, `pago_simulado_iniciado`, `pago_simulado_confirmado`, `pedido_pagado`, `error_stock`;
  - emision desactivable con `NEXT_PUBLIC_ANALITICA_LOCAL=false`;
  - contrato sin PII y sin envio a terceros;
  - tests dedicados cubren contrato, desactivacion, emision y pago simulado.
- **Siguiente paso exacto**: ejecutar `ELS-022`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-022 (legal y confianza comercial minima)
- **Tarea seleccionada**: `ELS-022 - Legal y confianza comercial minima`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: ordenar paginas legales/comerciales minimas para ecommerce local simulado sin claims sanitarios, sin prometer cumplimiento legal definitivo y sin activar pago real.
- **Nota de orden**: se ejecuta legal/confianza por prompt explicito del usuario; checkout unico queda desplazado a `ELS-023`.
- **Lectura de contexto realizada**:
  - `docs/00_vision_proyecto.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `frontend/contenido/legal/paginasLegalesComerciales.ts`
  - `frontend/componentes/legal/PaginaLegalComercial.tsx`
  - `frontend/componentes/shell/FooterComercial.tsx`
  - `frontend/contenido/shell/navegacionGlobal.ts`
  - `frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx`
  - tests legales, footer, checkout y SEO.
- **Archivos tocados en esta ejecucion**:
  - `frontend/contenido/legal/paginasLegalesComerciales.ts`
  - `frontend/componentes/legal/PaginaLegalComercial.tsx`
  - `frontend/componentes/shell/FooterComercial.tsx`
  - `frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx`
  - `frontend/app/devoluciones/page.tsx`
  - `frontend/app/contacto/page.tsx`
  - `frontend/tests/legal-comercial.test.ts`
  - `frontend/tests/shell-global.test.ts`
  - `frontend/tests/checkout-real-ui.test.ts`
  - `frontend/tests/paginas-informativas-seo.test.ts`
  - `frontend/tests/seo-contrato-regresion.test.ts`
  - `docs/seo_contrato.json`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener la ruta historica `/condiciones-encargo`, pero reencuadrarla como condiciones de compra y consulta artesanal.
  2. Crear `/devoluciones` y `/contacto` como paginas informativas no indexables, enlazadas desde footer.
  3. No crear politica legal definitiva ni prometer go-live externo.
  4. Declarar limites de producto sin claims sanitarios: uso tradicional, ritual, aromatico, cultural o decorativo; no sustituye consejo medico ni garantiza resultados.
  5. Mantener `/envios-y-preparacion` como unica pagina legal/comercial estrategica indexable.
- **Checklist de cierre aplicada (ELS-022)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente legal/confianza como prompt 22.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se toco backend, pago real, cookies de terceros ni fiscalidad profunda.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra legal/confianza local sin go-live externo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `npm --prefix frontend run test:legal` -> **OK**, 8 tests.
  - `npm --prefix frontend run test:shell` -> **OK**, 11 tests.
  - `npm --prefix frontend run test:checkout-real` -> **OK**, 60 tests.
  - `npm --prefix frontend run test:paginas-informativas-seo` -> **OK**, 3 tests.
  - `npm --prefix frontend run test:seo:contrato` -> **OK**.
  - `rg -n "cura(n|r|ción)|milagro|tratamiento garantizado|diagnostica|diagnóstico|sana(r|ción)|propiedades medicinales" frontend/app frontend/componentes frontend/contenido -S` -> **OK**, solo apariciones de negacion/limite o diagnostico tecnico de admin.
  - `npm --prefix frontend run lint` -> **OK**.
  - `npm --prefix frontend run build` -> **OK**.
  - `git diff --check` -> **OK** con avisos CRLF existentes.
- **Evidencia de cierre**:
  - footer enlaza condiciones, envios, devoluciones, privacidad y contacto;
  - checkout enlaza condiciones, privacidad, envios y devoluciones;
  - `/devoluciones` y `/contacto` existen y son noindex segun contrato SEO;
  - copy legal advierte que no sustituye revision legal profesional;
  - no se activan cookies publicitarias, pago real ni servicios externos.
- **Siguiente paso exacto**: ejecutar `ELS-023`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-023 (guardrail legacy demo congelado)
- **Tarea seleccionada**: `ELS-023 - Guardrail legacy demo congelado`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: congelar formalmente el flujo demo legacy para impedir que nuevas capacidades dependan de `/encargo`, `/pedido-demo`, `PedidoDemo` o `cuenta-demo`, sin borrar legacy.
- **Nota de orden**: se ejecuta guardrail legacy por prompt explicito del usuario; checkout unico queda desplazado a `ELS-024`.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `scripts/check_ecommerce_local_simulado.py`
  - `tests/scripts/test_check_ecommerce_local_simulado.py`
  - rutas y tests legacy/checkout real mediante busqueda estatica.
- **Archivos tocados en esta ejecucion**:
  - `scripts/check_ecommerce_local_simulado.py`
  - `tests/scripts/test_check_ecommerce_local_simulado.py`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Integrar el guardrail en el gate local existente para que forme parte de la validacion recurrente.
  2. Bloquear dependencias explicitas de `PedidoDemo`, `PayloadPedidoDemo`, `CuentaDemo`, `pedidosDemo` y `cuentasDemo` en checkout real.
  3. Bloquear `cuenta-demo` en navegacion principal.
  4. Mantener `/encargo` como `WARNING` cuando aparece como consulta secundaria, no como blocker.
  5. Documentar retirada futura, sin ejecutarla.
- **Checklist de cierre aplicada (ELS-023)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente congelar legacy demo y crear guardrail.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se borro legacy, no se migro data demo, no se toco pago ni checkout funcional.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra guardrail legacy sin declarar retirada.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `.venv\Scripts\python.exe -m unittest tests.scripts.test_check_ecommerce_local_simulado` -> **OK**, 8 tests.
  - `.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py` -> **OK**, 0 BLOCKER, 2 WARNING esperados, 18 OK.
  - `.venv\Scripts\python.exe manage.py check` -> **OK**.
  - `git diff --check` -> pendiente en cierre final.
- **Evidencia de cierre**:
  - gate bloquea demo en checkout real;
  - gate bloquea `cuenta-demo` en navegacion principal;
  - gate mantiene `/encargo` solo como consulta secundaria con warning;
  - roadmap local lista legacy conservado, prohibiciones nuevas y retirada futura.
- **Siguiente paso exacto**: ejecutar `ELS-024`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-024 (operativa local ecommerce simulado)
- **Tarea seleccionada**: `ELS-024 - Operativa local ecommerce simulado`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: crear una guia operativa local unica para levantar, poblar, probar y validar ecommerce real local con pago simulado sin depender de memoria ni prompts previos.
- **Nota de orden**: se ejecuta operativa local por prompt explicito del usuario; checkout unico queda desplazado a `ELS-025`.
- **Lectura de contexto realizada**:
  - `AGENTS.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `docs/16_admin_operativa_django.md`
  - `scripts/bootstrap_ecommerce_local_simulado.py`
  - `scripts/check_ecommerce_local_simulado.py`
  - `frontend/package.json`
  - `.env.railway.example`
  - `frontend/.env.example`
- **Archivos tocados en esta ejecucion**:
  - `docs/operativa_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Crear una guia nueva porque no existe `README.md` ni una guia unica equivalente.
  2. Documentar comandos verificados separados de comandos documentados pero no ejecutados.
  3. No arrancar servidores persistentes ni ejecutar comandos mutantes salvo `bootstrap --dry-run`.
  4. Reafirmar que Stripe no se activa y `V2-R10` no se desbloquea.
- **Checklist de cierre aplicada (ELS-024)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente documentacion operativa local.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se cambio codigo funcional, deploy ni pago.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra guia operativa local sin declarar produccion lista.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `.\setup_entorno.bat --check` -> **OK**.
  - `.\run_app.bat --check` -> **OK**.
  - `.venv\Scripts\python.exe scripts/bootstrap_ecommerce_local_simulado.py --help` -> **OK**.
  - `.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py --help` -> **OK**.
  - `.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py` -> **OK**, 0 BLOCKER, 2 WARNING esperados, 18 OK.
  - `.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py --json` -> **OK**.
  - `.venv\Scripts\python.exe scripts/bootstrap_ecommerce_local_simulado.py --dry-run` -> **OK**, cambios revertidos.
  - busqueda de linter documental -> **OK sin linter dedicado localizado**.
- **Evidencia de cierre**:
  - guia operativa creada;
  - guia enlazada desde roadmap local y estado de implementacion;
  - comandos documentados distinguen verificados vs no ejecutados;
  - troubleshooting cubre stock, producto ausente, pago simulado, cuenta, documento y gate.
- **Siguiente paso exacto**: ejecutar `ELS-025`, consolidar `/checkout` como flujo unico local sin borrar legacy ni activar pagos reales.

## Entrada 2026-04-28-ELS-025 (checklist final presentacion ecommerce local)
- **Tarea seleccionada**: `ELS-025 - Checklist final de presentacion portfolio/ecommerce local`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: crear una checklist final para validar si la web esta presentable como pieza portfolio/ecommerce local real con pago simulado, sin venderla como produccion real.
- **Lectura de contexto realizada**:
  - `docs/00_vision_proyecto.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/operativa_ecommerce_local_simulado.md`
  - `docs/13_testing_ci_y_quality_gate.md`
  - `scripts/check_ecommerce_local_simulado.py`
  - `AGENTS.md`
- **Archivos tocados en esta ejecucion**:
  - `docs/checklist_presentacion_ecommerce_local.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Crear una checklist nueva y practica porque no existia un documento especifico de presentacion portfolio/ecommerce local.
  2. Usar estados `OK / REVISAR / BLOQUEA PRESENTACION` para evitar maquillar limitaciones.
  3. Incluir guion de demo y promesas prohibidas para distinguir portfolio/local de go-live real.
  4. No tocar codigo funcional, no activar Stripe y no cerrar `V2-R10`.
- **Checklist de cierre aplicada (ELS-025)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente checklist final de presentacion.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; solo documentacion y enlaces vivos.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra checklist sin declarar produccion lista.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py` -> **OK**, 0 BLOCKER, 2 WARNING esperados, 18 OK.
  - `git diff --check` -> **OK**.
  - conteo de lineas de `docs/checklist_presentacion_ecommerce_local.md` -> **OK**, 86 lineas.
- **Evidencia de cierre**:
  - checklist creada con cobertura de identidad, home, catalogo, ficha, cesta, checkout, pago simulado, pedido, cuenta, admin, stock, documento, SEO, legal, accesibilidad, rendimiento, gates y limites;
  - checklist enlazada desde roadmap local y estado de implementacion;
  - guion de demo y lista de promesas prohibidas documentados;
  - siguiente salto real documenta staging, Stripe sandbox/real, backup/restore, revision legal, E2E y `V2-R10`.
- **Siguiente paso exacto**: ejecutar una pasada manual de presentacion siguiendo `docs/checklist_presentacion_ecommerce_local.md` y registrar cualquier `BLOQUEA PRESENTACION` como prompt correctivo atomico.

## Entrada 2026-04-28-ELS-026 (catalogo vendible por seccion)
- **Tarea seleccionada**: `ELS-026 - Catalogo vendible por seccion`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: auditar y corregir coherencia del catalogo vendible para que cada producto publico comprable tenga contrato comercial completo por seccion.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/06_catalogo_y_taxonomias.md`
  - modelos `ProductoModelo` e `InventarioProductoModelo`
  - repositorio publico de productos por seccion
  - serializadores publicos de producto
  - `scripts/bootstrap_ecommerce_local_simulado.py`
  - frontend de secciones/ficha/card de producto
  - tests de exposicion publica y bootstrap local
- **Archivos tocados en esta ejecucion**:
  - `scripts/bootstrap_ecommerce_local_simulado.py`
  - `tests/nucleo_herbal/test_catalogo_vendible_local.py`
  - `docs/06_catalogo_y_taxonomias.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Ampliar el bootstrap local en vez de crear fixtures paralelos, para mantener un dataset local canonico e idempotente.
  2. Fijar minimos: 5 productos propios en `botica-natural` y 3 en cada seccion comercial abierta restante.
  3. Validar imagen/fallback y CTA mediante contrato estatico sobre frontend existente, sin tocar imagenes ni redisenar fichas.
  4. Mantener productos sin stock como no comprables via disponibilidad publica, no como error ni checkout activo.
- **Checklist de cierre aplicada (ELS-026)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio auditoria de catalogo vendible por seccion.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se tocaron pasarela, pedidos, Stripe, imagenes ni legacy.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra contrato vendible local sin declarar produccion lista.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_catalogo_vendible_local` -> **OK**, 5 tests.
  - `.venv\Scripts\python.exe -m unittest tests.scripts.test_bootstrap_ecommerce_local_simulado` -> **FALLO ESPERADO DE COMANDO INCORRECTO**, Django settings no configurado con `unittest` puro.
  - `.venv\Scripts\python.exe manage.py test tests.scripts.test_bootstrap_ecommerce_local_simulado` -> **OK**, 4 tests.
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_exposicion_publica` -> **OK**, 26 tests.
  - `.venv\Scripts\python.exe scripts/bootstrap_ecommerce_local_simulado.py --dry-run` -> **OK**, 14 productos y 14 inventarios en dry-run.
  - `.venv\Scripts\python.exe manage.py check` -> **OK**.
  - `.venv\Scripts\python.exe scripts/check_ecommerce_local_simulado.py` -> **OK**, 0 BLOCKER, 2 WARNING esperados, 18 OK.
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_catalogo_vendible_local tests.nucleo_herbal.test_exposicion_publica tests.scripts.test_bootstrap_ecommerce_local_simulado` -> **OK**, 35 tests.
  - `git diff --check` -> **OK**.
- **Evidencia de cierre**:
  - bootstrap local garantiza masa vendible por seccion;
  - contrato automatizado valida producto vendible completo;
  - se comprueba que las secciones abiertas no reciben fallback herbal ajeno;
  - producto sin stock queda como no comprable;
  - criterios de producto vendible y seccion publicable quedan documentados en catalogo/taxonomias.
- **Siguiente paso exacto**: auditar visualmente las paginas de seccion abiertas y decidir si `velas-e-incienso`, `minerales-y-energia` y `herramientas-esotericas` deben mostrar grid completo de productos o seguir como hero hasta un prompt frontend especifico.

## Entrada 2026-04-28-ELS-027 (errores y estados vacios comerciales)
- **Tarea seleccionada**: `ELS-027 - Errores y estados vacios comerciales`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: mejorar estados vacios, errores y bloqueos del flujo comercial para que catalogo, ficha, cesta, checkout y pedido no muestren pantallas rotas ni codigos tecnicos al usuario.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - componentes de Botica Natural, cesta, checkout real y recibo real
  - API frontend de pedidos
  - tests frontend de cesta, checkout real y Botica Natural.
- **Archivos tocados en esta ejecucion**:
  - `frontend/contenido/pedidos/estadosComercialesPedido.ts`
  - `frontend/infraestructura/api/pedidos.ts`
  - `frontend/componentes/catalogo/checkout-real/FlujoCheckoutReal.tsx`
  - `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`
  - `frontend/componentes/botica-natural/ListadoProductosBoticaNatural.tsx`
  - `frontend/componentes/botica-natural/detalle/FichaProductoBoticaNatural.tsx`
  - `frontend/app/botica-natural/[slug]/not-found.tsx`
  - `frontend/tests/checkout-real.test.ts`
  - `frontend/tests/checkout-real-ui.test.ts`
  - `frontend/tests/botica-natural.test.ts`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Centralizar traduccion de errores comerciales en un helper puro de `contenido/pedidos`, sin acoplar componentes a codigos internos.
  2. Normalizar mensajes en la API frontend para que checkout/recibo reciban copy seguro por defecto, conservando `codigo` y `lineas` solo como contrato interno.
  3. Mantener `/encargo` como salida secundaria solo en producto no comprable o estado vacio de consulta, no como compra principal.
  4. No tocar backend ni pasarela porque el problema es de presentacion y resiliencia UI.
- **Checklist de cierre aplicada (ELS-027)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente el prompt 27.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se cambio backend, pago, Stripe ni negocio.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra ELS-027 como capacidad implementada y testeada.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `npm --prefix frontend run test:checkout-real` -> **OK**, 62 tests.
  - `npm --prefix frontend run test:botica-natural` -> **OK**, 19 tests.
  - `npm --prefix frontend run test:cesta` -> **OK**, 21 tests.
  - `npm --prefix frontend run test:compra-local` -> **OK**, 3 tests.
  - `npm --prefix frontend run lint` -> **OK**.
  - `npm --prefix frontend run build` -> **OK**.
  - `npm --prefix frontend run clean:tmp-tests` -> **OK**.
  - `git diff --check` -> **OK** con avisos CRLF existentes.
  - busqueda de artefactos prohibidos versionables (`*.pyc`, `*.sqlite3`, `*.db`, `*.mo`, `*.zip`, `*.pdf`, `.tmp-tests`, `__pycache__`) -> **OK**, sin coincidencias; `.next` queda ignorado por build.
- **Evidencia de cierre**:
  - los errores de stock/pago/pedido se traducen a mensajes humanos antes de mostrarse;
  - checkout ofrece volver a cesta y revisar disponibilidad;
  - recibo controla pedido no cargado y errores de pago simulado sin exponer detalles tecnicos;
  - Botica Natural cubre seccion vacia, producto no encontrado y producto sin stock con CTAs utiles.
- **Siguiente paso exacto**: ejecutar una revision visual ligera de estados vacios/error en navegador local con datos reales del bootstrap y registrar cualquier ajuste visual como prompt UX atomico.

## Entrada 2026-04-28-ELS-028 (estabilidad visual de secciones comerciales)
- **Tarea seleccionada**: `ELS-028 - Estabilidad visual de secciones comerciales`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: unificar la presentacion visual y funcional de las secciones comerciales para que compartan estructura, grid, tarjetas, disponibilidad, CTAs y estados sin duplicar componentes.
- **Lectura de contexto realizada**:
  - `docs/00_vision_proyecto.md`
  - `docs/09_ux_ui_y_navegacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - rutas `/botica-natural`, `/velas-e-incienso`, `/minerales-y-energia`, `/herramientas-esotericas` y `/colecciones`
  - componentes de secciones, tarjetas, listados, fichas y CSS global
  - tests frontend de secciones/catalogo/fichas.
- **Archivos tocados en esta ejecucion**:
  - `frontend/contenido/catalogo/seccionesComerciales.ts`
  - `frontend/componentes/catalogo/secciones/SeccionComercialProductos.tsx`
  - `frontend/componentes/catalogo/secciones/ListadoProductosSeccionComercial.tsx`
  - `frontend/componentes/botica-natural/ListadoProductosBoticaNatural.tsx`
  - `frontend/app/botica-natural/page.tsx`
  - `frontend/app/velas-e-incienso/page.tsx`
  - `frontend/app/minerales-y-energia/page.tsx`
  - `frontend/app/herramientas-esotericas/page.tsx`
  - `frontend/tests/botica-natural.test.ts`
  - `frontend/tests/home-raiz-secciones.test.ts`
  - `frontend/tests/layout-comercial-full-width.test.ts`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener una unica composicion comun para secciones comerciales en vez de duplicar paginas por familia.
  2. Conservar filtros solo en Botica Natural mediante slot opcional; las demas secciones usan el mismo grid sin rail.
  3. Reutilizar `TarjetaProductoBoticaNatural` como tarjeta comercial publica compartida porque ya contiene imagen/fallback, precio, disponibilidad, ficha y carrito.
  4. Hacer que `velas-e-incienso`, `minerales-y-energia` y `herramientas-esotericas` consulten productos reales por seccion, sin tocar backend.
- **Checklist de cierre aplicada (ELS-028)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente estabilidad visual de secciones comerciales.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se tocaron backend, pago, stock, imagenes ni checkout.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; se conservan cambios previos sin revertir.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra capacidad de presentacion comercial compartida.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `npm --prefix frontend run test:botica-natural` -> **OK**, 20 tests.
  - `npm --prefix frontend run test:home-raiz` -> **OK**, 7 tests.
  - `npm --prefix frontend run test:catalogo` -> **OK**, 12 tests.
  - `npm --prefix frontend run test:catalogo-detalle` -> **OK**, 10 tests.
  - `npm --prefix frontend run test:fichas-seo` -> **OK**, 3 tests.
  - `npm --prefix frontend run test:cards-media-clickable` -> **FALLO ESPERADO**, script no existe.
  - `cd frontend; npm run clean:tmp-tests; npx tsc --module commonjs --target es2020 --outDir .tmp-tests tests/cards-media-clickable.test.ts; node .tmp-tests/cards-media-clickable.test.js` -> **OK**, 6 tests.
  - `npm --prefix frontend run lint` -> **OK**.
  - `npm --prefix frontend run build` -> **OK**; registra avisos de conexion esperados para secciones dinamicas si backend local no esta levantado.
- **Evidencia de cierre**:
  - cuatro secciones comerciales principales usan `SeccionComercialProductos`;
  - las secciones no herbales dejaron de ser solo hero y muestran catalogo publico cuando hay backend/datos;
  - Botica Natural conserva filtros y comparte listado/tarjeta/estado con el resto;
  - no se introducen imagenes, claims sanitarios ni rutas legacy nuevas.
- **Siguiente paso exacto**: levantar backend/frontend con bootstrap local y hacer revision visual desktop/mobile de las cuatro secciones para ajustar solo espaciado/copy si se detecta friccion.

## Entrada 2026-04-28-ELS-029 (plan retirada legacy demo)
- **Tarea seleccionada**: `ELS-029 - Plan retirada legacy demo`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: crear un plan tecnico de retirada gradual de `/encargo`, `/pedido-demo`, `PedidoDemo` y `cuenta-demo`, sin ejecutar borrados ni cambios funcionales.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `scripts/check_ecommerce_local_simulado.py`
  - referencias reales a rutas, modelos, endpoints, componentes y tests legacy mediante `rg`.
- **Archivos tocados en esta ejecucion**:
  - `docs/plan_retirada_legacy_demo.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener el trabajo como plan documental: no se eliminan rutas, modelos, migraciones, datos, endpoints ni tests legacy.
  2. Separar retirada en fases verificables: ocultar navegacion, congelar escritura, lectura historica, migracion/exportacion, retirada de endpoints, retirada de modelos/migraciones y limpieza de tests.
  3. Exigir rollback y tests por fase antes de cualquier retirada real.
  4. Mantener el guardrail legacy como defensa permanente contra reintroduccion de `PedidoDemo`/`CuentaDemo` en el flujo real.
- **Checklist de cierre aplicada (ELS-029)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente el prompt 29.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se cambio codigo funcional ni datos.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; solo documentacion y enlaces vivos.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra como `DONE documental`, no como legacy eliminado.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `python scripts/check_ecommerce_local_simulado.py` -> **OK**, 18 checks OK y 2 WARNING esperados por legacy visible documentado y `/encargo` como consulta secundaria.
  - `git diff --check` -> **OK**; muestra avisos CRLF existentes del worktree.
  - busqueda de artefactos prohibidos versionables (`*.pyc`, `*.sqlite3`, `*.db`, `*.mo`, `*.zip`, `*.pdf`, `.tmp-tests`, `__pycache__`) -> **OK**, sin coincidencias.
- **Evidencia de cierre**:
  - `docs/plan_retirada_legacy_demo.md` inventaria superficies legacy y define fases A-G con precondiciones, tests y rollback;
  - roadmap local enlaza el plan desde la seccion de retirada futura y guias operativas;
  - estado de implementacion registra que el legacy sigue `DEPRECATED_CONTROLLED`.
- **Siguiente paso exacto**: ejecutar una fase A futura, en prompt separado, para auditar y retirar cualquier resto de navegacion publica legacy que no sea consulta secundaria.

## Entrada 2026-04-28-ELS-030 (auditoria final automatizable)
- **Tarea seleccionada**: `ELS-030 - Auditoria final automatizable`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: crear una auditoria final documental y automatizable que consolide estado, riesgos, blockers y warnings del ecommerce local simulado antes de presentacion u optimizacion.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/checklist_presentacion_ecommerce_local.md`
  - `docs/operativa_ecommerce_local_simulado.md`
  - `docs/plan_retirada_legacy_demo.md`
  - `scripts/check_ecommerce_local_simulado.py`
  - tests de scripts existentes y scripts de release/check.
- **Archivos tocados en esta ejecucion**:
  - `docs/auditoria_final_ecommerce_local_simulado.md`
  - `scripts/audit_ecommerce_local_simulado.py`
  - `tests/scripts/test_audit_ecommerce_local_simulado.py`
  - `docs/operativa_ecommerce_local_simulado.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Crear un script separado de auditoria para no cambiar el contrato del gate local existente.
  2. Reutilizar `check_ecommerce_local_simulado.evaluar()` como fuente de guardrails de ruta, pago, SEO, legacy y `V2-R10`.
  3. Agregar checks estaticos de documentacion clave, catalogo vendible, checklist, regresion local y plan legacy.
  4. Mantener la auditoria como solo lectura: no corrige problemas, no activa Stripe y no declara go-live.
- **Checklist de cierre aplicada (ELS-030)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente el prompt 30.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se cambio UX, pago, catalogo funcional ni legacy.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; script, tests y documentacion.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra como auditoria local, no como go-live.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `python -m unittest tests.scripts.test_audit_ecommerce_local_simulado` -> **OK**, 6 tests.
  - `python -m unittest tests.scripts.test_check_ecommerce_local_simulado tests.scripts.test_audit_ecommerce_local_simulado` -> **OK**, 14 tests.
  - `python scripts/check_ecommerce_local_simulado.py` -> **OK**, 18 checks OK y 2 WARNING esperados por legacy documentado y `/encargo` como consulta secundaria.
  - `python scripts/audit_ecommerce_local_simulado.py` -> **OK**, 0 BLOCKER, 1 WARNING y 5 OK.
  - `python scripts/audit_ecommerce_local_simulado.py --json` -> **OK**, 0 BLOCKER, 1 WARNING y 5 OK.
  - `git diff --check` -> **OK**; muestra avisos CRLF existentes del worktree.
  - busqueda de artefactos prohibidos versionables (`*.pyc`, `*.sqlite3`, `*.db`, `*.mo`, `*.zip`, `*.pdf`, `.tmp-tests`, `__pycache__`) -> **OK**, sin coincidencias.
- **Evidencia de cierre**:
  - la auditoria documental resume listo/simulado/legacy/bloqueos/riesgos/calidad/siguiente roadmap;
  - el script agrega resultados de gate local y checks estaticos clave;
  - los tests cubren blockers principales pedidos por el prompt.
- **Siguiente paso exacto**: resolver cualquier `BLOCKER` de auditoria si aparece; si solo quedan warnings esperados de legacy, preparar revision visual manual del recorrido completo.

## Entrada 2026-04-28-ELS-031 (recorrido de presentacion)
- **Tarea seleccionada**: `ELS-031 - Recorrido de presentacion`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: definir un guion estable para presentar a terceros el ecommerce local real con pago simulado sin declarar produccion ni reactivar demo legacy.
- **Lectura de contexto realizada**:
  - `docs/checklist_presentacion_ecommerce_local.md`
  - `docs/auditoria_final_ecommerce_local_simulado.md`
  - `docs/operativa_ecommerce_local_simulado.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - rutas/componentes de home, Botica Natural, cesta, checkout, pedido, cuenta y secciones comerciales.
- **Archivos tocados en esta ejecucion**:
  - `docs/guion_demo_ecommerce_local.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/operativa_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Crear solo documentacion de guion; no se detecto necesidad de tocar UI/copy funcional.
  2. Usar `/botica-natural` como seccion recomendada por su filtro y dataset local estable.
  3. Mantener `/encargo` fuera del recorrido principal, solo como consulta secundaria si alguien pregunta por productos fuera de catalogo.
  4. Explicar el pago simulado como entorno local y no como demo general ni cobro real.
- **Checklist de cierre aplicada (ELS-031)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente el prompt 31.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se implementaron features, no se activo pago real ni se toco deploy.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; solo documentacion.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra como `DONE documental`.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `python scripts/check_ecommerce_local_simulado.py` -> **OK**, 18 checks OK y 2 WARNING esperados por legacy documentado y `/encargo` como consulta secundaria.
  - `git diff --check` -> **OK**; muestra avisos CRLF existentes del worktree.
  - busqueda de artefactos prohibidos versionables (`*.pyc`, `*.sqlite3`, `*.db`, `*.mo`, `*.zip`, `*.pdf`, `.tmp-tests`, `__pycache__`) -> **OK**, sin coincidencias.
- **Evidencia de cierre**:
  - `docs/guion_demo_ecommerce_local.md` cubre ruta, dato, accion, resultado, frase, riesgo y recuperacion por paso;
  - el recorrido recomendado usa `/checkout`, `Pedido`, `/pedido/[id_pedido]` y `/mi-cuenta`;
  - el documento lista que no decir y que si destacar en la demo.
- **Siguiente paso exacto**: ejecutar una revision visual manual desktop/mobile siguiendo el guion con backend/frontend levantados y datos bootstrap.

## Entrada 2026-04-28-ELS-032 (Stripe reservado)
- **Tarea seleccionada**: `ELS-032 - Stripe reservado`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: preparar y documentar el cambio futuro de `simulado_local` a `stripe` sin activar Stripe real ni romper el modo local simulado.
- **Lectura de contexto realizada**:
  - `backend/nucleo_herbal/infraestructura/pagos_simulados.py`
  - `backend/nucleo_herbal/infraestructura/pagos_stripe.py`
  - `backend/nucleo_herbal/presentacion/publica/dependencias.py`
  - `backend/configuracion_django/settings.py`
  - `backend/configuracion_django/validaciones_entorno.py`
  - `.env.railway.example`
  - `frontend/.env.example`
  - `docs/release_readiness_minima.md`
  - tests de pago, deploy guards y gate local.
- **Archivos tocados en esta ejecucion**:
  - `docs/pagos_modo_local_y_stripe.md`
  - `scripts/check_ecommerce_local_simulado.py`
  - `tests/scripts/test_check_ecommerce_local_simulado.py`
  - `tests/nucleo_herbal/test_deploy_guards.py`
  - `docs/release_readiness_minima.md`
  - `docs/operativa_ecommerce_local_simulado.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener `simulado_local` como default y no exigir claves Stripe en local.
  2. No tocar el adaptador Stripe funcional ni webhooks: ya estan detras del puerto y quedan reservados.
  3. Anadir guardrail al gate local para detectar el proveedor del entorno de ejecucion.
  4. Documentar precondiciones, pruebas y rollback antes de cualquier fase Stripe.
- **Checklist de cierre aplicada (ELS-032)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente el prompt 32.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se activo Stripe, no se toco checkout ni deploy.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; documentacion, guardrail y tests.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra Stripe como reservado, no activo.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `python manage.py test tests.nucleo_herbal.test_pago_real tests.nucleo_herbal.test_api_pago_real` -> **OK**, 35 tests.
  - `python manage.py test tests.nucleo_herbal.test_deploy_guards` -> **OK**, 13 tests.
  - `python -m unittest tests.scripts.test_check_ecommerce_local_simulado` -> **OK**, 11 tests.
  - `python manage.py check` -> **OK**.
  - `python scripts/check_ecommerce_local_simulado.py` -> **OK**, 19 checks OK y 2 WARNING esperados por legacy documentado y `/encargo` como consulta secundaria.
  - `python scripts/audit_ecommerce_local_simulado.py` -> **OK**, 0 BLOCKER, 1 WARNING y 5 OK.
  - `python scripts/check_release_readiness.py` -> **OK**.
  - `git diff --check` -> **OK**; muestra avisos CRLF existentes del worktree.
  - busqueda de artefactos prohibidos versionables (`*.pyc`, `*.sqlite3`, `*.db`, `*.mo`, `*.zip`, `*.pdf`, `.tmp-tests`, `__pycache__`) -> **OK**, sin coincidencias.
- **Evidencia de cierre**:
  - `docs/pagos_modo_local_y_stripe.md` documenta contrato local/futuro, precondiciones, pruebas y rollback;
  - el gate local marca `stripe` como warning fuera de modo local y proveedor desconocido como blocker;
  - tests aseguran que el modo local no intenta exigir claves Stripe.
- **Siguiente paso exacto**: mantener Stripe reservado hasta una fase dedicada de staging/Stripe sandbox con smoke externo y rollback probado.

## Entrada 2026-04-28-ELS-033 (staging futuro)
- **Tarea seleccionada**: `ELS-033 - Staging futuro`.
- **Estado final**: `DONE documental`.
- **Objetivo de la ejecucion**: preparar documentacion y checks minimos para un futuro entorno staging sin desplegar, activar servicios externos, activar Stripe ni desbloquear `V2-R10`.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `.env.railway.example`
  - `docs/release_readiness_minima.md`
  - scripts de release/readiness, deploy smoke, backup/restore, gate local y auditoria.
- **Archivos tocados en esta ejecucion**:
  - `docs/preparacion_staging_ecommerce.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener la tarea como documentacion preparatoria; no se crearon scripts ni se toco configuracion productiva.
  2. Documentar staging inicial con `BOTICA_PAYMENT_PROVIDER=simulado_local`.
  3. Reservar Stripe sandbox para fase futura explicita y Stripe real para go-live posterior.
  4. Referenciar checks existentes sin hacerlos bloqueantes cuando dependen de URLs/variables externas.
- **Checklist de cierre aplicada (ELS-033)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente el prompt 33.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se desplego, no se activo Stripe y no se tocaron servicios externos.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; solo documentacion.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra como preparacion staging, no como go-live.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `python scripts/check_ecommerce_local_simulado.py` -> **OK**, 19 checks OK y 2 WARNING esperados por legacy documentado y `/encargo` como consulta secundaria.
  - `python scripts/audit_ecommerce_local_simulado.py` -> **OK**, 0 BLOCKER, 1 WARNING esperado por legacy controlado y 5 OK.
  - `python scripts/check_release_readiness.py` -> **OK**.
  - `git diff --check` -> **OK**; muestra avisos CRLF existentes del worktree.
  - busqueda de artefactos prohibidos versionables (`*.pyc`, `*.sqlite3`, `*.db`, `*.mo`, `*.zip`, `*.pdf`, `.tmp-tests`, `__pycache__`) -> **OK**, sin coincidencias.
- **Evidencia de cierre**:
  - `docs/preparacion_staging_ecommerce.md` distingue local, staging y produccion;
  - documenta variables, servicios, base temporal, URLs, backup/restore drill, checks pre/post deploy y rollback;
  - explicita que no desbloquea `V2-R10`, no activa produccion y no activa pago real;
  - `docs/roadmap_ecommerce_real_v2.md` mantiene `V2-R10` en `BLOCKED`.
- **Siguiente paso exacto**: cuando se apruebe una fase externa, preparar variables reales de staging y ejecutar smoke post-deploy/backup-restore contra una base temporal autorizada, manteniendo `simulado_local`.

## Entrada 2026-04-28-ELS-034 (auditoria dependencias demo/real)
- **Tarea seleccionada**: `ELS-034 - Auditoria dependencias demo/real`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: auditar dependencias entre modulos demo legacy y modulos reales, corregir acoplamientos pequenos y reforzar guardrails.
- **Lectura de contexto realizada**:
  - estructura backend de dominio/aplicacion/infraestructura/presentacion para pedidos, pagos, cuenta real y demo;
  - estructura frontend de checkout real, pedido real, cuenta real, `/encargo`, `pedido-demo` y `cuenta-demo`;
  - `scripts/check_ecommerce_local_simulado.py`;
  - tests del guardrail local.
- **Archivos tocados en esta ejecucion**:
  - `docs/auditoria_dependencias_demo_real.md`
  - `frontend/contenido/catalogo/checkoutReal.ts`
  - `scripts/check_ecommerce_local_simulado.py`
  - `tests/scripts/test_check_ecommerce_local_simulado.py`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Corregir el blocker pequeno: `checkoutReal.ts` ya no importa `LineaNoConvertiblePedido` desde `checkoutDemo`.
  2. Ampliar el guardrail para bloquear imports demo desde checkout, pedido, cuenta y APIs frontend reales.
  3. Mantener `encargoConsulta` como warning transitorio porque extraerlo requiere una microfase propia de preseleccion compartida.
  4. No tocar backend funcional: no se detectaron imports reales a `PedidoDemo`/`CuentaDemo`.
- **Checklist de cierre aplicada (ELS-034)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente el prompt 34.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; solo auditoria, guardrail, test y correccion pequena.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; documentacion, guardrail, test y helper frontend real.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra como auditoria y guardrail, no como retirada legacy.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `python -m unittest tests.scripts.test_check_ecommerce_local_simulado` -> **OK**, 13 tests.
  - `python scripts/check_ecommerce_local_simulado.py` -> **OK**, 19 checks OK y 3 WARNING esperados (`legacy_visible_documentado`, `checkout_real_encargo_consulta_controlada`, `encargo_consulta_secundaria`).
  - `npm --prefix frontend run lint` -> **OK**.
  - `npm --prefix frontend run build` -> **OK**; el build muestra avisos existentes de endpoints locales no disponibles en secciones durante generacion estatica.
  - `git diff --check` -> **OK**; muestra avisos CRLF existentes del worktree.
  - busqueda de artefactos prohibidos versionables (`*.pyc`, `*.sqlite3`, `*.db`, `*.mo`, `*.zip`, `*.pdf`, `.tmp-tests`, `__pycache__`, `frontend/.next`) -> **OK**, sin coincidencias.
- **Evidencia de cierre**:
  - `docs/auditoria_dependencias_demo_real.md` contiene mapa de checkout real, pedido real, cuenta real, pago simulado y demo legacy;
  - el blocker detectado queda corregido;
  - el warning de `encargoConsulta` queda documentado con tarea futura;
  - el gate bloquea regresiones hacia `checkoutDemo`, `PedidoDemo`, `CuentaDemo`, `pedidosDemo` y `cuentasDemo`.
- **Siguiente paso exacto**: extraer `resolverContextoPreseleccionado` a un helper neutral de preseleccion compartida para que checkout real no importe desde `encargoConsulta`.

## Entrada 2026-04-28-ELS-035 (estado unico documental)
- **Tarea seleccionada**: `ELS-035 - Estado unico documental`.
- **Estado final**: `DONE documental`.
- **Objetivo de la ejecucion**: consolidar documentacion viva para evitar contradicciones entre fase local simulada, ecommerce real V2, demo legacy, `V2-R10` bloqueado y roadmap futuro.
- **Lectura de contexto realizada**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/10_checkout_y_flujos_ecommerce.md`
  - `docs/17_migracion_ecommerce_real.md`
  - documentos nuevos de operativa, checklist, auditoria final, pagos, staging, retirada legacy y dependencias demo/real.
- **Archivos tocados en esta ejecucion**:
  - `docs/00_vision_proyecto.md`
  - `docs/02_alcance_y_fases.md`
  - `docs/10_checkout_y_flujos_ecommerce.md`
  - `docs/17_migracion_ecommerce_real.md`
  - `docs/90_estado_implementacion.md`
  - `docs/99_fuente_de_verdad.md`
  - `docs/roadmap_ecommerce_real_v2.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Conservar documentos historicos y anadir notas de vigencia en lugar de borrarlos.
  2. Hacer de `docs/90_estado_implementacion.md` la lectura rapida operativa para agentes.
  3. Normalizar referencias antiguas a "demo sin compra real" como fase fundacional, no flujo vigente.
  4. Normalizar referencias a Stripe como capacidad preparada/reservada, no proveedor activo local.
  5. Mantener `V2-R10` en `BLOCKED`.
- **Checklist de cierre aplicada (ELS-035)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente el prompt 35.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; solo documentacion, sin codigo funcional ni tests.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; solo documentacion.
  9. Definido vs implementado validado con `docs/90`: **Si**; lectura rapida actualizada.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - busqueda dirigida de terminos contradictorios (`compra real no est`, `PSP real v1 activo`, `Cuando Stripe confirma`, `si Stripe confirma`, `fase actual.*demo`) -> **OK**, sin contradiccion vigente sin normalizacion.
  - `python scripts/check_ecommerce_local_simulado.py` -> **OK**, 19 checks OK y 3 WARNING esperados por legacy/preseleccion controlada.
  - `python scripts/audit_ecommerce_local_simulado.py` -> **OK**, 0 BLOCKER, 1 WARNING esperado por legacy controlado y 5 OK.
  - `git diff --check` -> **OK**; muestra avisos CRLF existentes del worktree.
  - busqueda de artefactos prohibidos versionables (`*.pyc`, `*.sqlite3`, `*.db`, `*.mo`, `*.zip`, `*.pdf`, `.tmp-tests`, `__pycache__`, `frontend/.next`) -> **OK**, sin coincidencias.
- **Evidencia de cierre**:
  - `docs/90_estado_implementacion.md` incluye "Lectura rapida para agentes";
  - `docs/99_fuente_de_verdad.md` incorpora la fase local simulada en la precedencia;
  - documentos fundacionales/historicos quedan marcados como normalizados;
  - `docs/roadmap_ecommerce_real_v2.md` mantiene `V2-R10` bloqueado y Stripe no activo local.
- **Siguiente paso exacto**: ejecutar una revision puntual de los documentos historicos restantes solo si futuros prompts detectan otra frase sin nota de vigencia; no reabrir V1/V2 por defecto.

## Entrada 2026-04-28-ELS-036 (barrido deuda menor ecommerce local)
- **Tarea seleccionada**: `ELS-036 - Barrido deuda menor ecommerce local`.
- **Estado final**: `DONE documental`.
- **Objetivo de la ejecucion**: auditar marcadores de deuda menor (`TODO`, `FIXME`, `HACK`, `temporal`, `demo`, `legacy`, `v1`, `coexistencia`, `pendiente`, `simulado`), corregir solo deuda pequena y documentar deuda residual.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/auditoria_final_ecommerce_local_simulado.md`
  - `scripts/check_ecommerce_local_simulado.py`
- **Archivos tocados en esta ejecucion**:
  - `docs/deuda_residual_ecommerce_local.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Mantener marcadores `demo`/`legacy` cuando pertenecen a historico normalizado, legacy controlado, tests o guardrails.
  2. Corregir solo deuda documental segura: titulos duplicados de ELS-23/ELS-24 en el roadmap local.
  3. No tocar codigo funcional ni eliminar legacy porque el barrido no autoriza refactors grandes.
  4. Registrar `encargoConsulta` como deuda mayor ya conocida, pendiente de microfase neutral.
- **Checklist de cierre aplicada (ELS-036)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente el prompt 36.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; solo documentacion y clasificacion de deuda.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; solo documentacion.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra como barrido documental, no como retirada legacy.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - busqueda inicial de marcadores de deuda en `backend`, `frontend`, `scripts`, `tests` y `docs` -> **OK**, hallazgos clasificados; volumen alto esperado por historico/legacy.
  - busqueda dirigida exacta de `TODO`/`FIXME`/`HACK` fuera de `docs/` -> **OK**, sin coincidencias en `backend`, `frontend`, `scripts` ni `tests`.
  - `python scripts/check_ecommerce_local_simulado.py` -> **OK**, sin `BLOCKER`; warnings esperados por legacy controlado.
  - `python scripts/audit_ecommerce_local_simulado.py` -> **OK**, sin `BLOCKER`.
  - `git diff --check` -> **OK**; puede mostrar avisos CRLF existentes del worktree.
  - busqueda de artefactos prohibidos versionables -> **OK**, sin coincidencias.
- **Evidencia de cierre**:
  - `docs/deuda_residual_ecommerce_local.md` clasifica marcadores validos, legacy permitido, deuda corregida, deuda mayor y blockers;
  - `docs/roadmap_ecommerce_local_simulado.md` enlaza el informe de deuda residual;
  - `docs/90_estado_implementacion.md` registra ELS-036 con reglas activas;
  - no se detectan blockers nuevos para ecommerce local simulado.
- **Siguiente paso exacto**: crear una microfase para extraer `resolverContextoPreseleccionado` desde `encargoConsulta` a un helper neutral compartido por checkout real y consulta legacy.

## Entrada 2026-04-28-ELS-037 (entorno local reproducible)
- **Tarea seleccionada**: `ELS-037 - Entorno local reproducible`.
- **Estado final**: `DONE`.
- **Objetivo de la ejecucion**: definir y verificar el contrato minimo para levantar ecommerce local simulado sin ambiguedad de variables, comandos, datos, backend, frontend, pago simulado y gates.
- **Lectura de contexto realizada**:
  - `README.md` -> no existe en la raiz del repo;
  - `.env.example` -> no existia en la raiz del repo;
  - `.env.railway.example`;
  - `docs/operativa_ecommerce_local_simulado.md`;
  - `docs/roadmap_ecommerce_local_simulado.md`;
  - `scripts/bootstrap_ecommerce_local_simulado.py`;
  - `scripts/check_ecommerce_local_simulado.py`;
  - `frontend/package.json`;
  - `manage.py`, `requirements.txt`, `setup_entorno.bat` y `run_app.bat`.
- **Archivos tocados en esta ejecucion**:
  - `.env.example`
  - `scripts/check_entorno_local_ecommerce.py`
  - `tests/scripts/test_check_entorno_local_ecommerce.py`
  - `docs/checklist_entorno_local_ecommerce.md`
  - `docs/operativa_ecommerce_local_simulado.md`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Crear `.env.example` raiz porque no existia y el contrato local necesitaba variables backend sin secretos.
  2. Crear `scripts/check_entorno_local_ecommerce.py` como verificador de solo lectura, sin arrancar servidores ni conectarse a servicios externos.
  3. Mantener `BOTICA_PAYMENT_PROVIDER=simulado_local` como default recomendado y tratar `stripe` en entorno como warning, no modo local.
  4. Documentar comandos reales y marcar limites no verificados automaticos.
- **Checklist de cierre aplicada (ELS-037)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente el prompt 37.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se dockeriza, no se despliega, no se activa Stripe.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; entorno ejemplo, script/checklist, test de script y documentacion viva.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra como contrato local, no como go-live.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `python -m unittest tests.scripts.test_check_entorno_local_ecommerce` -> **OK**, 5 tests.
  - `python scripts/check_entorno_local_ecommerce.py` -> **OK**, 14 checks OK, 0 warnings, 0 blockers.
  - `python scripts/check_entorno_local_ecommerce.py --json` -> **OK**, salida JSON valida con 14 OK.
  - `python scripts/check_ecommerce_local_simulado.py` -> **OK**, 19 checks OK y 3 WARNING esperados por legacy/preseleccion controlada.
  - `.\setup_entorno.bat --check` -> **OK**, detecta `.venv`, `requirements.txt`, `npm` y `frontend/node_modules` sin instalar.
  - `.\run_app.bat --check` -> **OK**, detecta backend y frontend sin iniciar servidores.
  - `python scripts/bootstrap_ecommerce_local_simulado.py --help` -> **OK**, muestra `--dry-run` y `--json`.
  - `python -m unittest tests.scripts.test_check_ecommerce_local_simulado tests.scripts.test_audit_ecommerce_local_simulado` -> **OK**, 19 tests.
  - `git diff --check` -> **OK**; muestra avisos CRLF existentes del worktree.
  - busqueda de artefactos prohibidos versionables (`*.pyc`, `*.sqlite3`, `*.db`, `*.mo`, `*.zip`, `*.pdf`, `.tmp-tests`, `__pycache__`, `frontend/.next`) -> **OK**, sin coincidencias.
- **Evidencia de cierre**:
  - `.env.example` documenta variables backend locales sin secretos;
  - `docs/checklist_entorno_local_ecommerce.md` documenta instalacion, migraciones, bootstrap, arranque, compra local, gates, tests y troubleshooting;
  - `scripts/check_entorno_local_ecommerce.py` valida archivos/variables/scripts/checklist/proveedor sin servicios externos;
  - `tests/scripts/test_check_entorno_local_ecommerce.py` cubre el contrato.
- **Siguiente paso exacto**: ejecutar una prueba reproducible manual completa en una maquina limpia o worktree nuevo siguiendo `docs/checklist_entorno_local_ecommerce.md`, sin activar Stripe ni versionar bases locales.

## Entrada 2026-04-28-ELS-038 (mapa final de rutas)
- **Tarea seleccionada**: `ELS-038 - Mapa final de rutas`.
- **Estado final**: `DONE documental + guardrail`.
- **Objetivo de la ejecucion**: auditar y documentar rutas publicas, privadas, transaccionales, API, backoffice y legacy para evitar confusion entre flujo real, pago simulado y demo legacy.
- **Lectura de contexto realizada**:
  - estructura `frontend/app`;
  - rutas API frontend en `frontend/app/api`;
  - URLs backend publicas y backoffice;
  - `docs/roadmap_ecommerce_local_simulado.md`;
  - `docs/seo_contrato.json`;
  - tests de SEO/navegacion (`seo-contrato-regresion`, `shell-global`) y gate local.
- **Archivos tocados en esta ejecucion**:
  - `docs/mapa_rutas_ecommerce_local.md`
  - `scripts/check_ecommerce_local_simulado.py`
  - `tests/scripts/test_check_ecommerce_local_simulado.py`
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. No tocar rutas ni metadata: el contrato SEO existente ya cubre noindex transaccional y legacy.
  2. Documentar rutas comerciales nuevas como activas aunque parte de su estrategia SEO siga pendiente de contrato especifico.
  3. Mantener `/encargo` como warning controlado de consulta secundaria.
  4. Anadir guardrail de presencia/coherencia minima del mapa de rutas al gate local.
- **Checklist de cierre aplicada (ELS-038)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente el prompt 38.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; no se borran rutas ni se cambia routing.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; documentacion, gate y test de gate.
  9. Definido vs implementado validado con `docs/90`: **Si**; se registra como mapa/guardrail, no como cambio funcional.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `python -m unittest tests.scripts.test_check_ecommerce_local_simulado` -> **OK**, 14 tests.
  - `python scripts/check_ecommerce_local_simulado.py` -> **OK**, 20 checks OK y 3 WARNING esperados por legacy/preseleccion controlada.
  - `npm --prefix frontend run test:seo:contrato` -> **OK**, contrato SEO completo.
  - `npm --prefix frontend run test:shell` -> **OK**, 11 tests.
  - `git diff --check` -> **OK**; muestra avisos CRLF existentes del worktree.
  - eliminacion de `frontend/.tmp-tests` generado por tests frontend -> **OK**.
  - busqueda de artefactos prohibidos versionables (`*.pyc`, `*.sqlite3`, `*.db`, `*.mo`, `*.zip`, `*.pdf`, `.tmp-tests`, `__pycache__`, `frontend/.next`) -> **OK**, sin coincidencias.
- **Evidencia de cierre**:
  - `docs/mapa_rutas_ecommerce_local.md` clasifica rutas por estado, indexacion, flujo, proteccion y CTA;
  - el gate local bloquea ausencia del mapa;
  - no se detectaron CTAs principales nuevos hacia legacy durante la auditoria.
- **Siguiente paso exacto**: cerrar la estrategia SEO de las secciones comerciales nuevas (`/botica-natural`, `/velas-e-incienso`, `/minerales-y-energia`, `/herramientas-esotericas`) en el contrato SEO si se decide indexarlas.

## Entrada 2026-04-28-ELS-039 (cierre roadmap local simulado)
- **Tarea seleccionada**: `ELS-039 - Cierre roadmap local simulado`.
- **Estado final**: `DONE documental`.
- **Objetivo de la ejecucion**: cerrar documentalmente el roadmap de ecommerce local simulado, evaluar evidencias de hitos principales y separar proximos hitos sin mezclarlos con go-live real.
- **Lectura de contexto realizada**:
  - `docs/roadmap_ecommerce_local_simulado.md`;
  - `docs/90_estado_implementacion.md`;
  - `docs/auditoria_final_ecommerce_local_simulado.md`;
  - `docs/checklist_presentacion_ecommerce_local.md`;
  - `docs/deuda_residual_ecommerce_local.md`;
  - gates locales `scripts/check_ecommerce_local_simulado.py` y `scripts/audit_ecommerce_local_simulado.py`.
- **Archivos tocados en esta ejecucion**:
  - `docs/roadmap_ecommerce_local_simulado.md`
  - `docs/90_estado_implementacion.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Cerrar el roadmap local como `CERRADO_LOCALMENTE`, no como produccion lista.
  2. Clasificar `ELS-01` a `ELS-38` como `DONE` o `DONE documental`, sin hitos `PARTIAL`, `BLOCKED` ni `NOT_STARTED` dentro del roadmap local.
  3. Mantener los warnings del gate como deuda aceptada: legacy visible controlado, `/encargo` como consulta secundaria y preseleccion heredada `encargoConsulta`.
  4. Separar los proximos hitos (`staging`, Stripe sandbox, E2E browser real, revision legal, backup/restore, `V2-R10`, retirada fisica legacy) fuera del cierre local.
- **Checklist de cierre aplicada (ELS-039)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente el prompt 39.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; solo documentacion/estado, sin codigo funcional.
  4. Evidencia verificable registrada: **Si**; gate local y auditoria final ejecutados.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md` y `docs/roadmap_ecommerce_local_simulado.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**; solo documentos de estado/cierre.
  9. Definido vs implementado validado con `docs/90`: **Si**; cierre local separado de go-live y `V2-R10`.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `python scripts/check_ecommerce_local_simulado.py` -> **OK**, 20 checks OK y 3 WARNING esperados por legacy/preseleccion controlada.
  - `python scripts/audit_ecommerce_local_simulado.py` -> **OK**, 5 resultados OK y 1 WARNING agregado del gate local; sin `BLOCKER`.
  - `git diff --check` -> **OK**; muestra avisos CRLF existentes del worktree.
  - busqueda de artefactos prohibidos versionables (`*.pyc`, `*.sqlite3`, `*.db`, `*.mo`, `*.zip`, `*.pdf`, `.tmp-tests`, `__pycache__`, `frontend/.next`) -> **OK**, sin coincidencias.
- **Evidencia de cierre**:
  - `docs/roadmap_ecommerce_local_simulado.md` registra `CERRADO_LOCALMENTE`, matriz final y proximos hitos fuera del roadmap;
  - `docs/90_estado_implementacion.md` registra ELS-039, flujo vigente, legacy deprecado, pago `simulado_local`, Stripe reservado y `V2-R10` bloqueado;
  - la auditoria final mantiene el proyecto presentable como local/portfolio, no como produccion real.
- **Siguiente paso exacto**: abrir una fase separada para staging futuro o para E2E browser real, sin activar Stripe ni cerrar `V2-R10`.

## Entrada 2026-04-28-ELS-040 (auditoria de merge final)
- **Tarea seleccionada**: `ELS-040 - Auditoria de merge final`.
- **Estado final**: `DONE`.
- **Dictamen**: `MERGEABLE_WITH_WARNINGS`.
- **Objetivo de la ejecucion**: revisar el resultado completo del roadmap ecommerce local simulado antes de merge/revision final, sin implementar nuevas fases ni activar Stripe.
- **Lectura de contexto realizada**:
  - diff completo por `git status --short`, `git diff --stat`, `git diff --numstat` y `git diff --name-only`;
  - `docs/roadmap_ecommerce_local_simulado.md`;
  - `docs/90_estado_implementacion.md`;
  - `docs/auditoria_final_ecommerce_local_simulado.md`;
  - `docs/checklist_presentacion_ecommerce_local.md`;
  - `docs/mapa_rutas_ecommerce_local.md`;
  - scripts/gates y tests modificados.
- **Archivos tocados en esta ejecucion**:
  - `tests/scripts/test_audit_ecommerce_local_simulado.py`
  - `docs/pagos_modo_local_y_stripe.md`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Corregir como fix menor imprescindible el fixture valido de auditoria para incluir `docs/mapa_rutas_ecommerce_local.md`, exigido por el gate vigente.
  2. Reemplazar placeholders Stripe `pk_...`, `sk_...` y `whsec_...` por marcadores angulares para reducir falsos positivos de secreto.
  3. Mantener dictamen con warnings porque quedan legacy controlado, `encargoConsulta` como deuda transitoria y ausencia deliberada de staging/E2E/go-live.
- **Checklist de cierre aplicada (ELS-040)**:
  1. Tarea correcta confirmada: **Si**; el usuario pidio explicitamente el prompt 40.
  2. Una sola tarea ejecutada: **Si**.
  3. Alcance respetado sin sobrealcance: **Si**; solo auditoria y fixes menores de contrato/documentacion.
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si** (`docs/roadmap_codex.md`).
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si**.
  9. Definido vs implementado validado con `docs/90`: **Si**; el cierre local no se confunde con produccion ni `V2-R10`.
  10. Siguiente paso exacto definido: **Si**.
- **Checks ejecutados**:
  - `git status --short` -> **OK**, diff amplio revisable; sin binarios prohibidos en status.
  - `git diff --stat` / `git diff --numstat` / `git diff --name-only` -> **OK**, diff auditado.
  - busqueda de binarios/artefactos prohibidos en status -> **OK**, sin coincidencias.
  - busqueda de migraciones en status -> **OK**, sin coincidencias.
  - `python manage.py check` -> **OK**.
  - tests backend criticos (`python manage.py test ...`) -> **OK**, 139 tests.
  - `npm --prefix frontend run lint` -> **OK**.
  - tests frontend criticos (`test:cesta`, `test:checkout-real`, `test:compra-local`, `test:cuenta-cliente`, `test:botica-natural`, `test:shell`, `test:legal`, `test:seo:contrato`, `test:analitica-local`) -> **OK**.
  - tests de scripts puros -> **OK**, 25 tests tras corregir fixture.
  - test bootstrap Django -> **OK**, 4 tests.
  - `npm --prefix frontend run build` -> **OK**; genera warnings de fetch local esperados cuando backend no esta levantado.
  - `python scripts/check_ecommerce_local_simulado.py` -> **OK**, 20 OK y 3 WARNING esperados.
  - `python scripts/audit_ecommerce_local_simulado.py` -> **OK**, 5 OK y 1 WARNING agregado.
  - `git diff --check` -> **OK**; avisos CRLF existentes.
- **Warnings aceptados**:
  1. legacy demo visible documentado y planificado para retirada posterior;
  2. `/encargo` enlazado como consulta secundaria;
  3. `FlujoCheckoutReal` reutiliza `encargoConsulta` como adaptador transitorio;
  4. no hay staging, E2E browser real, backup/restore real ni revision legal profesional;
  5. `V2-R10` sigue bloqueado.
- **Blockers**: ninguno detectado.
- **Siguiente paso exacto**: preparar PR/merge review con dictamen `MERGEABLE_WITH_WARNINGS` y abrir rama separada para staging o E2E browser real.
