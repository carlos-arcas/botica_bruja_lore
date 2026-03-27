# Roadmap operativo Codex (fuente de ejecución atómica)

## Reglas de uso obligatorias
1. Este archivo gobierna la ejecución autónoma diaria de Codex en este repo.
2. Codex debe seleccionar siempre la **primera tarea `TODO` no `BLOCKED`**.
3. Se ejecuta **una sola tarea por corrida**.
4. Está prohibido cambiar el orden sin justificarlo en `docs/bitacora_codex.md`.
5. No se marca `DONE` sin evidencia verificable y checks registrados.
6. Si no existe ninguna `TODO` no `BLOCKED`, el estado canónico es `cola vacía` o `backlog totalmente bloqueado`; queda prohibido abrir una cola paralela.

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

### Contrato operativo de cola vacía o backlog totalmente bloqueado
1. **Cola ejecutable vacía**: no existe ninguna tarea `TODO` no `BLOCKED` en este archivo.
2. **Backlog totalmente bloqueado**: existe trabajo restante, pero toda tarea activa está en `BLOCKED` con criterio de desbloqueo aún incumplido.
3. En ambos casos, el roadmap debe dejar un radar con diagnóstico, verificación del desbloqueo y siguiente acción exacta.
4. Cualquier tarea extraordinaria pedida explícitamente por el mantenedor se registra en este mismo roadmap y en la misma bitácora; no se crea un sistema paralelo.

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
| `CRX-007` | Bootstrap contrato 1 | `docs/99_fuente_de_verdad.md` | `docs/90_estado_implementacion.md`, `AGENTS.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, `docs/release_readiness_minima.md`, `scripts/check_release_gate.py`, `scripts/check_release_readiness.py`, `scripts/check_repo_operational_integrity.py` | saneamiento contractual para automations seguras, cola vacía honesta y trazabilidad de readiness | La fuente factual superior (`docs/90`) y la gobernanza operativa deben quedar autoconsistentes antes de seguir automatizando sobre una cola hoy vacía/bloqueada. | Cierre válido solo si no se crean sistemas paralelos, la bitácora queda explícitamente append-only y el bloqueo externo vigente sigue trazado con checks reales. |
| `V2G-001` | Auditoría cierre go-live v2 | `docs/roadmap_ecommerce_real_v2.md` | `docs/release_readiness_minima.md`, `docs/13_testing_ci_y_quality_gate.md`, `docs/deploy_railway.md`, `docs/90_estado_implementacion.md`, `scripts/check_release_gate.py`, `scripts/check_release_readiness.py`, `scripts/check_deployed_stack.py`, `scripts/backup_restore_postgres.py`, `tests/scripts/` | auditoría de cierre y brecha real del incremento `V2-R10` | `V2-R10` está `PLANNED`, pero no desglosado a nivel atómico; primero hay que decidir con evidencia qué parte ya existe y qué falta realmente. | Si el cierre depende de entorno desplegado real, documentar `BLOCKED` con criterio de desbloqueo externo y sin improvisar cambios de producto. |
| `AUT-001` | Gate frontend Windows | `docs/13_testing_ci_y_quality_gate.md` | `scripts/check_release_gate.py`, `scripts/check_seo_contract.py`, `.github/workflows/quality_gate.yml`, `tests/scripts/` | wiring del gate frontend en Windows | La auditoría detectó que el bloque frontend del gate canónico puede quedar en `SKIP` aunque `npm.cmd` exista y el runner Windows sí tenga Node. | Va primero porque hoy el gate puede omitir lint/build/tests frontend y dar una lectura falsa de readiness. |
| `AUT-002` | Contrato del gate canónico | `docs/13_testing_ci_y_quality_gate.md` | `docs/release_readiness_minima.md`, `scripts/check_release_gate.py`, `tests/scripts/`, `docs/90_estado_implementacion.md` | deriva doc↔script en el gate de release | La documentación promete bloques operativos (readiness mínimo, alertas v2, retry dry-run, backup dry-run) que el script canónico no invoca. | Resolver por una sola fuente de verdad: o se implementa la cobertura prometida o se corrige la documentación. |
| `AUT-003` | Smoke real V2-R10 | `docs/release_readiness_minima.md` | `docs/roadmap_ecommerce_real_v2.md`, `docs/deploy_railway.md`, `scripts/check_deployed_stack.py`, `scripts/backup_restore_postgres.py` | cierre externo de go-live sobre entorno desplegado real | El cierre de `V2-R10` sigue dependiendo de URLs reales desplegadas y de un restore drill fuera de este runner. | Mantener `BLOCKED` hasta contar con URLs/credenciales reales y entorno seguro para restore drill. |
| `AUT-004` | Conteos bootstrap seed | `docs/13_testing_ci_y_quality_gate.md` | `docs/90_estado_implementacion.md`, `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`, `scripts/check_bootstrap_demo_expected_counts.py`, `scripts/bootstrap_demo_release.py`, `tests/scripts/test_check_bootstrap_demo_expected_counts.py`, `tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py` | recuperación del gate canónico tras deriva entre seed público y conteos esperados del bootstrap | El gate canónico ahora falla en `C4)` porque el seed real ya publica 8 productos (5 botica + 3 velas) y el test contractual de bootstrap sigue esperando 6. | Debe ir antes de nuevas features de catálogo para restaurar ejecutabilidad/veracidad del gate. |
| `OPS-RWY-001` | Auditoría boot Railway | `docs/90_estado_implementacion.md` | `docs/deploy_railway.md`, `.env.railway.example`, `backend/configuracion_django/settings.py`, `backend/configuracion_django/validaciones_entorno.py`, `scripts/check_release_readiness.py`, `tests/nucleo_herbal/test_deploy_guards.py` | brecha exacta del fallo de arranque Railway por variables obligatorias | `R15` ya cerró los guardrails base; la deuda residual real es auditar la incidencia actual y separar validación ya implementada vs hueco operativo/documental. | No reabrir `R15`; abrir solo la auditoría residual y dejar siguiente paso exacto. |
| `SEC-PAR-001` | Paridad baseline sección pública | `docs/90_estado_implementacion.md` | `docs/07_arquitectura_tecnica.md`, `frontend/app/botica-natural/page.tsx`, `frontend/app/velas-e-incienso/page.tsx`, `frontend/app/minerales-y-energia/page.tsx`, `frontend/app/herramientas-esotericas/page.tsx`, `frontend/componentes/catalogo/rutasProductoPublico.ts`, `frontend/tests/home-raiz-secciones.test.ts` | brecha real entre baseline `botica-natural` y resto de secciones comerciales | El repo ya tiene baseline público completo para `botica-natural`, pero las otras tres secciones siguen en hero/home/backoffice sin paridad DB-backed ni detalle. | Debe cerrar con inventario de huecos reutilizables, no con implementación directa. |
| `SEC-HER-001` | Nomenclatura canónica herramientas | `docs/05_modelo_de_dominio_y_entidades.md` | `docs/90_estado_implementacion.md`, `frontend/contenido/home/seccionesPrincipales.ts`, `frontend/componentes/admin/ModuloProductosAdmin.tsx`, `backend/nucleo_herbal/dominio/entidades.py`, `backend/nucleo_herbal/presentacion/backoffice_views/productos_contrato.py` | contrato de dominio y naming entre sección pública y tipo de producto | Hoy conviven `herramientas-esotericas` como sección pública y `herramientas-rituales` como tipo de producto; antes de abrir catálogo público hay que congelar el mapa canónico. | Resolver naming antes de tocar catálogo, seeds o sincronización de herramientas. |
| `CAT-DATA-001` | Criterio mínimo de catálogo público | `docs/02_alcance_y_fases.md` | `docs/00_vision_proyecto.md`, `docs/90_estado_implementacion.md`, `frontend/componentes/botica-natural/ListadoProductosBoticaNatural.tsx`, `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py` | umbral mínimo visible, fallback y vacíos honestos por sección | `botica-natural` ya tiene estado vacío y fallback específicos; el resto de secciones no tiene todavía criterio mínimo equivalente ni seed coherente que lo sostenga. | Debe fijar mínimos reutilizables antes de sembrar o publicar nuevas secciones. |
| `CAT-UI-001` | Contrato reutilizable de listado público | `docs/08_decisiones_tecnicas_no_negociables.md` | `docs/07_arquitectura_tecnica.md`, `frontend/componentes/botica-natural/ListadoProductosBoticaNatural.tsx`, `frontend/componentes/botica-natural/TarjetaProductoBoticaNatural.tsx`, `frontend/componentes/catalogo/rutasProductoPublico.ts`, `frontend/app/botica-natural/page.tsx` | reducción de duplicación y extracción del baseline UI de sección pública | El baseline actual mezcla piezas específicas de Botica Natural y helper hardcodeado a `/botica-natural/${slug}`, lo que impide escalar por copia sana. | Auditar primero y después extraer contrato reusable sin rehacer la UX vigente de Botica Natural. |
| `OPS-RWY-002` | Preflight Railway antes de boot | `docs/deploy_railway.md` | `.env.railway.example`, `docs/release_readiness_minima.md`, `scripts/check_release_readiness.py`, `backend/configuracion_django/validaciones_entorno.py`, `tests/nucleo_herbal/test_deploy_guards.py` | detección previa de variables críticas y cobertura doc↔check | El repo documenta variables críticas y falla rápido en boot, pero el preflight actual no valida Railway real ni refleja todavía todas las URLs de pago en `docs/deploy_railway.md`. | Endurecer sin duplicar guardrails ya `DONE` en backend. |
| `SEC-VEL-001` | Catálogo público `velas-e-incienso` | `docs/90_estado_implementacion.md` | `docs/07_arquitectura_tecnica.md`, `frontend/app/velas-e-incienso/page.tsx`, `frontend/infraestructura/api/herbal.ts`, `backend/nucleo_herbal/presentacion/publica/views.py` | paridad funcional pública DB-backed para velas | La sección existe en home, hero y backoffice, y el backend soporta listado por sección, pero no hay listado/detalle público equivalente al baseline de `botica-natural`. | Ejecutar después de la auditoría de paridad y del contrato reusable. |
| `SEC-VEL-002` | Contratos y vacíos para velas | `docs/08_decisiones_tecnicas_no_negociables.md` | `docs/13_testing_ci_y_quality_gate.md`, `frontend/tests/home-raiz-secciones.test.ts`, `tests/nucleo_herbal/test_exposicion_publica.py`, `frontend/tests/botica-natural.test.ts` | cobertura de visibilidad, límite, vacío honesto y detalle en velas | Hoy solo hay cobertura pública contractual de `botica-natural`; la sección de velas carece de tests equivalentes de listado, límite y estado vacío. | Cerrar con tests y checks, no solo con UI visible. |
| `SEC-MIN-001` | Catálogo público `minerales-y-energia` | `docs/90_estado_implementacion.md` | `docs/07_arquitectura_tecnica.md`, `frontend/app/minerales-y-energia/page.tsx`, `frontend/infraestructura/api/herbal.ts`, `backend/nucleo_herbal/presentacion/publica/views.py` | paridad funcional pública DB-backed para minerales | La sección existe en home, hero y backoffice, pero no tiene listado/detalle público ni consumo real de la API de sección. | Ejecutar después de la auditoría de paridad y del contrato reusable. |
| `SEC-MIN-002` | Contratos y vacíos para minerales | `docs/08_decisiones_tecnicas_no_negociables.md` | `docs/13_testing_ci_y_quality_gate.md`, `frontend/tests/home-raiz-secciones.test.ts`, `tests/nucleo_herbal/test_exposicion_publica.py`, `frontend/tests/botica-natural.test.ts` | cobertura de visibilidad, límite, vacío honesto y detalle en minerales | No hay hoy contrato automático equivalente a `botica-natural` para proteger visibilidad pública, límite ni estado vacío en minerales. | Cerrar con pruebas y quality gate de la nueva sección. |
| `SEC-HER-002` | Catálogo público sección canónica herramientas | `docs/05_modelo_de_dominio_y_entidades.md` | `docs/90_estado_implementacion.md`, `frontend/app/herramientas-esotericas/page.tsx`, `frontend/componentes/catalogo/rutasProductoPublico.ts`, `backend/nucleo_herbal/presentacion/backoffice_views/productos_contrato.py` | exposición pública DB-backed de herramientas respetando naming final | La sección pública existe en home/hero/backoffice, pero sigue sin listado/detalle público y además depende de cerrar primero el naming canónico. | No arrancar implementación hasta congelar `SEC-HER-001`. |
| `SEC-HER-003` | Contratos y vacíos para herramientas | `docs/08_decisiones_tecnicas_no_negociables.md` | `docs/13_testing_ci_y_quality_gate.md`, `frontend/tests/home-raiz-secciones.test.ts`, `tests/nucleo_herbal/test_exposicion_publica.py`, `frontend/tests/botica-natural.test.ts` | cobertura pública contractual de la sección canónica de herramientas | La futura sección de herramientas no tiene todavía tests equivalentes a los del baseline ni nomenclatura cerrada para protegerla. | Depende de cerrar primero el naming y la sección canónica. |
| `CAT-DATA-002` | Seed/import mínimo `velas-e-incienso` | `docs/90_estado_implementacion.md` | `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/importacion/esquemas.py`, `frontend/componentes/admin/sincronizacionProductosAdmin.ts` | dataset reproducible mínimo para velas | Ya existe un único producto seed en velas; la brecha residual no es “crear desde cero” sino completar un mínimo reproducible y trazable para sección pública. | No reabrir el seed actual como vacío total; completar la brecha mínima restante. |
| `CAT-DATA-003` | Seed/import mínimo `minerales-y-energia` | `docs/90_estado_implementacion.md` | `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/importacion/esquemas.py`, `frontend/componentes/admin/sincronizacionProductosAdmin.ts` | dataset reproducible mínimo para minerales | No hay evidencia de seed demo ni importación reproducible mínima equivalente para minerales. | Ejecutar después de fijar criterio mínimo de catálogo público. |
| `CAT-DATA-004` | Seed/import mínimo herramientas | `docs/05_modelo_de_dominio_y_entidades.md` | `docs/90_estado_implementacion.md`, `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/importacion/esquemas.py`, `frontend/componentes/admin/sincronizacionProductosAdmin.ts` | dataset reproducible mínimo para la sección canónica de herramientas | No hay seed demo reproducible para herramientas y el trabajo depende además del naming canónico final. | Esperar a `SEC-HER-001` antes de fijar el dataset definitivo. |
| `CAT-SYNC-001` | Alinear importación multisección final | `docs/07_arquitectura_tecnica.md` | `docs/90_estado_implementacion.md`, `frontend/componentes/admin/sincronizacionProductosAdmin.ts`, `frontend/tests/backoffice-flujos.test.ts`, `backend/nucleo_herbal/infraestructura/persistencia_django/importacion/servicio.py`, `backend/nucleo_herbal/presentacion/backoffice_views/productos_contrato.py` | coherencia entre mapa canónico de secciones, importación y refresh contextual | La sincronización frontend está probada para botica/velas/minerales, pero no para herramientas; además el upsert backend de productos persiste `seccion_publica` sin validar existencia canónica. | Endurecer tras cerrar naming y seeds mínimos. |
| `CAT-QA-001` | Regresión multisección end-to-end | `docs/13_testing_ci_y_quality_gate.md` | `docs/90_estado_implementacion.md`, `frontend/tests/home-raiz-secciones.test.ts`, `frontend/tests/backoffice-flujos.test.ts`, `tests/nucleo_herbal/test_exposicion_publica.py`, `scripts/validate_botica_natural_postgres_e2e.py` | recorrido home → hero → listado público → importación/backoffice para nuevas secciones | El repo tiene regresión fuerte de `botica-natural`, pero no una batería equivalente que cubra la expansión multisección completa posterior. | Debe llegar al final del bloque, cuando existan secciones y seeds mínimos reales. |
| `OPS-RWY-003` | Validación externa Railway real | `docs/deploy_railway.md` | `.env.railway.example`, `docs/release_readiness_minima.md`, `backend/configuracion_django/settings.py`, `backend/configuracion_django/validaciones_entorno.py`, Railway UI/logs externos | validación externa con variables reales y boot limpio en Railway | La incidencia operativa solo se puede cerrar con variables reales, acceso a Railway UI y verificación de arranque limpio fuera de este runner. | Mantener `BLOCKED` hasta contar con acceso externo verificable; no sustituye `AUT-003`, que sigue cubriendo smoke/restore de go-live. |

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

## CRX-007 — Bootstrap contrato 1
- **Tipo**: `DOC`
- **Prioridad**: `P0`
- **Estado**: `DONE`
- **Objetivo**: revalidar y sanear el contrato documental mínimo para automations seguras sin crear sistemas paralelos, dejando explícitos append-only, cola vacía honesta y trazabilidad factual/readiness.
- **Alcance permitido**: `AGENTS.md`, `docs/90_estado_implementacion.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md` y documentación funcional/contractual mínima estrictamente necesaria.
- **Fuera de alcance**: código de producto, CI/dependencias, refactors globales, reapertura ficticia de cierres y cualquier roadmap/bitácora paralelos.
- **Checks obligatorios**:
  - contrastar `AGENTS.md` con `docs/99_fuente_de_verdad.md` y `docs/90_estado_implementacion.md`,
  - verificar que `docs/roadmap_codex.md` mantenga una sola cola operativa o declare honestamente cola vacía/backlog bloqueado,
  - ejecutar `python scripts/check_release_gate.py`,
  - ejecutar `python scripts/check_release_readiness.py`,
  - ejecutar `python scripts/check_repo_operational_integrity.py`.
- **Criterio de cierre**: contrato documental listo para automations seguras, sin contradicción factual principal en `docs/90`, sin sistema paralelo y con resultado verificable de validaciones o bloqueo operativo exacto.
- **Evidencia de cierre CRX-007**:
  1. `AGENTS.md` queda alineado explícitamente con `docs/99_fuente_de_verdad.md` y añade regla única para cola vacía/backlog totalmente bloqueado sin abrir sistemas paralelos.
  2. `docs/bitacora_codex.md` declara ya carácter `append-only` explícito.
  3. `docs/90_estado_implementacion.md` sanea su estado factual superior: resumen global, tabla principal, ruta operativa vigente y regla de lectura rápida ya no contradicen la coexistencia demo ↔ real ni el bloqueo externo actual de `V2-R10`.
  4. `python scripts/check_release_readiness.py` termina en `OK` y `python scripts/check_repo_operational_integrity.py` termina en `OK`.
  5. `python scripts/check_release_gate.py` termina en `ERROR` en este runner por entorno incompleto verificable: `ModuleNotFoundError: No module named 'django'` en bloques Django y ausencia de toolchain frontend instalada (`next` / `tsc` no disponibles); se registra como resultado exacto, no como PASS ficticio.
- **Bloqueo conocido**: ninguno para el saneamiento documental; el bloqueo externo vigente sigue encapsulado en `AUT-003`.

## Backlog comercial y operativo posterior a V1/V2
- **Origen**: petición explícita del mantenedor para romper la cola vacía con backlog nuevo, real, atómico y solo documental.
- **Regla de este bloque**: no reabrir `DONE` históricos sin brecha residual verificable; mantener `AUT-003` exactamente en `BLOCKED` mientras siga faltando entorno externo.
- **Lectura factual aplicada**:
  1. `botica-natural` ya tiene baseline público real con endpoint/backend, API frontend, página pública, detalle, componentes específicos y tests.
  2. `velas-e-incienso`, `minerales-y-energia` y `herramientas-esotericas` existen hoy en home/hero/backoffice, pero no con paridad pública DB-backed equivalente.
  3. La importación/sincronización multisección ya cubre como mínimo `botica-natural`, `velas-e-incienso` y `minerales-y-energia`; herramientas queda fuera de la cobertura probada.
  4. El hardening Railway de variables críticas ya se cerró en `R15`; la deuda residual real es auditoría, preflight documental y validación externa.

## OPS-RWY-001 — Auditar fallo de arranque Railway por variables obligatorias
- **Tipo**: `AUDIT`
- **Prioridad**: `P0`
- **Estado**: `DONE`
- **Objetivo**: contrastar la incidencia operativa de Railway contra los guardrails ya implementados para dejar una brecha exacta entre validación backend, documentación y preflight actual.
- **Evidencia o síntoma**:
  - `backend/configuracion_django/validaciones_entorno.py` ya falla en producción por `PUBLIC_SITE_URL`, `PAYMENT_SUCCESS_URL`, `PAYMENT_CANCEL_URL`, `DEFAULT_FROM_EMAIL` y `EMAIL_BACKEND` inseguros.
  - `.env.railway.example` documenta esas variables, pero `scripts/check_release_readiness.py` solo valida marcadores documentales, no Railway UI ni boot real.
  - `docs/deploy_railway.md` enumera `PUBLIC_SITE_URL`, `DEFAULT_FROM_EMAIL` y `EMAIL_BACKEND`, pero no refleja todavía las URLs de pago en el checklist visible de Railway.
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, `.env.railway.example`, `docs/deploy_railway.md`, `docs/release_readiness_minima.md`, `backend/configuracion_django/settings.py`, `backend/configuracion_django/validaciones_entorno.py`, `scripts/check_release_readiness.py`, `tests/nucleo_herbal/test_deploy_guards.py`.
- **Fuera de alcance**: tocar Railway UI real, desplegar, cambiar backend/frontend funcional o “arreglar” el incidente operativo en esta tarea.
- **Checks obligatorios**:
  - contrastar `.env.railway.example`, `docs/deploy_railway.md`, `docs/release_readiness_minima.md`, `settings.py` y `validaciones_entorno.py`;
  - ejecutar `python scripts/check_release_readiness.py`;
  - dejar lista exacta de variables/condiciones que hoy tumban boot y cuáles no quedan cubiertas por el preflight.
- **Criterio de cierre**: diagnóstico verificable del fallo Railway, sin reabrir `R15`, y con una única siguiente acción local concreta.
- **Evidencia de cierre OPS-RWY-001**:
  1. `backend/configuracion_django/settings.py` y `backend/configuracion_django/validaciones_entorno.py` ya tumban el arranque por `DATABASE_URL` ausente o SQLite en Railway, `SECRET_KEY` ausente, `PUBLIC_SITE_URL`, `PAYMENT_SUCCESS_URL` y `PAYMENT_CANCEL_URL` no HTTPS absolutas, `DEFAULT_FROM_EMAIL` vacío o con dominio `.local`, y `EMAIL_BACKEND` inseguro.
  2. `.env.railway.example` sí documenta `PAYMENT_SUCCESS_URL` y `PAYMENT_CANCEL_URL`, pero `docs/deploy_railway.md` aún no incorpora esas URLs ni `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` en la lista principal de variables requeridas en Railway UI.
  3. `scripts/check_release_readiness.py` solo comprueba marcadores en `.env.railway.example` y `docs/release_readiness_minima.md`; no contrasta `docs/deploy_railway.md`, no exige `SECRET_KEY`, `DATABASE_URL`, `DEBUG=false` ni `EMAIL_BACKEND`, y tampoco detecta valores inseguros previos al boot.
  4. `tests/nucleo_herbal/test_deploy_guards.py` blinda hoy `DATABASE_URL`, `SECRET_KEY`, `PUBLIC_SITE_URL` y `EMAIL_BACKEND`, pero no cubre todavía `PAYMENT_SUCCESS_URL`, `PAYMENT_CANCEL_URL` ni los casos `missing` / `.local` de `DEFAULT_FROM_EMAIL`.
- **Resultado de la auditoría**:
  1. No procede reabrir `R15`: el fail-fast backend ya está implementado y alineado con `docs/90_estado_implementacion.md`.
  2. La brecha residual real es contractual: checklist visible de Railway incompleto, preflight automatizado demasiado superficial y cobertura de tests incompleta para parte de las condiciones que ya invalidan el boot.
  3. El siguiente endurecimiento local acotado del hilo Railway es `OPS-RWY-002`; la validación externa real permanece en `OPS-RWY-003`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `OPS-RWY-002`.

## SEC-PAR-001 — Auditar paridad reutilizable del baseline `botica-natural`
- **Tipo**: `AUDIT`
- **Prioridad**: `P0`
- **Estado**: `DONE`
- **Objetivo**: inventariar qué partes del baseline técnico de `botica-natural` son reutilizables tal cual, cuáles son específicas y qué brecha exacta separa a las demás secciones de esa paridad pública.
- **Evidencia o síntoma**:
  - `frontend/app/botica-natural/page.tsx` consume `obtenerProductosPublicosPorSeccion("botica-natural", filtros)` y monta rail de filtros + listado específico.
  - `frontend/componentes/catalogo/rutasProductoPublico.ts` sigue hardcodeado a `/botica-natural/${slug}`.
  - `frontend/app/velas-e-incienso/page.tsx`, `frontend/app/minerales-y-energia/page.tsx` y `frontend/app/herramientas-esotericas/page.tsx` son hoy solo hero.
  - solo `botica-natural` tiene árbol público con `[slug]`, componentes dedicados y tests específicos.
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, `frontend/app/botica-natural/`, `frontend/app/velas-e-incienso/page.tsx`, `frontend/app/minerales-y-energia/page.tsx`, `frontend/app/herramientas-esotericas/page.tsx`, `frontend/componentes/botica-natural/`, `frontend/componentes/catalogo/rutasProductoPublico.ts`, `frontend/infraestructura/api/herbal.ts`, `backend/nucleo_herbal/presentacion/publica/`, `tests/nucleo_herbal/test_exposicion_publica.py`, `frontend/tests/`.
- **Fuera de alcance**: extraer componentes o implementar nuevas secciones en esta tarea.
- **Checks obligatorios**:
  - verificar endpoint/backend, API frontend, página pública, detalle, cards y tests de `botica-natural`;
  - confirmar ausencia de detalle/listado DB-backed equivalente en velas, minerales y herramientas;
  - dejar mapa explícito de piezas reutilizables vs piezas botica-específicas.
- **Criterio de cierre**: baseline de referencia descrito con huecos residuales concretos y ordenados para ejecución.
- **Resultado de la auditoría**:
  1. La capa reusable ya existente sin cambio de contrato está en backend/API: `backend/nucleo_herbal/presentacion/publica/views.py` y `urls.py` exponen listado por `slug_seccion` y detalle público de producto, y `frontend/infraestructura/api/herbal.ts` ya transporta `seccion_publica` mediante `obtenerProductosPublicosPorSeccion()`, `obtenerDetalleProductoPublico()` y `ProductoSeccionPublica`.
  2. Las piezas visuales de `botica-natural` mezclan base reutilizable con acoplamiento de baseline: `ListadoProductosBoticaNatural`, `TarjetaProductoBoticaNatural`, `FichaProductoBoticaNatural`, `PanelFiltrosBoticaNatural` e `ImagenProductoBoticaNatural` reutilizan `EstadoDisponibilidadProducto`/`BotonAgregarCarrito`, pero conservan naming, copy, clases CSS y filtros específicos de la sección.
  3. El mayor bloqueo de reutilización inmediata está en el routing público: `frontend/componentes/catalogo/rutasProductoPublico.ts` fija `/botica-natural/${slug}`, `frontend/app/botica-natural/[slug]/page.tsx` es el único árbol de detalle, y `frontend/tests/botica-natural.test.ts` + `frontend/tests/cards-media-clickable.test.ts` blindan hoy ese acoplamiento.
  4. La brecha residual exacta para `velas-e-incienso`, `minerales-y-energia` y `herramientas-esotericas` no está en home/backoffice ni en el contrato de datos, sino en presentación pública: sus rutas siguen en modo hero-only, no consumen el listado DB-backed por sección, no tienen `[slug]`, no definen vacíos/errores propios y carecen de regresión contractual equivalente.
  5. Orden operativo resultante: sin alterar la cola, la primera `TODO` no `BLOCKED` posterior pasa a ser `SEC-HER-001`; esta auditoría alimenta `CAT-UI-001` como hardening reusable previo a `SEC-VEL-001` y `SEC-MIN-001`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `CAT-UI-001`.

## SEC-HER-001 — Resolver nomenclatura canónica de herramientas
- **Tipo**: `AUDIT`
- **Prioridad**: `P0`
- **Estado**: `DONE`
- **Objetivo**: congelar el mapa canónico entre slug de sección pública, naming visible y `tipo_producto` para herramientas antes de abrir catálogo público, seed y sincronización finales.
- **Evidencia o síntoma**:
  - `frontend/contenido/home/seccionesPrincipales.ts` y `frontend/componentes/admin/ModuloProductosAdmin.tsx` usan `herramientas-esotericas` como sección.
  - `backend/nucleo_herbal/dominio/entidades.py` y múltiples tests usan `herramientas-rituales` como `tipo_producto`.
  - no hay evidencia útil en el repo de un slug público canónico `herramientas` a secas, pero sí aparece como candidato semántico del mantenedor.
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, `docs/05_modelo_de_dominio_y_entidades.md`, `docs/90_estado_implementacion.md`, `frontend/contenido/home/seccionesPrincipales.ts`, `frontend/componentes/admin/ModuloProductosAdmin.tsx`, `backend/nucleo_herbal/dominio/entidades.py`, `backend/nucleo_herbal/presentacion/backoffice_views/productos_contrato.py`, `backend/nucleo_herbal/presentacion/backoffice_views/exportacion.py`.
- **Fuera de alcance**: renombrar rutas, migrar datos o tocar frontend/backend funcional.
- **Checks obligatorios**:
  - contrastar todos los slugs/nombres vigentes en home, backoffice, dominio y contrato de producto;
  - justificar por qué el naming final no rompe `Producto` vs `Planta` ni `tipo_producto` vs `seccion_publica`;
  - dejar una única convención apta para catálogo, seed e importación.
- **Criterio de cierre**: naming canónico decidido y trazado, con alias legacy explícitos si hicieran falta.
- **Resultado de la auditoría**:
  1. El slug y naming visibles canónicos de sección permanecen en `herramientas-esotericas` / `Herramientas Esotéricas`, porque esa convención ya está implementada en home, ruta pública, backoffice, exportación y tests, y no existe evidencia equivalente para `herramientas` a secas.
  2. El `tipo_producto` canónico permanece en `herramientas-rituales`, porque el dominio de `Producto`, el contrato backoffice, el seed demo y la batería de tests ya lo usan como familia comercial estable y porque `docs/05_modelo_de_dominio_y_entidades.md` fija “herramienta ritual” como tipo de producto, no como nombre de sección.
  3. La diferencia no es una contradicción sino una separación válida de ejes: `seccion_publica` nombra la superficie de navegación/comercialización y `tipo_producto` clasifica la familia interna del producto; esto preserva la separación de semánticas exigida por `Producto` vs plano editorial/comercial.
  4. Convención única apta para catálogo, seed e importación: para herramientas usar `seccion_publica="herramientas-esotericas"` y `tipo_producto="herramientas-rituales"`. `herramientas` a secas queda descartado por falta de evidencia implementada y para evitar introducir alias nuevos antes de `SEC-HER-002`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `SEC-HER-002`.

## CAT-DATA-001 — Definir criterio mínimo de catálogo público por sección
- **Tipo**: `DOC`
- **Prioridad**: `P1`
- **Estado**: `DONE`
- **Objetivo**: fijar el mínimo visible por sección para abrir catálogo público sin humo: cuántos productos publicados necesita cada sección, cuándo vale vacío honesto y cuándo aplica fallback.
- **Evidencia o síntoma**:
  - `frontend/componentes/botica-natural/ListadoProductosBoticaNatural.tsx` ya define un vacío honesto para `botica-natural`.
  - `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py` aplica fallback herbal solo para `botica-natural`.
  - `seed_demo_publico.py` hoy solo cubre `botica-natural` de forma amplia y deja velas con un único producto seed.
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, `docs/00_vision_proyecto.md`, `docs/02_alcance_y_fases.md`, `docs/90_estado_implementacion.md`, `frontend/componentes/botica-natural/ListadoProductosBoticaNatural.tsx`, `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`.
- **Fuera de alcance**: sembrar datos o alterar reglas runtime en esta tarea.
- **Checks obligatorios**:
  - contrastar estados vacíos/fallback ya implementados en `botica-natural`;
  - definir umbral mínimo por sección y criterio de honestidad editorial-comercial;
  - dejar claro si el fallback especial de `botica-natural` se conserva, se generaliza o se prohíbe para nuevas secciones.
- **Criterio de cierre**: contrato mínimo por sección documentado y reutilizable para seeds y QA.
- **Evidencia de cierre CAT-DATA-001**:
  1. `docs/02_alcance_y_fases.md` define el contrato demo por sección: `botica-natural` queda anclada a **5** productos publicados propios; `velas-e-incienso`, `minerales-y-energia` y `herramientas-esotericas` exigen **3** antes de abrir catálogo público DB-backed.
  2. El vacío honesto queda limitado a estados posteriores a la apertura pública de la sección o a filtros activos; no sirve para inaugurar una sección con catálogo insuficiente.
  3. El fallback cruzado queda congelado como excepción legado de `botica-natural` y se prohíbe generalizarlo a nuevas secciones.
  4. `docs/90_estado_implementacion.md` deja trazado el estado factual actual: `botica-natural` sigue en 5, `velas-e-incienso` está en 1 y `minerales-y-energia`/`herramientas-esotericas` no tienen masa seed equivalente.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `CAT-DATA-002`.

## CAT-UI-001 — Separar contrato reutilizable de listado público por sección
- **Tipo**: `HARDEN`
- **Prioridad**: `P1`
- **Estado**: `DONE`
- **Objetivo**: extraer el contrato reusable necesario para que nuevas secciones públicas no nazcan como copia dura de `ListadoProductosBoticaNatural`.
- **Evidencia o síntoma**:
  - `ListadoProductosBoticaNatural`, `TarjetaProductoBoticaNatural` y `FichaProductoBoticaNatural` son piezas específicas de la sección baseline.
  - `construirHrefFichaProductoPublico()` devuelve hoy siempre `/botica-natural/${slug}`.
  - las otras secciones no pueden reutilizar el baseline sin tocar nombres, rutas y estados propios.
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, `frontend/componentes/botica-natural/`, `frontend/componentes/catalogo/rutasProductoPublico.ts`, `frontend/app/botica-natural/`, `frontend/infraestructura/api/herbal.ts`, `frontend/tests/botica-natural.test.ts`, `frontend/tests/cards-media-clickable.test.ts`.
- **Fuera de alcance**: implementación masiva multisección o rediseño visual global.
- **Checks obligatorios**:
  - listar superficie reusable mínima: listado, card, href, vacío, error, detalle y contrato de props;
  - identificar acoplamientos específicos de `botica-natural` que habría que encapsular;
  - dejar criterio de extracción compatible con arquitectura actual.
- **Criterio de cierre**: contrato reusable definido con write-scope futuro claro y sin duplicación injustificada.
- **Resultado de cierre**:
  1. `frontend/componentes/botica-natural/contratoSeccionPublica.ts` concentra el contrato base de sección pública: copy, labels, estado vacío y error del baseline.
  2. `frontend/componentes/catalogo/rutasProductoPublico.ts` deja explícito que hoy solo existe detalle público soportado para la baseline, sin seguir hardcodeando la ruta completa.
  3. `ListadoProductosBoticaNatural`, `FichaProductoBoticaNatural`, `app/botica-natural/page.tsx` y `app/botica-natural/[slug]/not-found.tsx` consumen ese contrato sin abrir todavía rutas nuevas.
  4. `frontend/tests/botica-natural.test.ts` y `frontend/tests/cards-media-clickable.test.ts` cubren el contrato reusable mínimo y el fallback de routing soportado.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `CAT-DATA-002`.

## OPS-RWY-002 — Endurecer contrato de release/deploy para detectar falta de variables antes del boot
- **Tipo**: `HARDEN`
- **Prioridad**: `P1`
- **Estado**: `DONE`
- **Objetivo**: cerrar la brecha residual entre guardrails backend ya implementados y preflight documental/automatizado previo al arranque en Railway.
- **Evidencia o síntoma**:
  - `check_release_readiness.py` valida presencia de marcadores en `.env.railway.example`, pero no valida Railway real ni cubre toda la brecha de deploy visible.
  - `docs/deploy_railway.md` no refleja todavía `PAYMENT_SUCCESS_URL` y `PAYMENT_CANCEL_URL` en la lista principal de variables.
  - los tests de deploy guard cubren `PUBLIC_SITE_URL` ausente y `EMAIL_BACKEND` inseguro, pero no muestran evidencia equivalente para URLs de pago o `.local` en `DEFAULT_FROM_EMAIL`.
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, `docs/deploy_railway.md`, `docs/release_readiness_minima.md`, `.env.railway.example`, `scripts/check_release_readiness.py`, `tests/nucleo_herbal/test_deploy_guards.py`.
- **Fuera de alcance**: tocar Railway UI, desplegar o reimplementar validaciones de settings ya cerradas.
- **Checks obligatorios**:
  - contrastar contrato doc↔script↔tests para las variables críticas de producción;
  - ejecutar `python scripts/check_release_readiness.py`;
  - dejar una fuente única de verdad previa al boot para las variables mínimas.
- **Criterio de cierre**: preflight y documentación alineados con el guardrail backend real, sin depender del fallo en boot para detectar la omisión.
- **Resultado de cierre**:
  1. `docs/release_readiness_minima.md` declara explícitamente la lista bloqueante previa al boot como fuente canónica, y `docs/deploy_railway.md` la refleja ya en la sección principal de variables Railway UI incluyendo `PAYMENT_SUCCESS_URL`, `PAYMENT_CANCEL_URL`, `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`.
  2. `scripts/check_release_readiness.py` contrasta ahora el mismo set de variables críticas entre `.env.railway.example`, `docs/release_readiness_minima.md` y la sección Railway UI de `docs/deploy_railway.md`.
  3. `tests/nucleo_herbal/test_deploy_guards.py` cubre ya los guardrails faltantes para `PAYMENT_SUCCESS_URL`, `PAYMENT_CANCEL_URL`, `DEFAULT_FROM_EMAIL` ausente y `DEFAULT_FROM_EMAIL` con dominio `.local`.
  4. La validación específica (`check_release_readiness.py`, `test_deploy_guards`) y el gate canónico quedan en verde en este runner usando modo UTF-8 explícito para evitar una limitación de decodificación Windows ajena al alcance funcional.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `OPS-RWY-003`.

## CAT-DATA-002 — Seed/importación inicial reproducible para `velas-e-incienso`
- **Tipo**: `DATA`
- **Prioridad**: `P2`
- **Estado**: `DONE`
- **Objetivo**: completar una base mínima reproducible de velas que sostenga el catálogo público sin depender del único seed actual.
- **Evidencia o síntoma**:
  - `seed_demo_publico.py` partía de un único producto seed en `velas-e-incienso`.
  - `docs/02_alcance_y_fases.md` y `docs/90_estado_implementacion.md` exigen **3 productos publicados propios** antes de abrir una sección pública nueva.
  - la sección necesita un mínimo reproducible alineado con el criterio de catálogo público y con su futura UI pública.
- **Alcance permitido**: `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/importacion/`, `tests/`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: datos editoriales exhaustivos, imágenes finales externas o ampliación de taxonomía no aprobada.
- **Checks obligatorios**:
  - seed/import reproducible ejecutable localmente;
  - evidencia de mínimo visible fijado en `CAT-DATA-001`;
  - tests/checks de datos ligados a la nueva sección.
- **Criterio de cierre**: velas cuenta con base mínima reproducible suficiente para su catálogo público.
- **Resultado de cierre**:
  1. `seed_demo_publico.py` añade `incienso-ruda-proteccion` y `vela-miel-dorada`, dejando `velas-e-incienso` con **3 productos publicados propios** (`incienso-ruda-proteccion`, `vela-lunar-blanca`, `vela-miel-dorada`).
  2. `tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py` exige ya ese mínimo y sube la expectativa global del seed a **8** productos publicados.
  3. La validación ejecutó `migrate + seed_demo_publico` sobre SQLite temporal fuera del repo y confirmó `count=3` para `velas-e-incienso`, sin tocar `var/dev.sqlite3`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `SEC-VEL-001`.

## SEC-VEL-001 — Catálogo público DB-backed para `velas-e-incienso`
- **Tipo**: `FEATURE`
- **Prioridad**: `P1`
- **Estado**: `DONE`
- **Objetivo**: llevar `velas-e-incienso` desde hero/home/backoffice a sección pública DB-backed con listado y detalle apoyados en el baseline reutilizable.
- **Evidencia o síntoma**:
  - la página actual de `frontend/app/velas-e-incienso/page.tsx` solo renderiza hero.
  - el backend ya expone listado público por sección de forma genérica.
  - `seed_demo_publico.py` ya alcanza el mínimo de **3** productos publicados propios en velas exigido por `CAT-DATA-001`, `docs/02_alcance_y_fases.md` y `docs/90_estado_implementacion.md`; la brecha restante es abrir la sección pública DB-backed.
  - existe ya el baseline reusable, pero todavía no una experiencia pública equivalente a `botica-natural`.
- **Alcance permitido**: `frontend/app/velas-e-incienso/`, `frontend/componentes/catalogo/`, `frontend/infraestructura/api/herbal.ts`, `frontend/tests/`, `backend/nucleo_herbal/presentacion/publica/`, `tests/nucleo_herbal/`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: rediseño global de home/hero o nuevos modelos de dominio.
- **Checks obligatorios**:
  - listado público por sección consumiendo API real;
  - detalle público con routing coherente;
  - vacío honesto y error controlado alineados con el contrato reusable.
- **Criterio de cierre**: `velas-e-incienso` navegable como sección pública DB-backed, sin romper baseline actual.
- **Resultado de cierre**:
  1. `frontend/app/velas-e-incienso/page.tsx` deja de ser hero-only y consume la sección real `velas-e-incienso` usando `ListadoProductosBoticaNatural` con configuración reusable propia.
  2. el detalle público se abre en `frontend/app/velas-e-incienso/[slug]/page.tsx` con `not-found` específico y guardia para rechazar productos cuya `seccion_publica` no sea `velas-e-incienso`.
  3. `frontend/componentes/catalogo/rutasProductoPublico.ts` ya enruta productos de velas a `/velas-e-incienso/[slug]`, y la validación frontend confirma listado, routing y build con las dos rutas nuevas.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `SEC-VEL-002`.

## SEC-VEL-002 — Contratos/tests de visibilidad, límite y vacío para `velas-e-incienso`
- **Tipo**: `HARDEN`
- **Prioridad**: `P1`
- **Estado**: `DONE`
- **Objetivo**: blindar la nueva sección de velas con cobertura equivalente a la del baseline público.
- **Evidencia o síntoma**:
  - `tests/nucleo_herbal/test_exposicion_publica.py` y `frontend/tests/botica-natural.test.ts` cubren hoy el baseline de `botica-natural`.
  - no hay evidencia de contratos equivalentes para velas en frontend ni backend públicos.
- **Alcance permitido**: `frontend/tests/`, `tests/nucleo_herbal/`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: añadir nuevas features comerciales ajenas a visibilidad/listado/detalle.
- **Checks obligatorios**:
  - cobertura de visibilidad pública y límite máximo de listado;
  - cobertura de estado vacío honesto;
  - quality gate aplicable para frontend y backend tocados.
- **Criterio de cierre**: velas queda protegida por contratos automáticos de regresión comparables al baseline.
- **Resultado de cierre**:
  1. `frontend/tests/velas-e-incienso-publico.test.ts` amplía la cobertura de velas a 4 pruebas y deja trazado el contrato de listado real, detalle público propio, hero/empty-state y vacío honesto sin fallback.
  2. `tests/nucleo_herbal/test_exposicion_publica.py` añade cobertura backend específica para velas: listado público propio y ordenado con 6 registros visibles, y vacío honesto cuando la sección no tiene productos sin caer en fallback herbal.
  3. La validación específica queda en verde con `python manage.py test tests.nucleo_herbal.test_exposicion_publica` y `./node_modules/.bin/tsc --module commonjs --target es2020 --outDir .tmp-tests tests/types/fetch-next.d.ts tests/velas-e-incienso-publico.test.ts infraestructura/api/herbal.ts` + `node .tmp-tests/tests/velas-e-incienso-publico.test.js`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `AUT-004`.

## AUT-004 — Alinear conteos esperados del bootstrap demo con el seed público vigente
- **Tipo**: `HARDEN`
- **Prioridad**: `P0`
- **Estado**: `TODO`
- **Objetivo**: recuperar la ejecutabilidad real del gate canónico alineando el contrato de conteos esperados del bootstrap demo con el seed público hoy vigente.
- **Evidencia o síntoma**:
  - `python scripts/check_release_gate.py` falla en `C4) Test scripts operativos críticos`.
  - `tests/scripts/test_check_bootstrap_demo_expected_counts.py` sigue esperando `productos_publicados = 6`.
  - `seed_demo_publico.py` y `tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py` sostienen ya **8 productos publicados** (`5` en `botica-natural` + `3` en `velas-e-incienso`).
- **Alcance permitido**: `tests/scripts/test_check_bootstrap_demo_expected_counts.py`, `scripts/check_bootstrap_demo_expected_counts.py`, `scripts/bootstrap_demo_release.py`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, y documentación mínima estrictamente necesaria si el contrato operativo visible cambia.
- **Fuera de alcance**: abrir nuevas secciones públicas, tocar frontend de catálogo o ampliar el seed más allá del contrato ya cerrado.
- **Checks obligatorios**:
  - reproducir el fallo con `python manage.py test tests.scripts.test_check_bootstrap_demo_expected_counts`;
  - validar el conteo esperado contra `seed_demo_publico.py` y `tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py`;
  - rerun de `python scripts/check_release_gate.py` dejando `C4)` en verde.
- **Criterio de cierre**: el contrato de bootstrap vuelve a coincidir con el seed canónico y el gate deja de fallar por esa deriva.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `CAT-DATA-003`.

## CAT-DATA-003 — Seed/importación inicial reproducible para `minerales-y-energia`
- **Tipo**: `DATA`
- **Prioridad**: `P2`
- **Estado**: `TODO`
- **Objetivo**: crear la primera base mínima reproducible de minerales alineada con el contrato público final.
- **Evidencia o síntoma**:
  - no hay seed demo equivalente para minerales en `seed_demo_publico.py`.
  - la sincronización admin contempla minerales, pero no existe todavía dataset mínimo reproducible confirmado.
- **Alcance permitido**: `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/importacion/`, `tests/`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: datasets extensos dependientes de criterio editorial externo no fijado.
- **Checks obligatorios**:
  - seed/import reproducible ejecutable;
  - coherencia con `CAT-DATA-001`;
  - tests/checks asociados al dataset mínimo.
- **Criterio de cierre**: minerales dispone de base mínima reproducible y trazable para catálogo público.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `SEC-MIN-001`.

## SEC-MIN-001 — Catálogo público DB-backed para `minerales-y-energia`
- **Tipo**: `FEATURE`
- **Prioridad**: `P1`
- **Estado**: `TODO`
- **Objetivo**: abrir `minerales-y-energia` como sección pública DB-backed con listado y detalle equivalentes al baseline reutilizado.
- **Evidencia o síntoma**:
  - la página actual de `frontend/app/minerales-y-energia/page.tsx` es solo hero.
  - la sincronización multisección ya contempla minerales en backoffice, pero no hay sección pública final equivalente.
  - `docs/02_alcance_y_fases.md` y `docs/90_estado_implementacion.md` exigen **3 productos publicados propios** antes de inaugurar una sección pública nueva, y ese mínimo todavía no existe en `seed_demo_publico.py`.
- **Alcance permitido**: `frontend/app/minerales-y-energia/`, `frontend/componentes/catalogo/`, `frontend/infraestructura/api/herbal.ts`, `frontend/tests/`, `backend/nucleo_herbal/presentacion/publica/`, `tests/nucleo_herbal/`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: reabrir `botica-natural` o inventar nuevas taxonomías fuera del mapa actual.
- **Checks obligatorios**:
  - listado público consumiendo API real de sección;
  - detalle público coherente con routing final;
  - estados vacío/error alineados con contrato reusable.
- **Criterio de cierre**: `minerales-y-energia` queda navegable como catálogo público DB-backed.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `SEC-MIN-002`.

## SEC-MIN-002 — Contratos/tests de visibilidad, límite y vacío para `minerales-y-energia`
- **Tipo**: `HARDEN`
- **Prioridad**: `P1`
- **Estado**: `TODO`
- **Objetivo**: añadir la cobertura contractual mínima necesaria para que minerales no nazca sin red de regresión.
- **Evidencia o síntoma**:
  - la evidencia contractual actual del baseline público sigue concentrada en `botica-natural`.
  - no hay tests públicos equivalentes de minerales en frontend ni backend.
- **Alcance permitido**: `frontend/tests/`, `tests/nucleo_herbal/`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: features extra fuera de listado/detalle/visibilidad.
- **Checks obligatorios**:
  - tests de visibilidad y límite;
  - tests de estado vacío honesto;
  - quality gate aplicable de la sección.
- **Criterio de cierre**: minerales queda protegida por tests equivalentes al baseline.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `CAT-DATA-004`.

## CAT-DATA-004 — Seed/importación inicial reproducible para herramientas
- **Tipo**: `DATA`
- **Prioridad**: `P2`
- **Estado**: `TODO`
- **Objetivo**: definir y cargar una base mínima reproducible para la sección canónica de herramientas sin contradecir el naming final.
- **Evidencia o síntoma**:
  - no hay seed demo reproducible para herramientas en `seed_demo_publico.py`.
  - la sección depende además del naming canónico pendiente para no sembrar con slug incorrecto.
- **Alcance permitido**: `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/importacion/`, `tests/`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: decisiones de naming fuera de `SEC-HER-001` o carga de material editorial externo no definido.
- **Checks obligatorios**:
  - naming final respetado;
  - seed/import reproducible y mínimo;
  - tests/checks de consistencia del dataset.
- **Criterio de cierre**: herramientas dispone de dataset mínimo reproducible compatible con la sección canónica.
- **Bloqueo conocido**: depende de `SEC-HER-001`, pero no es bloqueo externo.
- **Siguiente dependencia lógica**: `SEC-HER-002`.

## SEC-HER-002 — Catálogo público DB-backed para la sección canónica de herramientas
- **Tipo**: `FEATURE`
- **Prioridad**: `P1`
- **Estado**: `TODO`
- **Objetivo**: exponer la sección canónica de herramientas como catálogo público DB-backed una vez congelado el naming final.
- **Evidencia o síntoma**:
  - `frontend/app/herramientas-esotericas/page.tsx` es hoy solo hero.
  - la sección existe en home y backoffice, pero no en árbol público equivalente con detalle/listado.
  - el naming canónico ya está fijado, pero sigue faltando el dataset mínimo reproducible para no abrir la sección pública por debajo del umbral contractual.
- **Alcance permitido**: `frontend/app/herramientas-esotericas/` o ruta canónica final, `frontend/componentes/catalogo/`, `frontend/infraestructura/api/herbal.ts`, `frontend/tests/`, `backend/nucleo_herbal/presentacion/publica/`, `tests/nucleo_herbal/`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: renombrados masivos de dominio o reescritura del backoffice.
- **Checks obligatorios**:
  - catálogo y detalle públicos con slug final congelado;
  - routing coherente con helper reusable;
  - vacío/error alineados con contrato de sección pública.
- **Criterio de cierre**: herramientas queda expuesta públicamente bajo un naming canónico y navegable.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `SEC-HER-003`.

## SEC-HER-003 — Contratos/tests de visibilidad, límite y vacío para herramientas
- **Tipo**: `HARDEN`
- **Prioridad**: `P1`
- **Estado**: `TODO`
- **Objetivo**: cerrar la cobertura contractual de la sección canónica de herramientas con el mismo estándar mínimo que el baseline.
- **Evidencia o síntoma**:
  - hoy no existe sección pública final de herramientas ni tests públicos equivalentes.
  - el naming canónico ya está congelado, pero el cierre correcto depende de abrir antes la sección y su dataset mínimo.
- **Alcance permitido**: `frontend/tests/`, `tests/nucleo_herbal/`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: nuevas features fuera de los contratos públicos de sección.
- **Checks obligatorios**:
  - tests de visibilidad/listado/detalle bajo slug canónico;
  - cobertura de vacío honesto;
  - quality gate aplicable.
- **Criterio de cierre**: herramientas queda cubierta por regresión automática equivalente al baseline.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `CAT-SYNC-001`.

## CAT-SYNC-001 — Alinear importación y sincronización multisección con el mapa canónico final
- **Tipo**: `HARDEN`
- **Prioridad**: `P2`
- **Estado**: `TODO`
- **Objetivo**: cerrar la paridad entre importación backend, sincronización frontend y mapa canónico de cuatro secciones comerciales.
- **Evidencia o síntoma**:
  - `frontend/componentes/admin/sincronizacionProductosAdmin.ts` y `frontend/tests/backoffice-flujos.test.ts` cubren botica/velas/minerales, pero no herramientas.
  - `backend/nucleo_herbal/infraestructura/persistencia_django/importacion/servicio.py` persiste `seccion_publica` en productos sin validar existencia canónica equivalente.
- **Alcance permitido**: `backend/nucleo_herbal/infraestructura/persistencia_django/importacion/`, `backend/nucleo_herbal/presentacion/backoffice_views/productos_contrato.py`, `frontend/componentes/admin/sincronizacionProductosAdmin.ts`, `frontend/tests/backoffice-flujos.test.ts`, `tests/`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: crear nuevas secciones fuera del mapa final o tocar home pública de producto.
- **Checks obligatorios**:
  - validación del mapa final de secciones en importación backend;
  - cobertura de sincronización contextual para las cuatro secciones;
  - confirmación de no regresión sobre botica/velas/minerales.
- **Criterio de cierre**: importación y refresh multisección quedan alineados con el mapa canónico final de secciones.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `CAT-QA-001`.

## CAT-QA-001 — Regresión home → hero de sección → listado público → importación/backoffice
- **Tipo**: `HARDEN`
- **Prioridad**: `P2`
- **Estado**: `TODO`
- **Objetivo**: añadir una regresión transversal que garantice que la ampliación multisección no rompe home, entrada de sección, catálogo público ni refresco desde backoffice.
- **Evidencia o síntoma**:
  - `botica-natural` tiene baseline fuerte de tests y hasta script E2E PostgreSQL dedicado.
  - no existe una batería equivalente que cubra el flujo transversal de las nuevas secciones comerciales.
- **Alcance permitido**: `frontend/tests/`, `tests/nucleo_herbal/`, `scripts/validate_botica_natural_postgres_e2e.py` o script homólogo si procede, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: despliegues reales o pruebas E2E externas fuera del runner local.
- **Checks obligatorios**:
  - home/cards/hero de sección;
  - listado público y estado vacío/error;
  - importación/backoffice y refresco contextual multisección.
- **Criterio de cierre**: la expansión comercial queda protegida por una regresión transversal demostrable.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `OPS-RWY-003`.

## OPS-RWY-003 — Validación externa de Railway con variables reales y boot limpio
- **Tipo**: `OPS`
- **Prioridad**: `P1`
- **Estado**: `BLOCKED`
- **Objetivo**: validar fuera de este runner que Railway arranca limpio con las variables reales mínimas y deja trazabilidad verificable del incidente ya auditado.
- **Evidencia o síntoma**:
  - el fallo real depende de Railway UI, variables efectivamente cargadas y logs de arranque externos.
  - `docs/deploy_railway.md`, `.env.railway.example` y el guardrail backend ya permiten definir la lista mínima, pero no sustituyen la verificación externa.
  - `AUT-003` sigue cubriendo smoke post-deploy y restore drill real de go-live; esta tarea se limita al boot/configuración Railway.
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, `.env.railway.example`, `docs/deploy_railway.md`, `docs/release_readiness_minima.md`, capturas/logs externos verificables aportados por el mantenedor.
- **Fuera de alcance**: tocar producto, “arreglar” Railway desde este runner o mezclar esta validación con `AUT-003`.
- **Checks obligatorios**:
  - verificar variables reales mínimas en Railway UI;
  - capturar arranque limpio del backend con `DEBUG=false`;
  - registrar evidencia verificable del boot y del criterio de desbloqueo.
- **Criterio de cierre**: Railway arranca limpio con variables reales y la incidencia queda cerrada con evidencia externa.
- **Condición exacta de bloqueo**: falta acceso a Railway UI/logs y a las variables reales del servicio para ejecutar la validación fuera de este runner.
- **Siguiente dependencia lógica**: ninguna; desbloqueo externo.

## Radar de cola actual
- **Actualizacion radar UTC**: `2026-03-27T09:03:33.6404435+01:00`; se revalida la cola multisección y aparece una prioridad más alta que el catálogo pendiente: el gate canónico quedó rojo por deriva entre el seed público real y los conteos esperados del bootstrap.
- **Fecha de revisión**: `2026-03-27`
- **Diagnóstico**: la cola sigue activa, pero el siguiente incremento real pasa a ser `AUT-004`; después de recuperar el gate, la siguiente tarea de producto vuelve a ser `CAT-DATA-003`. El track Railway local sigue endurecido antes del boot sin tocar runtime productivo, y los únicos bloqueos externos vigentes siguen siendo `AUT-003` y `OPS-RWY-003`.
- **Verificación aplicada**:
  1. `Select-String -Path docs/02_alcance_y_fases.md,docs/90_estado_implementacion.md -Pattern 'mínimo 3 productos publicados propios|minerales-y-energia' -Encoding UTF8` -> confirma el umbral de **3 productos propios** antes de abrir la sección pública de minerales.
  2. `Select-String -Path backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py -Pattern 'minerales-y-energia|velas-e-incienso|botica-natural' -Encoding UTF8` -> confirma que el seed actual solo cubre `botica-natural` y `velas-e-incienso`, sin masa mínima para minerales.
  3. `python scripts/check_release_readiness.py` -> `OK`.
  4. `python scripts/check_release_gate.py` -> `ERROR`; falla en `C4) Test scripts operativos críticos` porque `tests/scripts/test_check_bootstrap_demo_expected_counts.py` espera `productos_publicados = 6` mientras el seed canónico actual publica 8.
  5. `docs/90_estado_implementacion.md` queda alineado con la corrección de prioridad y deja `AUT-004` como siguiente paso local exacto.
- **Estado de cola**: activa; primera `TODO` no `BLOCKED` = `AUT-004`.
- **Siguiente acción exacta**: ejecutar `AUT-004` para alinear los conteos esperados del bootstrap demo con el seed público vigente y recuperar el gate canónico antes de seguir con `CAT-DATA-003`.
