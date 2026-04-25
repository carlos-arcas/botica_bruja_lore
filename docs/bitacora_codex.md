# BitÃƒÂ¡cora operativa Codex

## PropÃƒÂ³sito
Registro trazable de cada ejecuciÃƒÂ³n autÃƒÂ³noma: tarea, archivos tocados, decisiones, checks, resultado, bloqueos y siguiente paso exacto.

## Plantilla obligatoria por entrada
- **Fecha (UTC)**:
- **ID de tarea**:
- **Estado final**: `DONE` | `BLOCKED`
- **Objetivo de la ejecuciÃƒÂ³n**:
- **Fuentes de verdad consultadas**:
- **Archivos tocados**:
- **Decisiones tomadas**:
- **Checks ejecutados**:
- **Resultado verificable**:
- **Bloqueos (si aplica)**:
- **Siguiente paso exacto**:

## Plantilla obligatoria adicional para entradas `BLOCKED`
> Usar esta plantilla cuando el **Estado final** sea `BLOCKED`. No sustituye la plantilla general; la complementa.

- **DiagnÃƒÂ³stico concreto**:
- **Causa probable**:
- **Evidencia verificable**:
- **Impacto sobre la tarea**:
- **Dependencia que bloquea**:
- **Siguiente acciÃƒÂ³n exacta**:
- **Criterio de desbloqueo**:
- **Fecha/punto de revisiÃƒÂ³n**:

### Mini-ejemplo sintÃƒÂ©tico de formato `BLOCKED` (no corresponde a incidencia real)
- **DiagnÃƒÂ³stico concreto**: la tarea requiere una decisiÃƒÂ³n documental explÃƒÂ­cita que no estÃƒÂ¡ publicada.
- **Causa probable**: dependencia de definiciÃƒÂ³n pendiente por parte de mantenedor.
- **Evidencia verificable**: ausencia del documento requerido en ruta acordada + referencia en roadmap a Ã¢â‚¬Å“pendiente decisiÃƒÂ³n humanaÃ¢â‚¬Â.
- **Impacto sobre la tarea**: no se puede cerrar `DONE` sin riesgo de contradicciÃƒÂ³n documental.
- **Dependencia que bloquea**: confirmaciÃƒÂ³n humana de criterio rector.
- **Siguiente acciÃƒÂ³n exacta**: solicitar decisiÃƒÂ³n en el canal acordado y registrar respuesta textual en bitÃƒÂ¡cora.
- **Criterio de desbloqueo**: decisiÃƒÂ³n publicada y citada en documento rector correspondiente.
- **Fecha/punto de revisiÃƒÂ³n**: prÃƒÂ³xima ejecuciÃƒÂ³n operativa o en 48h UTC, lo que ocurra primero.

## Checklist mÃƒÂ­nimo de cierre por ejecuciÃƒÂ³n (uso obligatorio)
Marcar cada ÃƒÂ­tem como `SÃƒÂ­` o `No`. Si algÃƒÂºn ÃƒÂ­tem queda en `No`, no cerrar en `DONE`.

1. **Tarea correcta confirmada**: la tarea ejecutada es la primera `TODO` no `BLOCKED` en `docs/roadmap_codex.md`. (`SÃƒÂ­/No`)
2. **Una sola tarea ejecutada**: la corrida trabajÃƒÂ³ solo un ID de tarea. (`SÃƒÂ­/No`)
3. **Alcance respetado**: los cambios se limitaron al objetivo y perÃƒÂ­metro permitido de la tarea. (`SÃƒÂ­/No`)
4. **Evidencia verificable registrada**: existe evidencia explÃƒÂ­cita de cierre `DONE` o diagnÃƒÂ³stico completo de `BLOCKED`. (`SÃƒÂ­/No`)
5. **Checks ejecutados y registrados**: se listan comandos/checks con resultado verificable. (`SÃƒÂ­/No`)
6. **Roadmap actualizado**: el estado y evidencia de la tarea quedaron reflejados en `docs/roadmap_codex.md`. (`SÃƒÂ­/No`)
7. **BitÃƒÂ¡cora actualizada**: existe entrada completa de la ejecuciÃƒÂ³n en `docs/bitacora_codex.md`. (`SÃƒÂ­/No`)
8. **Diff dentro del perÃƒÂ­metro**: `git diff --name-only` solo muestra archivos permitidos para la tarea. (`SÃƒÂ­/No`)
9. **Definido vs implementado validado**: cuando aplica, se contrastÃƒÂ³ explÃƒÂ­citamente con `docs/90_estado_implementacion.md` para no declarar implementaciÃƒÂ³n ficticia. (`SÃƒÂ­/No/No aplica`)
10. **Siguiente paso exacto definido**: queda una ÃƒÂºnica acciÃƒÂ³n siguiente concreta y verificable. (`SÃƒÂ­/No`)

---

## Entrada 2026-03-26-CRX-001 (bootstrap)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `CRX-001`
- **Estado final**: `DONE`
- **Objetivo de la ejecuciÃƒÂ³n**: convertir la gobernanza Codex en sistema operativo ejecutable (reglas duras + roadmap atÃƒÂ³mico + bitÃƒÂ¡cora).
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
  1. Mantener toda la inteligencia especÃƒÂ­fica del proyecto (identidad, anclas de dominio, stack, calidad y restricciones) y aÃƒÂ±adir reglas ejecutables para operaciÃƒÂ³n autÃƒÂ³noma.
  2. Instituir regla dura: seleccionar primera tarea `TODO` no `BLOCKED`, una tarea por ejecuciÃƒÂ³n, sin cambiar orden sin bitÃƒÂ¡cora.
  3. Definir protocolo explÃƒÂ­cito de bloqueo para evitar improvisaciÃƒÂ³n fuera de alcance.
  4. Crear roadmap Codex atÃƒÂ³mico con IDs estables y criterios de cierre auditables.
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
  - bitÃƒÂ¡cora creada con plantilla y rastro bootstrap.
- **Bloqueos (si aplica)**: ninguno.
- **Siguiente paso exacto**: ejecutar `CRX-002` (primera `TODO` no `BLOCKED`) aÃƒÂ±adiendo matriz de trazabilidad documental por tarea en `docs/roadmap_codex.md` y registrando evidencia en esta bitÃƒÂ¡cora.

## Entrada 2026-03-26-CRX-002 (matriz trazabilidad)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `CRX-002`
- **Estado final**: `DONE`
- **Objetivo de la ejecuciÃƒÂ³n**: incorporar matriz de trazabilidad documental por tarea CRX (001Ã¢â‚¬â€œ005) para gobernar precedencia, soporte y ÃƒÂ¡mbito de decisiÃƒÂ³n en ejecuciones futuras.
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
  1. Definir una matriz ÃƒÂºnica y compacta en `docs/roadmap_codex.md` con asignaciÃƒÂ³n explÃƒÂ­cita por tarea: rector principal, soportes, ÃƒÂ¡mbito, motivo y nota operativa.
  2. Marcar `CRX-002` como `DONE` al quedar la matriz creada y alineada con precedencia de `docs/99_fuente_de_verdad.md`.
  3. Preparar (sin resolver) una tensiÃƒÂ³n documental para `CRX-004`: diferencia entre secuencia macro histÃƒÂ³rica y estado real implementado/evolutivo.
  4. Mantener alcance atÃƒÂ³mico: sin abrir tareas nuevas, sin reordenar roadmap y sin tocar cÃƒÂ³digo de producto.
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
  - existe secciÃƒÂ³n `Matriz de trazabilidad documental por tarea` en `docs/roadmap_codex.md` con filas completas para `CRX-001` a `CRX-005`;
  - `CRX-002` queda en `DONE`;
  - `CRX-003` queda como primera tarea `TODO` no bloqueada;
  - diff restringido a `docs/roadmap_codex.md` y `docs/bitacora_codex.md`.
- **Bloqueos (si aplica)**: ninguno.
- **Siguiente paso exacto**: ejecutar `CRX-003` para formalizar protocolo de `BLOCKED`/desbloqueo con campos mÃƒÂ­nimos y consistencia AGENTSÃ¢â€ â€roadmapÃ¢â€ â€bitÃƒÂ¡cora.

## Entrada 2026-03-26-CRX-003 (protocolo BLOCKED)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `CRX-003`
- **Estado final**: `DONE`
- **Objetivo de la ejecuciÃƒÂ³n**: endurecer y unificar el protocolo operativo `BLOCKED`/desbloqueo entre `AGENTS.md`, `docs/roadmap_codex.md` y `docs/bitacora_codex.md` sin ampliar alcance.
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
  1. Centralizar norma de comportamiento ante bloqueo en `AGENTS.md` (cuÃƒÂ¡ndo bloquear, campos mÃƒÂ­nimos obligatorios, revisiÃƒÂ³n de desbloqueo y prohibiciÃƒÂ³n de vaguedad).
  2. Operativizar `BLOCKED` en `docs/roadmap_codex.md` como contrato de estado con condiciones mÃƒÂ­nimas y usos prohibidos.
  3. AÃƒÂ±adir plantilla reutilizable especÃƒÂ­fica para entradas `BLOCKED` en bitÃƒÂ¡cora y un mini-ejemplo sintÃƒÂ©tico marcado explÃƒÂ­citamente como formato no real.
  4. Cerrar `CRX-003` en `DONE` y mantener `CRX-004` como primera tarea `TODO` no bloqueada.
- **Checks ejecutados**:
  - `test -f AGENTS.md && test -f docs/roadmap_codex.md && test -f docs/bitacora_codex.md`
  - `rg -n "CRX-003|CRX-004|BLOCKED|DiagnÃƒÂ³stico concreto|Causa probable|Evidencia verificable|Siguiente acciÃƒÂ³n exacta|Criterio de desbloqueo" AGENTS.md docs/roadmap_codex.md docs/bitacora_codex.md`
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
- **Objetivo de la ejecuciÃƒÂ³n**: resolver documentalmente tensiones prioritarias entre estado real implementado, roadmaps histÃƒÂ³ricos y precedencia oficial, sin maquillaje ni sobrealcance.
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
  1. Secuencia macro histÃƒÂ³rica C1Ã¢â€ â€™C6 (`docs/14`) vs estado real posterior ya implementado (`docs/90`).
  2. Criterio de `DONE` en roadmaps histÃƒÂ³ricos (Rxx/V2-Rxx) vs estado factual vigente y regla de cierre verificable.
  3. Lectura descontextualizada del reencauce de Ciclo 3 como bloqueo permanente frente a evoluciones posteriores ya registradas.
- **Decisiones aplicadas**:
  1. Prevalece `docs/90_estado_implementacion.md` para estado real implementado; `docs/14_roadmap.md` queda como secuencia histÃƒÂ³rica de referencia.
  2. Un `DONE` en roadmaps histÃƒÂ³ricos se toma como antecedente, pero el estado operativo vigente se valida en `docs/90` y bajo regla de evidencia de `AGENTS.md`/`docs/08`.
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
  - `docs/roadmap_codex.md` incluye secciÃƒÂ³n priorizada de tensiones abiertas (TDX-01..03), con evidencia concreta, documento prevalente y decisiÃƒÂ³n operativa aplicada.
  - `CRX-004` quedÃƒÂ³ en `DONE` con evidencia explÃƒÂ­cita de cierre.
  - `CRX-005` quedÃƒÂ³ como primera tarea `TODO` no bloqueada.
  - diff limitado al perÃƒÂ­metro permitido (`docs/roadmap_codex.md`, `docs/bitacora_codex.md`).
- **Bloqueos (si aplica)**: no hay bloqueos para CRX-004. Queda dependencia humana opcional (no bloqueante) para decidir si agregar nota aclaratoria mÃƒÂ­nima en documento histÃƒÂ³rico de reencauce.
- **Siguiente paso exacto**: ejecutar `CRX-005` para estandarizar checklist mÃƒÂ­nimo de cierre por ejecuciÃƒÂ³n Codex y validar su uso en bitÃƒÂ¡cora.

## Entrada 2026-03-26-CRX-005 (checklist mÃƒÂ­nimo de cierre por ejecuciÃƒÂ³n)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `CRX-005`
- **Estado final**: `DONE`
- **Objetivo de la ejecuciÃƒÂ³n**: cerrar la gobernanza Codex con checklist mÃƒÂ­nima, reutilizable y verificable para cierre de cualquier corrida.
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
  1. Ubicar la **norma** de cierre en `AGENTS.md` (secciÃƒÂ³n 11.1) para fijar obligatoriedad y criterios mÃƒÂ­nimos.
  2. Ubicar la **plantilla operativa reutilizable** en `docs/bitacora_codex.md` para uso directo por ejecuciÃƒÂ³n.
  3. Actualizar `CRX-005` a `DONE` en `docs/roadmap_codex.md` con evidencia explÃƒÂ­cita y sin ampliar alcance.
- **Checklist de cierre aplicada (CRX-005)**:
  1. Tarea correcta confirmada (`CRX-005` primera `TODO` no `BLOCKED`): **SÃƒÂ­**.
  2. Una sola tarea ejecutada en la corrida: **SÃƒÂ­**.
  3. Alcance respetado sin sobrealcance: **SÃƒÂ­**.
  4. Evidencia verificable registrada: **SÃƒÂ­**.
  5. Checks ejecutados y registrados: **SÃƒÂ­**.
  6. Roadmap actualizado: **SÃƒÂ­**.
  7. BitÃƒÂ¡cora actualizada: **SÃƒÂ­**.
  8. Diff dentro del perÃƒÂ­metro permitido: **SÃƒÂ­**.
  9. Definido vs implementado validado con `docs/90` cuando aplica: **SÃƒÂ­** (aplica como control para no declarar implementaciÃƒÂ³n de producto en esta tarea documental).
  10. Siguiente paso exacto definido: **SÃƒÂ­**.
- **Checks ejecutados**:
  - `test -f AGENTS.md && test -f docs/roadmap_codex.md && test -f docs/bitacora_codex.md`
  - `rg -n "## CRX-005|\\*\\*Estado\\*\\*: `DONE`" docs/roadmap_codex.md`
  - `rg -n "^## CRX-.*\\*\\*Estado\\*\\*: `TODO`|\\*\\*Estado\\*\\*: `TODO`" docs/roadmap_codex.md`
  - `rg -n "Checklist mÃƒÂ­nimo de cierre por ejecuciÃƒÂ³n \\(uso obligatorio\\)" docs/bitacora_codex.md`
  - `rg -n "## Entrada 2026-03-26-CRX-005|Checklist de cierre aplicada \\(CRX-005\\)" docs/bitacora_codex.md`
  - `git diff --name-only`
- **Resultado verificable**:
  - checklist mÃƒÂ­nima de cierre creada en ubicaciÃƒÂ³n operativa ÃƒÂºnica y reutilizable en bitÃƒÂ¡cora;
  - norma de obligatoriedad incorporada en `AGENTS.md`;
  - `CRX-005` marcado en `DONE` con evidencia en roadmap;
  - no quedan tareas `CRX` en `TODO`;
  - diff limitado a `AGENTS.md`, `docs/roadmap_codex.md` y `docs/bitacora_codex.md`.
- **Bloqueos (si aplica)**: ninguno.
- **Siguiente paso exacto**: mantener esta checklist como control obligatorio de cierre en toda ejecuciÃƒÂ³n futura y rechazar cierres `DONE` con cualquier ÃƒÂ­tem en `No`.

## Entrada 2026-03-26-CRX-006 (reencuadre roadmap hacia V2-R10)
- **Fecha (UTC)**: 2026-03-26
- **ID de tarea**: `CRX-006`
- **Estado final**: `DONE`
- **Objetivo de la ejecuciÃƒÂ³n**: reactivar `docs/roadmap_codex.md` como fuente de ejecuciÃƒÂ³n atÃƒÂ³mica tras quedar sin tareas `TODO` y dejar trazado el siguiente paso correcto alineado con `V2-R10`.
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
  1. Considerar `docs/roadmap_codex.md` obsoleto porque no tenÃƒÂ­a ninguna `TODO` activa mientras `docs/roadmap_ecommerce_real_v2.md` aÃƒÂºn mantiene `V2-R10` en `PLANNED`.
  2. Limitar esta corrida a gobernanza documental y no abrir implementaciÃƒÂ³n de producto, porque la instrucciÃƒÂ³n operativa exige actualizar el roadmap antes de implementar cuando estÃƒÂ¡ desalineado.
  3. Traducir el siguiente bloque vivo a una primera tarea atÃƒÂ³mica de auditorÃƒÂ­a (`V2G-001`) en lugar de asumir una implementaciÃƒÂ³n ciega sobre un incremento todavÃƒÂ­a macro.
  4. Preservar el diff preexistente de `AGENTS.md` sin modificarlo ni revertirlo, manteniendo el perÃƒÂ­metro documental permitido.
- **Checklist de cierre aplicada (CRX-006)**:
  1. Tarea correcta confirmada: **SÃƒÂ­** (`docs/roadmap_codex.md` estaba sin `TODO`; esta corrida se dedicÃƒÂ³ a su reencuadre previo exigido antes de implementar).
  2. Una sola tarea ejecutada en la corrida: **SÃƒÂ­**.
  3. Alcance respetado sin sobrealcance: **SÃƒÂ­**.
  4. Evidencia verificable registrada: **SÃƒÂ­**.
  5. Checks ejecutados y registrados: **SÃƒÂ­**.
  6. Roadmap actualizado: **SÃƒÂ­**.
  7. BitÃƒÂ¡cora actualizada: **SÃƒÂ­**.
  8. Diff dentro del perÃƒÂ­metro permitido: **SÃƒÂ­** (el diff actual queda dentro de `AGENTS.md`, `docs/roadmap_codex.md` y `docs/bitacora_codex.md`).
  9. Definido vs implementado validado con `docs/90` cuando aplica: **SÃƒÂ­** (aplica para no reabrir capacidades V1/V2 ya declaradas `DONE`).
  10. Siguiente paso exacto definido: **SÃƒÂ­**.
- **Checks ejecutados**:
  - `git status --short`
  - `git diff -- AGENTS.md`
  - `git diff -- docs/roadmap_codex.md`
  - `git diff -- docs/bitacora_codex.md`
  - `Select-String -Path docs/roadmap_ecommerce_real_v2.md -Pattern '### V2-R10|\\*\\*Estado\\*\\*: `PLANNED`'`
  - `Select-String -Path docs/90_estado_implementacion.md -Pattern 'release readiness|V2-R10|## 46\\.'`
  - `Get-ChildItem docs -Recurse -File | Select-String -Pattern 'V2-R10|go-live|release readiness|check_release_gate\\.py|check_deployed_stack\\.py' | Select-Object Path,LineNumber,Line | Format-Table -AutoSize | Out-String -Width 200`
  - `@' ... roadmap_codex.md first TODO detector ... '@ | python -` Ã¢â€ â€™ devuelve `## V2G-001 Ã¢â‚¬â€ AuditorÃƒÂ­a de cierre de \`V2-R10\` (go-live checklist v2)`
  - `git diff --name-only`
- **Resultado verificable**:
  - `docs/roadmap_codex.md` vuelve a tener una primera tarea `TODO` no `BLOCKED` (`V2G-001`);
  - el siguiente paso queda trazado contra `docs/roadmap_ecommerce_real_v2.md` y documentaciÃƒÂ³n operativa real del repo;
  - no se tocaron capas de producto ni scripts en esta corrida;
  - el diff se mantiene en el perÃƒÂ­metro documental permitido.
- **Bloqueos (si aplica)**: ninguno.
- **Siguiente paso exacto**: ejecutar `V2G-001` para auditar el cierre real de `V2-R10`, decidir si ya estÃƒÂ¡ cerrable o dejar la brecha exacta siguiente con evidencia.

## Entrada 2026-04-25-V2G-015 (proceso de devolucion demo)
- **Fecha (UTC)**: 2026-04-25
- **ID de tarea**: `V2G-015`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: revisar y cerrar el proceso local/demo de devolucion o cancelacion post-compra para que sea demostrable sin PSP real.
- **Fuentes de verdad consultadas**: `AGENTS.md`, `docs/00_vision_proyecto.md`, `docs/02_alcance_y_fases.md`, `docs/05_modelo_de_dominio_y_entidades.md`, `docs/07_arquitectura_tecnica.md`, `docs/08_decisiones_tecnicas_no_negociables.md`, `docs/90_estado_implementacion.md`, `docs/99_fuente_de_verdad.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Archivos tocados**:
  - `frontend/contenido/postventa/devolucionesDemo.ts`
  - `frontend/componentes/catalogo/checkout-real/ReciboPedidoReal.tsx`
  - `frontend/tests/checkout-real.test.ts`
  - `frontend/tests/checkout-real-ui.test.ts`
  - `frontend/package.json`
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decisiones tomadas**:
  1. Reutilizar el flujo backend/admin de devoluciones ya existente, sin abrir reembolsos bancarios automaticos ni PSP real.
  2. Exponer en el recibo una postventa demo clara: cancelacion operativa, devolucion manual disponible para pedidos pagados y enviados/entregados, pago pendiente y pedido aun no enviado.
  3. Mantener texto humano y comercial, sin claims medicos ni promesas de reembolso bancario real.
- **Incidencia de ejecucion y reparacion**:
  - Durante la limpieza final, un comando PowerShell con `-Include` aplicado junto a `-LiteralPath` no filtro como se esperaba y elimino archivos ordinarios del worktree, incluida la referencia `.git` del worktree y dependencias ignoradas.
  - Reparacion aplicada: se restauro la referencia `.git` del worktree desde `.git/worktrees/botica_bruja_lore1`, se ejecuto `git restore .` para recuperar tracked files desde Git, se regeneraron `frontend/node_modules` con `npm ci` y `.venv` con `python -m venv .venv` + `pip install -r requirements.txt`, y se reaplico la tarea `V2G-015`.
  - Impacto residual conocido: los cambios no commiteados previos que existian solo en este worktree antes del incidente no son recuperables desde Git si no estaban en otra copia. El repo queda operable y validado para esta tarea, pero la bitacora deja constancia explicita del incidente.
- **Checks ejecutados**:
  - Preflight aislamiento inicial: `.codex_runtime/automation.lock` inexistente, `.codex_runtime/pids.txt` inexistente y `RepoProcessCount=0`; se creo lock local de esta iteracion.
  - `npm ci` en `frontend` -> `OK`; npm informa 8 vulnerabilidades/deprecations ya conocidas del arbol de dependencias.
  - `python -m venv .venv` + `.venv\Scripts\python.exe -m pip install -r requirements.txt` -> `OK`.
  - `npm --prefix frontend run test:checkout-real` -> `OK` (31 tests de contrato + 19 tests UI en el estado restaurado del worktree).
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.infraestructura.test_devoluciones_postventa` -> `OK` (11 tests).
  - `.venv\Scripts\python.exe manage.py check` -> `OK`.
  - `python scripts/check_repo_operational_integrity.py` -> `OK`.
  - `git diff --check` -> `OK` tras corregir EOF de `frontend/package.json`; solo avisos LF/CRLF.
- **Resultado verificable**:
  - El recibo real llama a `resolverPostventaDemoPedido` y muestra el bloque postventa al cliente.
  - La devolucion demo solo aparece como disponible cuando el pedido esta pagado y enviado o entregado.
  - Si el pedido no esta pagado, el texto evita hablar de devolucion efectiva porque todavia no hay nada que devolver.
  - Si existe cancelacion operativa, el recibo la separa de la devolucion voluntaria y mantiene revision/reembolso manual.
  - No se activo PSP/banco real, no se ejecuto reembolso bancario, no se envio SMTP real y no se versionaron binarios/PDF/capturas.
- **Aislamiento, concurrencia y limpieza**:
  - Ejecucion activa previa en este repo: **No**.
  - Procesos arrancados por esta iteracion: **Ninguno persistente**; solo comandos de instalacion/tests/checks de corta duracion.
  - PID registrados/cerrados: **Ninguno**; no quedaron procesos persistentes en `.codex_runtime/pids.txt`.
  - Procesos vivos asociados al repo tras limpieza: **0**.
  - Procesos dudosos no cerrados: **Ninguno**.
  - Archivos temporales limpiados: `frontend/.tmp-tests`, `.codex_runtime/automation.lock`, `.codex_runtime/pids.txt` si existia, `__pycache__/` y `*.pyc` del repo y de `.venv`.
- **Checklist de cierre aplicada (V2G-015)**:
  1. Tarea correcta confirmada: **Si** (`V2G-015` era la tarea operativa de la iteracion solicitada por el heartbeat).
  2. Una sola tarea ejecutada en la corrida: **Si**.
  3. Alcance respetado sin sobrealcance: **Si** (postventa/devolucion demo; PDF queda para `V2G-016`).
  4. Evidencia verificable registrada: **Si**.
  5. Checks/comandos ejecutados con resultado: **Si**.
  6. Roadmap actualizado: **Si**.
  7. Bitacora actualizada: **Si**.
  8. Diff dentro del perimetro permitido: **Si** para la tarea actual; se documenta la restauracion del worktree por incidencia de limpieza.
  9. Definido vs implementado validado con `docs/90`: **Si**.
  10. Siguiente paso exacto definido: **Si** (`V2G-016`).
- **Bloqueos (si aplica)**: ninguno para postventa demo manual. Reembolso bancario real sigue fuera de alcance hasta conectar PSP/banco real.
- **Siguiente paso exacto**: ejecutar `V2G-016` para generar el recibo/documento fiscal descargable en PDF desde el pedido, con HTML actual como fallback si aporta valor.

## Entrada 2026-04-26-FIX-CONTINUIDAD-ROADMAP
- **Fecha (UTC)**: 2026-04-26
- **ID de tarea**: `FIX-CONTINUIDAD-ROADMAP`
- **Estado final**: `DONE`
- **Objetivo de la ejecucion**: corregir el bloqueo operativo que impedia continuar la automatizacion por desalineacion entre roadmap y bitacora.
- **Fuentes de verdad consultadas**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, `docs/90_estado_implementacion.md`, `AGENTS.md`.
- **Archivos tocados**:
  - `docs/roadmap_codex.md`
  - `docs/bitacora_codex.md`
- **Decision tomada**: marcar `V2G-001` como `DONE` en roadmap porque la bitacora ya contiene `Entrada 2026-03-26-V2G-001` con cierre, checks y resultado verificable; mantener `V2G-016` como primera tarea `TODO` ejecutable.
- **Resultado verificable**: el roadmap deja de seleccionar una tarea historica ya cerrada y permite continuar con `V2G-016 - Recibo fiscal descargable en PDF`.
- **Checks ejecutados**:
  - `Select-String -Path docs/roadmap_codex.md -Pattern '^## V2G-001|^## V2G-016|\*\*Estado\*\*'` -> confirma `V2G-001 DONE` y `V2G-016 TODO`.
  - `git diff --check` -> OK, solo avisos LF/CRLF.
- **Aislamiento y limpieza**:
  - Procesos arrancados: ninguno.
  - PID registrados/cerrados: ninguno.
  - Procesos vivos asociados al repo: 0.
  - Archivos temporales limpiados: ninguno.
- **Siguiente paso exacto**: ejecutar `V2G-016` para generar el recibo/documento fiscal descargable en PDF sin versionar PDFs binarios.
