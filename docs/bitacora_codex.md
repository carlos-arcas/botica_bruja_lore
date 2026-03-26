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
