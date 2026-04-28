# Roadmap operativo Codex (fuente de ejecuciÃ³n atÃ³mica)

## Reglas de uso obligatorias
1. Este archivo gobierna la ejecuciÃ³n autÃ³noma diaria de Codex en este repo.
2. Codex debe seleccionar siempre la **primera tarea `TODO` no `BLOCKED`**.
3. Se ejecuta **una sola tarea por corrida**.
4. EstÃ¡ prohibido cambiar el orden sin justificarlo en `docs/bitacora_codex.md`.
5. No se marca `DONE` sin evidencia verificable y checks registrados.
6. Si no existe ninguna `TODO` no `BLOCKED`, el estado canónico es `cola vacía` o `backlog totalmente bloqueado`; queda prohibido abrir una cola paralela.

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

### Contrato operativo de cola vacía o backlog totalmente bloqueado
1. **Cola ejecutable vacía**: no existe ninguna tarea `TODO` no `BLOCKED` en este archivo.
2. **Backlog totalmente bloqueado**: existe trabajo restante, pero toda tarea activa está en `BLOCKED` con criterio de desbloqueo aún incumplido.
3. En ambos casos, el roadmap debe dejar un radar con diagnóstico, verificación del desbloqueo y siguiente acción exacta.
4. Cualquier tarea extraordinaria pedida explícitamente por el mantenedor se registra en este mismo roadmap y en la misma bitácora; no se crea un sistema paralelo.

---

## Matriz de trazabilidad documental por tarea

| Tarea | TÃ­tulo corto | Documento rector principal | Documentos secundarios de apoyo | Ãmbito gobernado | Motivo de asignaciÃ³n | Nota operativa |
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
| `LOCAL-LAUNCH-003` | Smoke contractual launcher local | `docs/90_estado_implementacion.md` | `run_app.bat`, `setup_entorno.bat`, `docs/bitacora_codex.md` | endurecimiento contractual del doble clic sobre el launcher canonico | `LOCAL-LAUNCH-001` y `LOCAL-LAUNCH-002` ya cerraron creacion y naming; la brecha residual defendible es blindar el smoke del artefacto final `run_app.bat` sin reabrirlo desde cero. | Debe validar contrato real del launcher actual, no recrear el launcher ni alterar los cierres historicos. |
| `LOCAL-LAUNCH-004` | Guardarrail de puertos y reutilizacion | `docs/90_estado_implementacion.md` | `run_app.bat`, `docs/bitacora_codex.md`, `AGENTS.md` | robustez del launcher ante listeners residuales locales | Peticion explicita del mantenedor: el launcher vuelve a fallar con `EADDRINUSE` aunque no haya ventanas visibles; hace falta distinguir puertos ocupados por este repo frente a procesos ajenos y evitar relanzar `next dev`/`runserver` a ciegas. | Debe endurecer solo `run_app.bat`, registrar evidencia del conflicto real y mantener una unica cola operativa. |
| `C6-DOC-001` | Alinear checkout demo y naming | `docs/ciclos/ciclo_06_prompt_01_auditoria_backlog.md` | `docs/90_estado_implementacion.md`, `docs/10_checkout_y_flujos_ecommerce.md`, `docs/13_testing_ci_y_quality_gate.md` | consistencia documental del flujo demo legado | El backlog residual oficial de Ciclo 6 fija solo brechas de contrato y naming (`B06-C1` + `B06-C2`), mientras `docs/90` confirma Ciclos 3 y 4 ya cerrados. | No reiniciar prompts brutos de Ciclo 3/4; solo alinear el delta documental verificable. |
| `C6-INT-001` | Integracion minima cuenta-demo ↔ checkout demo | `docs/ciclos/ciclo_06_prompt_01_auditoria_backlog.md` | `docs/90_estado_implementacion.md`, `frontend/componentes/catalogo/encargo/FlujoEncargoConsulta.tsx`, `frontend/componentes/cuenta_demo/AreaCuentaDemo.tsx`, `backend/nucleo_herbal/presentacion/publica/views_cuentas_demo.py` | continuidad minima entre cuenta demo y checkout demo legado | La auditoria de Ciclo 6 delimita una unica brecha de integracion (`B06-I1`) sobre capacidades que ya existen y siguen `DONE` en `docs/90`. | Debe ser un ajuste acotado de continuidad, no una reapertura de cuenta demo ni de checkout desde cero. |
| `C6-QA-001` | Cobertura integrada cesta → encargo → recibo → email | `docs/ciclos/ciclo_06_prompt_01_auditoria_backlog.md` | `docs/13_testing_ci_y_quality_gate.md`, `frontend/tests/checkout-demo.test.ts`, `tests/nucleo_herbal/test_api_pedidos_demo.py`, `scripts/check_release_gate.py` | endurecimiento del recorrido critico demo legado | La brecha residual `B06-I2` pide cobertura integrada del recorrido completo; no cuestiona que el flujo ya exista ni que el gate actual este activo. | Debe reforzar la no regresion del flujo integrado, no reabrir el Ciclo 3 oficial. |
| `C6-TRACE-001` | Normalizar historico y matriz de recorridos criticos | `docs/ciclos/ciclo_06_prompt_01_auditoria_backlog.md` | `docs/90_estado_implementacion.md`, `docs/bitacora_codex.md`, `docs/13_testing_ci_y_quality_gate.md` | trazabilidad historica y matriz compacta de recorridos | La auditoria de Ciclo 6 agrupa `B06-I3` + `B06-O2` como deuda documental residual defendible tras ciclos cerrados. | Debe limpiar etiquetas historicas ambiguas y dejar una matriz viva, sin reescribir cierres factuales. |
| `C6-UX-001` | Homogeneizar microcopy comercial demo | `docs/ciclos/ciclo_06_prompt_01_auditoria_backlog.md` | `docs/90_estado_implementacion.md`, `frontend/app/encargo/page.tsx`, `frontend/componentes/catalogo/encargo/FlujoEncargoConsulta.tsx`, `frontend/componentes/catalogo/encargo/ReciboPedidoDemo.tsx` | consistencia UX del flujo comercial demo legado | La brecha `B06-O1` es residual y de baja prioridad: microcopy heterogeneo entre superficies ya implementadas. | Debe ejecutarse al final del bloque y solo tras cerrar naming/documentacion canonicos. |

## CRX-001 — Bootstrap de gobernanza Codex
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

## V2G-001 — Auditoría de cierre de `V2-R10` (go-live checklist v2)
- **Estado**: `DONE`
- **Objetivo**: contrastar el alcance pendiente de `V2-R10` con scripts, tests y documentación reales para decidir con evidencia si puede cerrarse, qué brecha exacta queda o si existe bloqueo externo.
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
  - `scripts/backup_restore_postgres.py` requiere `DATABASE_URL` para el backup real y `BOTICA_RESTORE_DATABASE_URL` para el restore drill real.
  - con URLs reales el smoke deja de fallar por variable ausente, pero sigue siendo bloqueante si el backend público no sirve `/healthz` y las APIs esperadas.
  - el backup real sigue necesitando `DATABASE_URL` resuelta en el runner y el restore drill sigue exigiendo `BOTICA_RESTORE_DATABASE_URL` independiente sobre una base temporal segura.
- **Alcance permitido**: `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, `docs/release_readiness_minima.md`, `docs/deploy_railway.md`, `scripts/check_deployed_stack.py`, `scripts/backup_restore_postgres.py`.
- **Fuera de alcance**: cambios de producto, despliegues improvisados, uso de producción como base de restore drill, o cierre ficticio de `V2-R10` sin entorno real.
- **Zonas probables**: `docs/release_readiness_minima.md`, `docs/deploy_railway.md`, `scripts/check_deployed_stack.py`, `scripts/backup_restore_postgres.py`.
- **Checks obligatorios**:
  - exportar `BACKEND_BASE_URL` y `FRONTEND_BASE_URL` reales y ejecutar `python scripts/check_deployed_stack.py`;
  - exportar `DATABASE_URL` y `BOTICA_RESTORE_DATABASE_URL` reales y ejecutar backup real + restore drill real en base temporal segura con `python scripts/backup_restore_postgres.py`;
  - registrar resultado verificable de smoke y drill en bitácora antes de decidir cierre de `V2-R10`.
- **Revalidacion local mas reciente**:
  - `2026-03-27`: con los puertos `3000/8000` liberados y sin servicios residuales del launcher local, `python scripts/check_release_gate.py` vuelve a `OK`; ya no queda un bloqueo local del gate en este runner.
  - `2026-03-27T13:51:03Z`: `python scripts/check_release_readiness.py` -> `OK`; `python scripts/check_deployed_stack.py` falla con `La variable obligatoria BACKEND_BASE_URL no esta definida.` y `python scripts/backup_restore_postgres.py backup --dry-run --backup-dir "$env:TEMP\\botica_backups"` falla con `[ERROR] Debes definir --database-url o DATABASE_URL.`.
  - `2026-03-27T14:12:49Z`: el runner vuelve a estar limpio (`Get-NetTCPConnection -LocalPort 3000,8000 -State Listen` no encuentra listeners), `python scripts/check_release_gate.py` -> `OK` y `python scripts/check_release_readiness.py` -> `OK`; `python scripts/check_deployed_stack.py` y `python scripts/backup_restore_postgres.py backup --dry-run --backup-dir "$env:TEMP\\botica_backups"` siguen fallando exactamente por ausencia de `BACKEND_BASE_URL` y `DATABASE_URL`.
  - `2026-03-27T14:53:12Z`: el runner sigue limpio (`Get-NetTCPConnection -LocalPort 3000,8000 -State Listen -ErrorAction SilentlyContinue` -> `NO_LISTENERS_3000_8000`), `python scripts/check_release_gate.py` -> `OK` y `python scripts/check_release_readiness.py` -> `OK`; `python scripts/check_deployed_stack.py`, `python scripts/backup_restore_postgres.py backup --dry-run --backup-dir "$env:TEMP\\botica_backups"` y `python scripts/backup_restore_postgres.py restore-drill --dry-run --dump-file "$env:TEMP\\botica_backups\\dummy.dump"` siguen fallando exactamente por ausencia de `BACKEND_BASE_URL`, `DATABASE_URL` y `BOTICA_RESTORE_DATABASE_URL`.
  - `2026-03-27T15:25:28Z`: con `BACKEND_BASE_URL=https://boticabrujalore-production.up.railway.app` y `FRONTEND_BASE_URL=https://boticabrujalore.up.railway.app`, `python scripts/check_deployed_stack.py` deja de fallar por configuración ausente y pasa a fallar por entorno real: el frontend responde `200` en `/`, `/hierbas` y `/rituales`, pero el backend devuelve `404` en `/healthz`, `/api/v1/herbal/plantas/` y `/api/v1/rituales/`; `python scripts/backup_restore_postgres.py backup --dry-run --backup-dir "$env:TEMP\\botica_backups" --database-url 'postgresql://${{PGUSER}}:${{POSTGRES_PASSWORD}}@${{RAILWAY_PRIVATE_DOMAIN}}:5432/${{PGDATABASE}}'` -> `OK`.
- **Criterio de cierre**: smoke post-deploy y restore drill real ejecutados con resultado verificable y sin incidencias bloqueantes.
- **Condición exacta de bloqueo**: el smoke real ya dispone de `BACKEND_BASE_URL` y `FRONTEND_BASE_URL`, pero el backend desplegado sigue devolviendo `404` en `/healthz` y APIs públicas; además falta `BOTICA_RESTORE_DATABASE_URL` y acceso a una base temporal segura para completar el restore drill real fuera de este runner.

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
