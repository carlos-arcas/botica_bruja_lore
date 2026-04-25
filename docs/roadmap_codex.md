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
- **Estado**: `DONE`
- **Objetivo**: eliminar la deriva contractual de `C4)` alineando los conteos esperados del bootstrap demo con el seed público hoy vigente.
- **Evidencia o síntoma**:
  - `python manage.py test tests.scripts.test_check_bootstrap_demo_expected_counts` falla con `8 != 6` en `productos_publicados`.
  - `python scripts/check_release_gate.py` falla en `C4) Test scripts operativos críticos` por la misma deriva de conteos.
  - `tests/scripts/test_check_bootstrap_demo_expected_counts.py` sigue esperando `productos_publicados = 6`.
  - `seed_demo_publico.py` y `tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py` sostienen ya **8 productos publicados** (`5` en `botica-natural` + `3` en `velas-e-incienso`).
- **Alcance permitido**: `tests/scripts/test_check_bootstrap_demo_expected_counts.py`, `scripts/check_bootstrap_demo_expected_counts.py`, `scripts/bootstrap_demo_release.py`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, y documentación mínima estrictamente necesaria si el contrato operativo visible cambia.
- **Fuera de alcance**: abrir nuevas secciones públicas, tocar frontend de catálogo o ampliar el seed más allá del contrato ya cerrado.
- **Checks obligatorios**:
  - reproducir el fallo con `python manage.py test tests.scripts.test_check_bootstrap_demo_expected_counts`;
  - validar el conteo esperado contra `seed_demo_publico.py` y `tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py`;
  - rerun de `python scripts/check_release_gate.py` dejando `C4)` en verde y registrando el siguiente bloqueo local real si aparece.
- **Criterio de cierre**: el contrato de bootstrap vuelve a coincidir con el seed canónico y `C4)` deja de fallar por esta deriva.
- **Evidencia de cierre AUT-004**:
  1. `tests/scripts/test_check_bootstrap_demo_expected_counts.py` alinea `productos_publicados` a `8`, que es el total canónico ya sostenido por `seed_demo_publico.py` y por `tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py`.
  2. `python manage.py test tests.scripts.test_check_bootstrap_demo_expected_counts tests.nucleo_herbal.infraestructura.test_seed_demo_publico_command` termina en `OK`, confirmando que el contrato del bootstrap vuelve a coincidir con el seed vigente.
  3. `python scripts/check_release_gate.py` deja `C4) Test scripts operativos críticos` en verde y expone como siguiente bloqueo local real `G) Frontend - build`, por el crash Unicode ya trazado en `AUT-005`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `AUT-005`.

## AUT-005 — Endurecer `check_release_gate.py` ante salida Unicode de `next build` en Windows
- **Tipo**: `HARDEN`
- **Prioridad**: `P0`
- **Estado**: `DONE`
- **Objetivo**: recuperar la observabilidad real del gate en Windows evitando que el bloque `G) Frontend - build` aborte por problemas de decodificación al capturar la salida de `npm run build`.
- **Evidencia o síntoma**:
  - `python scripts/check_release_gate.py` aborta en `G) Frontend - build` con `UnicodeDecodeError` dentro de `subprocess.py` y termina después en `AttributeError` al asumir `result.stdout`/`result.stderr` siempre disponibles.
  - `npm.cmd run build` ejecutado directamente en `frontend/` termina `OK`, por lo que el fallo actual está en el wrapper del gate y no en el build real de Next.js.
  - `scripts/check_release_gate.py` usa `subprocess.run(..., text=True, capture_output=True)` y luego consume `result.stdout.strip()` / `result.stderr.strip()` sin blindaje ante salida Unicode fuera de `cp1252`.
- **Alcance permitido**: `scripts/check_release_gate.py`, `tests/scripts/test_check_release_gate_frontend.py`, `tests/scripts/test_check_release_gate_contract.py`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: tocar runtime de producto, modificar componentes/frontend de catálogo o mezclar este hardening con cambios de negocio.
- **Checks obligatorios**:
  - reproducir el crash actual con `python scripts/check_release_gate.py`;
  - validar `npm.cmd run build` directo en `frontend/`;
  - ampliar o ajustar la cobertura de `tests/scripts/test_check_release_gate_frontend.py` / `tests/scripts/test_check_release_gate_contract.py`;
  - rerun de `python scripts/check_release_gate.py` confirmando que `G) Frontend - build` reporta `OK` o `ERROR` sin abortar el gate completo.
- **Criterio de cierre**: el gate deja de caerse por codificación en Windows y reporta el resultado real del build de forma determinista.
- **Evidencia de cierre AUT-005**:
  1. `scripts/check_release_gate.py` deja de depender de `text=True` para capturar procesos: ahora lee `stdout`/`stderr` en binario, decodifica con fallback seguro y degrada caracteres no representables de consola sin abortar en Windows.
  2. `python -m unittest tests.scripts.test_check_release_gate_frontend tests.scripts.test_check_release_gate_contract` -> `OK`; la cobertura protege salida UTF-8 binaria, `stdout`/`stderr` en `None` y evita degradar `C4)` a `SKIP` por líneas incidentales de tests.
  3. `python scripts/check_release_gate.py` -> `OK`; `G) Frontend - build` reporta el resultado real de `next build` y el resumen final del gate vuelve a dejar `C4)` y `G)` en verde.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `CAT-DATA-003`.

## AUT-006 — Realinear conteos bootstrap demo con seed canónico expandido
- **Tipo**: `QA`
- **Prioridad**: `P0`
- **Estado**: `DONE`
- **Objetivo**: recuperar `C4) Test scripts operativos críticos` del gate canónico alineando el contrato de conteos esperados del bootstrap con el `seed_demo_publico` vigente, sin revertir la expansión concurrente del seed ni rebajar cobertura.
- **Evidencia o síntoma**:
  - `python scripts/check_release_gate.py` falla en `C4)` porque `tests.scripts.test_check_bootstrap_demo_expected_counts.CheckBootstrapDemoExpectedCountsTests.test_calcular_conteos_esperados_desde_seed_canonico` sigue esperando `intenciones_publicas=2`, `plantas_publicadas=2` y `rituales_publicados=1`, pero el seed canónico vigente ya da `4`, `4` y `5`.
  - `git diff -- backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py` muestra que el seed fue expandido y partido en `seed_demo_publico_catalogo.py` + `seed_demo_publico_rituales.py`; la prueba del comando ya valida `4` intenciones públicas, `4` plantas publicadas, `14` productos, `5` rituales y `5` reglas de calendario activas.
  - `scripts/check_bootstrap_demo_expected_counts.py` deriva los conteos desde el seed canónico, pero su test contractual sigue anclado al estado anterior.
- **Revalidacion local mas reciente**:
  - `2026-03-28T08:43:35Z`: `python scripts/check_release_readiness.py` -> `OK`; `python scripts/check_release_gate.py` -> `ERROR` solo en `C4)` por `AssertionError: 4 != 2` dentro de `tests.scripts.test_check_bootstrap_demo_expected_counts.CheckBootstrapDemoExpectedCountsTests.test_calcular_conteos_esperados_desde_seed_canonico`; `python scripts/check_deployed_stack.py` y `python scripts/backup_restore_postgres.py` siguen fallando por ausencia de `BACKEND_BASE_URL`, `FRONTEND_BASE_URL`, `DATABASE_URL` y `BOTICA_RESTORE_DATABASE_URL`, asi que `AUT-006` sigue siendo la primera `TODO` no `BLOCKED` real.
- **Alcance permitido**: `scripts/check_bootstrap_demo_expected_counts.py`, `tests/scripts/test_check_bootstrap_demo_expected_counts.py`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: reescribir `seed_demo_publico.py`, revertir los cambios concurrentes de seed/CORS/calendario, tocar frontend/backoffice o alterar el criterio de `AUT-003`.
- **Checks obligatorios**:
  - `python -m unittest tests.scripts.test_check_bootstrap_demo_expected_counts`
  - `python manage.py test tests.scripts`
  - `python scripts/check_release_gate.py`
  - `python scripts/check_release_readiness.py`
- **Criterio de cierre**: `C4)` vuelve a verde y el contrato de conteos queda derivado del seed vigente sin literales obsoletos.
- **Evidencia de cierre AUT-006**:
  1. `tests/scripts/test_check_bootstrap_demo_expected_counts.py` deja de fijar el contrato obsoleto `2/2/14/1`: mueve los casos `main()` a conteos sintéticos y actualiza el contrato canónico del seed a `4` intenciones públicas, `4` plantas publicadas, `14` productos publicados y `5` rituales publicados.
  2. `python -m unittest tests.scripts.test_check_bootstrap_demo_expected_counts` -> `OK` y `python manage.py test tests.scripts` -> `OK`; `C4)` deja de fallar por `AssertionError: 4 != 2`.
  3. `python scripts/check_release_readiness.py` -> `OK` y `python scripts/check_release_gate.py` -> `OK`; el gate canónico vuelve a quedar superado.
- **Bloqueo conocido**: ninguno en esta tarea; terminada `AUT-006`, la cola local vuelve a depender de `AUT-003` y `OPS-RWY-003`.
- **Siguiente dependencia lógica**: `AUT-003`.

## CAT-DATA-003 — Seed/importación inicial reproducible para `minerales-y-energia`
- **Tipo**: `DATA`
- **Prioridad**: `P2`
- **Estado**: `DONE`
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
- **Evidencia de cierre CAT-DATA-003**:
  1. `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py` ya incorpora 3 productos publicados propios de `minerales-y-energia` con `tipo_producto="minerales-y-piedras"` y slugs canónicos (`cuarzo-cristal-rodado`, `amatista-punta-suave`, `obsidiana-negra-bruta`).
  2. `python manage.py test tests.nucleo_herbal.infraestructura.test_seed_demo_publico_command tests.scripts.test_check_bootstrap_demo_expected_counts` -> `OK`; el seed queda idempotente, la sección de minerales alcanza el mínimo de 3 productos propios y el contrato de conteos públicos sube a `11`.
  3. `python scripts/check_release_gate.py` -> `OK`; el gate canónico sigue en verde tras ampliar el seed público.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `SEC-MIN-001`.

## SEC-MIN-001 — Catálogo público DB-backed para `minerales-y-energia`
- **Tipo**: `FEATURE`
- **Prioridad**: `P1`
- **Estado**: `DONE`
- **Objetivo**: abrir `minerales-y-energia` como sección pública DB-backed con listado y detalle equivalentes al baseline reutilizado.
- **Evidencia o síntoma**:
  - la página actual de `frontend/app/minerales-y-energia/page.tsx` es solo hero.
  - la sincronización multisección ya contempla minerales en backoffice, pero no hay sección pública final equivalente.
  - `docs/02_alcance_y_fases.md` y `docs/90_estado_implementacion.md` exigen **3 productos publicados propios** antes de inaugurar una sección pública nueva; ese mínimo ya existe en `seed_demo_publico.py`, así que la brecha restante es exclusivamente de exposición pública DB-backed.
- **Alcance permitido**: `frontend/app/minerales-y-energia/`, `frontend/componentes/catalogo/`, `frontend/infraestructura/api/herbal.ts`, `frontend/tests/`, `backend/nucleo_herbal/presentacion/publica/`, `tests/nucleo_herbal/`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: reabrir `botica-natural` o inventar nuevas taxonomías fuera del mapa actual.
- **Checks obligatorios**:
  - listado público consumiendo API real de sección;
  - detalle público coherente con routing final;
  - estados vacío/error alineados con contrato reusable.
- **Criterio de cierre**: `minerales-y-energia` queda navegable como catálogo público DB-backed.
- **Evidencia de cierre SEC-MIN-001**:
  1. `frontend/app/minerales-y-energia/page.tsx`, `frontend/app/minerales-y-energia/[slug]/page.tsx` y `frontend/app/minerales-y-energia/[slug]/not-found.tsx` ya abren listado, detalle y estado `not-found` propios reutilizando el baseline comercial existente.
  2. `frontend/componentes/botica-natural/contratoSeccionPublica.ts` y `frontend/componentes/catalogo/rutasProductoPublico.ts` incorporan la configuración pública de `minerales-y-energia` y su routing de detalle sin mezclar otras secciones.
  3. `npx tsc --module commonjs --target es2020 --outDir .tmp-tests tests/minerales-y-energia-publico.test.ts tests/types/fetch-next.d.ts infraestructura/api/herbal.ts` + `node .tmp-tests/tests/minerales-y-energia-publico.test.js` -> `OK`; `python scripts/check_release_gate.py` -> `OK`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `SEC-MIN-002`.

## SEC-MIN-002 — Contratos/tests de visibilidad, límite y vacío para `minerales-y-energia`
- **Tipo**: `HARDEN`
- **Prioridad**: `P1`
- **Estado**: `DONE`
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
- **Evidencia de cierre SEC-MIN-002**:
  1. `frontend/tests/minerales-y-energia-publico.test.ts` amplía la cobertura de minerales a 5 pruebas y deja trazado el contrato de listado visible con 6 productos, detalle público propio, hero/empty-state y vacío honesto sin fallback.
  2. `tests/nucleo_herbal/test_exposicion_publica.py` añade cobertura backend específica para minerales: listado público propio y ordenado con 6 registros visibles, y vacío honesto cuando la sección no tiene productos sin caer en fallback herbal.
  3. `python manage.py test tests.nucleo_herbal.test_exposicion_publica` -> `OK`; `npx tsc --module commonjs --target es2020 --outDir .tmp-tests tests/minerales-y-energia-publico.test.ts tests/types/fetch-next.d.ts infraestructura/api/herbal.ts` + `node .tmp-tests/tests/minerales-y-energia-publico.test.js` -> `OK`; `python scripts/check_release_gate.py` -> `OK`; `python scripts/check_release_readiness.py` -> `OK`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `CAT-DATA-004`.

## CAT-DATA-004 — Seed/importación inicial reproducible para herramientas
- **Tipo**: `DATA`
- **Prioridad**: `P2`
- **Estado**: `DONE`
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
- **Evidencia de cierre CAT-DATA-004**:
  1. `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py` ya incorpora 3 productos publicados propios para `herramientas-esotericas`, todos con `tipo_producto="herramientas-rituales"` y slugs canónicos (`pendulo-laton-dorado`, `cuenco-selenita-pulido`, `caldero-hierro-mini`).
  2. `python manage.py test tests.nucleo_herbal.infraestructura.test_seed_demo_publico_command tests.scripts.test_check_bootstrap_demo_expected_counts` -> `OK`; el seed queda idempotente, la sección de herramientas alcanza el mínimo de 3 productos propios y el contrato de conteos públicos sube a `14`.
  3. `python scripts/check_release_gate.py` -> `OK`; el gate canónico sigue en verde tras ampliar el seed público de herramientas.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `SEC-HER-002`.

## SEC-HER-002 — Catálogo público DB-backed para la sección canónica de herramientas
- **Tipo**: `FEATURE`
- **Prioridad**: `P1`
- **Estado**: `DONE`
- **Objetivo**: exponer la sección canónica de herramientas como catálogo público DB-backed una vez congelado el naming final.
- **Evidencia o síntoma**:
  - `frontend/app/herramientas-esotericas/page.tsx` es hoy solo hero.
  - la sección existe en home y backoffice, pero no en árbol público equivalente con detalle/listado.
  - el naming canónico ya está fijado y `seed_demo_publico.py` ya garantiza **3 productos publicados propios** de `herramientas-esotericas`; la brecha restante es exclusivamente la exposición pública DB-backed.
- **Alcance permitido**: `frontend/app/herramientas-esotericas/` o ruta canónica final, `frontend/componentes/catalogo/`, `frontend/infraestructura/api/herbal.ts`, `frontend/tests/`, `backend/nucleo_herbal/presentacion/publica/`, `tests/nucleo_herbal/`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: renombrados masivos de dominio o reescritura del backoffice.
- **Checks obligatorios**:
  - catálogo y detalle públicos con slug final congelado;
  - routing coherente con helper reusable;
  - vacío/error alineados con contrato de sección pública.
- **Criterio de cierre**: herramientas queda expuesta públicamente bajo un naming canónico y navegable.
- **Evidencia de cierre SEC-HER-002**:
  1. `frontend/app/herramientas-esotericas/page.tsx` ya consume `obtenerProductosPublicosPorSeccion("herramientas-esotericas")` con el contrato reusable de seccion publica y mantiene el hero comercial existente.
  2. `frontend/app/herramientas-esotericas/[slug]/page.tsx` y `frontend/app/herramientas-esotericas/[slug]/not-found.tsx` ya exponen detalle publico propio y rechazan slugs de otras secciones con `notFound()`.
  3. `frontend/componentes/botica-natural/contratoSeccionPublica.ts` y `frontend/componentes/catalogo/rutasProductoPublico.ts` ya incluyen `herramientas-esotericas` como seccion publica con copy, vacio honesto y routing canonico.
  4. `npx tsc --module commonjs --target es2020 --outDir .tmp-tests tests/herramientas-esotericas-publico.test.ts tests/types/fetch-next.d.ts infraestructura/api/herbal.ts` + `node .tmp-tests/tests/herramientas-esotericas-publico.test.js` -> `OK`; la prueba especifica valida wiring de listado, detalle, vacio honesto y helper de rutas.
  5. `python scripts/check_release_gate.py` -> `OK`; el gate canonico completo sigue en verde tras abrir la seccion publica de herramientas.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `SEC-HER-003`.

## SEC-HER-003 — Contratos/tests de visibilidad, límite y vacío para herramientas
- **Tipo**: `HARDEN`
- **Prioridad**: `P1`
- **Estado**: `DONE`
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
- **Evidencia de cierre SEC-HER-003**:
  1. `frontend/tests/herramientas-esotericas-publico.test.ts` ya cubre 5 pruebas para `herramientas-esotericas`: visibilidad de sus 3 productos públicos propios, contrato reusable de sección, detalle bajo slug canónico y vacío honesto sin fallback inventado.
  2. `tests/nucleo_herbal/test_exposicion_publica.py` ya protege la API pública de herramientas con listado propio y ordenado de 3 registros visibles, y vacío honesto cuando la sección no tiene catálogo publicado sin caer en fallback herbal.
  3. `python manage.py test tests.nucleo_herbal.test_exposicion_publica` -> `OK`; `npx tsc --module commonjs --target es2020 --outDir .tmp-tests tests/herramientas-esotericas-publico.test.ts tests/types/fetch-next.d.ts infraestructura/api/herbal.ts` + `node .tmp-tests/tests/herramientas-esotericas-publico.test.js` -> `OK`; `python scripts/check_release_gate.py` -> `OK`; `python scripts/check_release_readiness.py` -> `OK`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `CAT-SYNC-001`.

## CAT-SYNC-001 — Alinear importación y sincronización multisección con el mapa canónico final
- **Tipo**: `HARDEN`
- **Prioridad**: `P2`
- **Estado**: `DONE`
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
- **Evidencia de cierre CAT-SYNC-001**:
  1. `backend/nucleo_herbal/infraestructura/persistencia_django/importacion/servicio.py` ya valida `seccion_publica` contra el mapa final de cuatro secciones, y `tests/nucleo_herbal/infraestructura/test_importacion_masiva_admin.py` cubre tanto la confirmación válida de `herramientas-esotericas` como el rechazo de `amuletos-y-talismenes`.
  2. `frontend/componentes/admin/sincronizacionProductosAdmin.ts` ya filtra refrescos/store al mapa canónico, y `frontend/tests/backoffice-flujos.test.ts` cubre botica + velas + herramientas confirmadas, ignora secciones confirmadas fuera del mapa y protege la resincronización A+B+C+D sin reintroducir snapshots previos.
  3. `python manage.py test tests.nucleo_herbal.infraestructura.test_importacion_masiva_admin` -> `OK`; `npm.cmd run test:backoffice-flujos` (en `frontend/`) -> `OK`; `python scripts/check_release_gate.py` -> `OK`; `python scripts/check_release_readiness.py` -> `OK`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lógica**: `CAT-QA-001`.

## CAT-QA-001 — Regresión home → hero de sección → listado público → importación/backoffice
- **Tipo**: `HARDEN`
- **Prioridad**: `P2`
- **Estado**: `DONE`
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
- **Evidencia de cierre CAT-QA-001**:
  1. `frontend/tests/comercial-multiseccion-regresion.test.ts` ya fija el recorrido transversal de las cuatro secciones comerciales desde `home` hasta su ruta pública, el helper `obtenerProductosPublicosPorSeccion(...)` y el mapa canónico de resincronización de importación/backoffice.
  2. `frontend/tests/home-raiz-secciones.test.ts` ya valida la entrada principal de secciones sin falsos negativos sobre `botica-natural`, alineada con el contrato reusable `BOTICA_NATURAL_PUBLICA`.
  3. `python manage.py test tests.nucleo_herbal.test_exposicion_publica` -> `OK`; `npm.cmd run test:backoffice-flujos` (en `frontend/`) -> `OK`; la exposición pública backend y el refresco contextual multisección siguen en verde sin duplicar lógica de producto.
  4. `npx tsc --module commonjs --target es2020 --outDir .tmp-tests tests/comercial-multiseccion-regresion.test.ts tests/types/fetch-next.d.ts infraestructura/api/herbal.ts infraestructura/api/backoffice.ts` + `node .tmp-tests/tests/comercial-multiseccion-regresion.test.js` -> `OK`; `npm.cmd run test:home-raiz` -> `OK`; `python scripts/check_release_gate.py` -> `OK`; `python scripts/check_release_readiness.py` -> `OK`.
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

## LOCAL-LAUNCH-001 â€” Launcher local con doble clic y apertura automÃ¡tica del home
- **Tipo**: `OPS`
- **Prioridad**: `P0`
- **Estado**: `DONE`
- **Contexto de activaciÃ³n**: peticiÃ³n explÃ­cita del mantenedor fuera de la cola autÃ³noma; se registra aquÃ­ sin abrir roadmap paralelo y, tras cerrarse, el estado correcto vuelve a backlog bloqueado.
- **Objetivo**: permitir que `app launcher.bat` arranque el proyecto en local con doble clic, prepare el entorno mÃ­nimo y deje el navegador listo para abrir el home sin pasos manuales previos.
- **Evidencia o sÃ­ntoma**:
  - el repo no tenÃ­a `app launcher.bat`; solo existÃ­a `run_app.bat`.
  - `run_app.bat` no abrÃ­a navegador, dependÃ­a de rutas relativas frÃ¡giles para doble clic y no aplicaba migraciones locales antes de arrancar.
  - `setup_entorno.bat` priorizaba `py -3` aunque el launcher `py.exe` local estaba roto en esta mÃ¡quina, y leÃ­a mal el cÃ³digo de salida de `npm install` dentro del bloque.
- **Alcance permitido**: `run_app.bat`, `setup_entorno.bat`, `app launcher.bat`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: cambios en dominio/producto, refactors de frontend/backend ajenos al arranque local, despliegue real o cambios de Railway.
- **Checks obligatorios**:
  - ejecuciÃ³n real del launcher en modo sin navegador para validar retorno `0`;
  - verificaciÃ³n de escucha de `127.0.0.1:3000` y `127.0.0.1:8000`;
  - comprobaciÃ³n de `GET /` del frontend y `GET /healthz` del backend.
- **Criterio de cierre**: el proyecto se puede arrancar con doble clic sobre `app launcher.bat`, el home queda listo para abrirse automÃ¡ticamente y el bootstrap local deja backend + frontend operativos sin pasos manuales adicionales.
- **Evidencia de cierre LOCAL-LAUNCH-001**:
  1. `setup_entorno.bat` ya usa rutas basadas en `%~dp0`, valida un Python ejecutable real antes de crear `.venv`, crea `frontend/.env.local` desde `.env.example` cuando falta y deja de interpretar como error un `npm install` exitoso.
  2. `run_app.bat` ya usa rutas absolutas para doble clic, aplica `migrate --noinput`, carga `seed_demo_publico` en primera base local SQLite, arranca Django en `127.0.0.1:8000`, arranca Next en `127.0.0.1:3000` y espera al frontend para abrir el navegador en `http://127.0.0.1:3000/`.
  3. `app launcher.bat` ya existe como punto de entrada simple para Explorer y delega en `run_app.bat`.
  4. `$env:BOTICA_NO_BROWSER='1'; & '.\app launcher.bat'` -> `exit code 0`; `Get-NetTCPConnection -LocalPort 8000,3000 -State Listen` -> ambos puertos en `Listen`; `Invoke-WebRequest http://127.0.0.1:3000/` -> `200`; `Invoke-WebRequest http://127.0.0.1:8000/healthz` -> `{"status": "ok", "database": "available"}`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia lÃ³gica**: `AUT-003`.

## LOCAL-LAUNCH-002 - Canonizar `run_app.bat` como unico lanzador local
- **Tipo**: `OPS`
- **Prioridad**: `P0`
- **Estado**: `DONE`
- **Contexto de activacion**: aclaracion explicita del mantenedor: el lanzador se llama `run_app.bat`.
- **Objetivo**: alinear la operativa local y la trazabilidad con el nombre canonico del launcher, eliminando el alias `app launcher.bat`.
- **Evidencia o sintoma**:
  - la corrida anterior dejo `app launcher.bat` como alias para Explorer.
  - el mantenedor aclaro que el lanzador correcto y esperado es `run_app.bat`.
- **Alcance permitido**: `run_app.bat`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`, borrado de `app launcher.bat`.
- **Fuera de alcance**: cambios funcionales en backend/frontend o nuevos ajustes de bootstrap.
- **Checks obligatorios**:
  - confirmar que `run_app.bat` sigue siendo el lanzador operativo;
  - eliminar el alias para no dejar ambiguedad en el repo.
- **Criterio de cierre**: `run_app.bat` queda como unico lanzador local canonico y la trazabilidad deja explicita la correccion.
- **Evidencia de cierre LOCAL-LAUNCH-002**:
  1. `app launcher.bat` se elimina del repo.
  2. `run_app.bat` permanece intacto como launcher local operativo.
  3. `docs/roadmap_codex.md` y `docs/bitacora_codex.md` registran la correccion de naming sin reescribir la entrada historica previa.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia logica**: `AUT-003`.

## OPS-RWY-004 - Alineacion repo-docs-scripts para Railway env con variables reales aportadas
- **Tipo**: `OPS`
- **Prioridad**: `P0`
- **Estado**: `DONE`
- **Contexto de activación**: petición explícita del mantenedor fuera de la cola autónoma bloqueada; se registra aquí sin abrir roadmap paralelo.
- **Objetivo**: alinear el contrato Railway del repo con las variables reales aportadas, separar variables de servicio de variables operativas de smoke/restore y dejar trazabilidad honesta de lo resuelto y lo que sigue bloqueado.
- **Evidencia o síntoma**:
  - `docs/deploy_railway.md` y `.env.railway.example` no distinguían con suficiente claridad variables de boot, variables opcionales del frontend y variables operativas de smoke/restore.
  - `.env.railway.example` no reflejaba `NEXT_PUBLIC_SITE_URL` ni `NEXT_PUBLIC_ADMIN_BASE_URL`, aunque el frontend y la operativa SEO sí las contemplan.
  - el mantenedor ya aportó URLs públicas reales y wiring Railway suficiente para pasar de un bloqueo por variable ausente a una validación real del entorno desplegado.
- **Alcance permitido**: `.env.railway.example`, `docs/deploy_railway.md`, `docs/release_readiness_minima.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: desplegar desde este runner, inventar secretos/URLs no aportados, relajar guardrails de producción o cerrar ficticiamente `AUT-003`/`OPS-RWY-003`.
- **Checks obligatorios**:
  - `python scripts/check_release_readiness.py`
  - `$env:BACKEND_BASE_URL='https://boticabrujalore-production.up.railway.app'; $env:FRONTEND_BASE_URL='https://boticabrujalore.up.railway.app'; python scripts/check_deployed_stack.py`
  - `python scripts/backup_restore_postgres.py backup --dry-run --backup-dir "$env:TEMP\\botica_backups" --database-url 'postgresql://${{PGUSER}}:${{POSTGRES_PASSWORD}}@${{RAILWAY_PRIVATE_DOMAIN}}:5432/${{PGDATABASE}}'`
- **Criterio de cierre**: contrato documental y ejemplo de entorno alineados con el repo actual, con evidencia verificable de smoke/backup y sin inventar los valores que siguen faltando.
- **Evidencia de cierre OPS-RWY-004**:
  1. `.env.railway.example`, `docs/deploy_railway.md` y `docs/release_readiness_minima.md` separan ya variables de boot backend, variables frontend, alias opcionales del servicio PostgreSQL y variables operativas de `check_deployed_stack.py` / `backup_restore_postgres.py`.
  2. `python scripts/check_release_readiness.py` -> `OK`; el contrato versionado sigue alineado con el preflight mínimo.
  3. `python scripts/check_deployed_stack.py` con las URLs reales aportadas falla por entorno real y no por variable ausente: frontend `200` en `/`, `/hierbas` y `/rituales`; backend `404` en `/healthz`, `/api/v1/herbal/plantas/` y `/api/v1/rituales/`.
  4. `python scripts/backup_restore_postgres.py backup --dry-run --backup-dir "$env:TEMP\\botica_backups" --database-url 'postgresql://${{PGUSER}}:${{POSTGRES_PASSWORD}}@${{RAILWAY_PRIVATE_DOMAIN}}:5432/${{PGDATABASE}}'` -> `OK`; `BOTICA_RESTORE_DATABASE_URL` sigue pendiente para restore drill.
- **Bloqueo conocido**: la tarea local queda cerrada, pero `AUT-003` y `OPS-RWY-003` siguen bloqueadas por el entorno real desplegado y por el restore drill pendiente.
- **Siguiente dependencia logica**: `OPS-RWY-003` y `AUT-003`.

## Replan residual Ciclo 6 + launcher local
- **Origen**: peticion explicita del mantenedor para romper la cola vacia sin falsificar el estado real del repo ni reabrir cierres historicos.
- **Regla de este bloque**:
  1. `AUT-003` y `OPS-RWY-003` se mantienen en `BLOCKED` mientras la evidencia siga siendo externa.
  2. No se reinyectan los prompts brutos de Ciclo 3 o Ciclo 4 como backlog pendiente desde cero; `docs/90_estado_implementacion.md` los declara `DONE` y `docs/ciclos/ciclo_06_prompt_01_auditoria_backlog.md` solo habilita backlog residual.
  3. `LOCAL-LAUNCH-001` y `LOCAL-LAUNCH-002` permanecen `DONE`; `LOCAL-LAUNCH-003` nace solo como hardening contractual del launcher canonico `run_app.bat`.
- **Lectura factual aplicada**:
  1. `docs/90_estado_implementacion.md` declara `Checkout demo` `DONE (Ciclo 3)` y `Cuenta demo` `DONE como legado controlado (Ciclo 4)`.
  2. `docs/ciclos/ciclo_03_roadmap_prompts.md` y `docs/ciclos/ciclo_04_roadmap_prompts.md` siguen siendo roadmap historico de ejecucion, no cola pendiente actual.
  3. `docs/ciclos/ciclo_06_prompt_01_auditoria_backlog.md` acota el backlog residual defendible a `B06-C1`, `B06-C2`, `B06-I1`, `B06-I2`, `B06-I3`, `B06-O1` y `B06-O2`.
  4. `run_app.bat` ya orquesta `setup_entorno.bat`, migraciones, seed local SQLite en primera base, arranque Django/Next y apertura automatica del navegador; la brecha residual defendible es verificar contractualmente ese comportamiento sobre el launcher canonico actual.

## LOCAL-LAUNCH-003 - Smoke contractual de doble clic en `run_app.bat`
- **Tipo**: `OPS`
- **Prioridad**: `P0`
- **Estado**: `DONE`
- **Objetivo**: blindar y verificar contractualmente el arranque local con doble clic sobre `run_app.bat`, incluyendo prerequisitos minimos reales, listeners en puertos canonicos y apertura automatica del home.
- **Mapeo backlog residual**: hardening residual del launcher local ya `DONE`, sin reabrir `LOCAL-LAUNCH-001` ni `LOCAL-LAUNCH-002`.
- **Evidencia o sintoma**:
  - `LOCAL-LAUNCH-001` ya dejo operativo el arranque local y `LOCAL-LAUNCH-002` canonizo `run_app.bat` como unico lanzador.
  - `run_app.bat` ya llama a `setup_entorno.bat`, aplica `migrate --noinput`, siembra `seed_demo_publico` en primera base SQLite local, arranca Django en `127.0.0.1:8000`, arranca Next en `127.0.0.1:3000` y abre navegador cuando el frontend responde.
  - falta un smoke contractual explicito del artefacto final `run_app.bat` como launcher canonico tras el cambio de naming y con foco en doble clic/puertos/home.
- **Alcance permitido**: `run_app.bat`, `setup_entorno.bat`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: reabrir `LOCAL-LAUNCH-001`/`002`, crear un launcher alternativo, tocar producto o mezclar este hardening con `AUT-003`/`OPS-RWY-003`.
- **Checks obligatorios**:
  - verificar prerequisitos minimos reales de Python/npm/.venv y `.env.local`;
  - ejecutar el launcher canonico en modo verificable para confirmar listeners en `127.0.0.1:3000` y `127.0.0.1:8000`;
  - comprobar `GET /` del frontend y `GET /healthz` del backend;
  - registrar contrato de apertura automatica del home y salidas operativas del script.
- **Criterio de cierre**: existe evidencia verificable de que `run_app.bat` cumple el contrato de doble clic sobre el artefacto final canonico, sin reabrir ni reescribir los cierres historicos previos.
- **Evidencia de cierre LOCAL-LAUNCH-003**:
  1. Prerrequisitos minimos verificados en este runner: `python --version` -> `Python 3.13.12`, `npm --version` -> `11.9.0`, `.venv\Scripts\python.exe` ya existe y `frontend\.env.local` ya existe con `frontend\.env.example` presente.
  2. `cmd /c run_app.bat` con `BOTICA_NO_BROWSER=1` termino con `exit code 0`; `setup_entorno.bat` completo `pip`, `npm install` y el backend quedo sin migraciones pendientes (`No migrations to apply.`).
  3. Tras el arranque, `Get-NetTCPConnection` mostro listeners reales en `127.0.0.1:3000` y `127.0.0.1:8000`.
  4. `GET http://127.0.0.1:3000/` devolvio `200` con HTML del home y `GET http://127.0.0.1:8000/healthz` devolvio `200 {"status": "ok", "database": "available"}`.
  5. `run_app.bat` mantiene la rama de apertura automatica del home (`BOTICA_NO_BROWSER` como escape de verificacion y `Start-Process` sobre `%FRONTEND_URL%` / `%BACKEND_URL%`), por lo que el smoke contractual se completo sin introducir un launcher alternativo.
  6. Los procesos lanzados para la verificacion se limpiaron al final y no quedaron listeners residuales en `3000`/`8000`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia logica**: `C6-DOC-001`.

## LOCAL-LAUNCH-004 - Guardarrail de puertos y reutilizacion en `run_app.bat`
- **Tipo**: `OPS`
- **Prioridad**: `P0`
- **Estado**: `DONE`
- **Origen**: peticion explicita del mantenedor fuera de la cola autonoma; se registra en esta misma cola sin crear backlog paralelo.
- **Objetivo**: evitar que `run_app.bat` vuelva a fallar con `EADDRINUSE` cuando `127.0.0.1:3000` o `127.0.0.1:8000` ya estan ocupados por procesos residuales, reutilizando listeners del propio worktree y abortando solo cuando el puerto pertenece a otro proceso ajeno.
- **Mapeo backlog residual**: incidencia operativa local del launcher canonico; no reabre `LOCAL-LAUNCH-001`/`002`/`003`.
- **Evidencia o sintoma**:
  - el mantenedor reporta que el launcher no funciona aunque ya no hay consolas ni navegadores abiertos.
  - la evidencia local muestra `127.0.0.1:3000` ocupado por un `node.exe` residual del propio repo (`...botica_bruja_lore\frontend\node_modules\next\dist\server\lib\start-server.js`) y `127.0.0.1:8000` ocupado en otra corrida por un `python.exe` ajeno a este worktree.
  - `run_app.bat` arrancaba siempre nuevas ventanas `cmd /k` para backend/frontend sin inspeccionar previamente la ocupacion real de puertos.
- **Alcance permitido**: `run_app.bat`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: crear otro launcher, tocar backend/frontend de producto, cambiar puertos canonicos o matar procesos ajenos de forma automatica desde el script.
- **Checks obligatorios**:
  - identificar propietarios reales de `127.0.0.1:3000` y `127.0.0.1:8000` con `Get-NetTCPConnection` + `Get-CimInstance Win32_Process`;
  - ejecutar `run_app.bat` con un puerto ajeno ocupado para validar abortado temprano con mensaje explicito;
  - ejecutar `run_app.bat` con listeners del propio repo activos para validar reutilizacion sin nuevo `EADDRINUSE`;
  - comprobar respuesta del frontend local tras la reutilizacion.
- **Criterio de cierre**: `run_app.bat` deja de relanzar `next dev`/`runserver` a ciegas, distingue entre listeners propios y ajenos y el escenario reportado por el mantenedor queda cubierto por evidencia verificable.
- **Evidencia de cierre LOCAL-LAUNCH-004**:
  1. `run_app.bat` incorpora inspeccion previa de `3000/8000`, reutiliza listeners cuyo comando pertenece a este worktree y aborta con mensaje claro cuando el puerto lo ocupa un proceso ajeno.
  2. `Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 3000,8000 -State Listen` junto con `Get-CimInstance Win32_Process` confirmo el caso real del maintainer: `3000` estaba ocupado por un `next dev` residual del propio repo y `8000` podia quedar ocupado por un `python runserver` ajeno.
  3. `cmd /c run_app.bat` ya no cae en `EADDRINUSE`: cuando `8000` estaba ocupado por un proceso ajeno devolvio `[ERROR] El puerto 8000 ya esta en uso por python.exe (PID 46820) y no pertenece a este repo.` y salio con `exit code 1`.
  4. `cmd /c "set BOTICA_NO_BROWSER=1&& run_app.bat"` con backend/frontend ya activos del propio repo devolvio `Backend Django ya estaba en ejecucion ... Se reutiliza.` y `Frontend Next ya estaba en ejecucion ... Se reutiliza.` en la misma corrida.
  5. `Invoke-WebRequest http://127.0.0.1:3000/ -UseBasicParsing` devolvio `200`, confirmando que el launcher reutilizado deja el frontend operativo tras el caso reportado.
- **Bloqueo conocido**: ninguno para este hardening; los bloqueos externos de go-live siguen siendo `AUT-003` y `OPS-RWY-003`.
- **Siguiente dependencia logica**: cola ejecutable vacia; volver a `AUT-003` y `OPS-RWY-003` solo si aparece evidencia externa nueva.

## C6-DOC-001 - Alinear contrato real de checkout demo y naming canonico
- **Tipo**: `DOC`
- **Prioridad**: `P1`
- **Estado**: `DONE`
- **Objetivo**: alinear el contrato real del checkout demo legado y fijar un naming canonico unico para el flujo `/encargo` sin prometer mas de lo implementado.
- **Mapeo backlog residual**: `B06-C1` + `B06-C2`.
- **Evidencia o sintoma**:
  - `docs/ciclos/ciclo_06_prompt_01_auditoria_backlog.md` documenta que `docs/10_checkout_y_flujos_ecommerce.md` sobredimensiona el contrato real implementado para `PedidoDemo`.
  - la misma auditoria marca ambiguedad operativa entre "checkout demo" y superficies reales nombradas como `encargo/consulta`.
  - `docs/90_estado_implementacion.md` confirma que el flujo ya existe y esta `DONE`; la brecha es de contrato/naming, no de implementacion base.
- **Alcance permitido**: `docs/10_checkout_y_flujos_ecommerce.md`, `docs/13_testing_ci_y_quality_gate.md`, `docs/90_estado_implementacion.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: rehacer checkout demo, reabrir Ciclo 3/Ciclo 4 desde cero, tocar checkout real o mezclar nuevas features de cuenta.
- **Checks obligatorios**:
  - contrastar naming y contrato contra `docs/ciclos/ciclo_06_prompt_01_auditoria_backlog.md`, `docs/90_estado_implementacion.md` y repo real;
  - verificar que la nomenclatura canonica queda consistente en docs de flujo, estado y gate;
  - registrar delta exacto entre contrato implementado y contrato documentado previo.
- **Criterio de cierre**: el flujo demo legado queda documentado con naming canonico unico y contrato honesto, sin sobredeclarar capacidad ni reabrir ciclos ya cerrados.
- **Evidencia de cierre C6-DOC-001**:
  1. `docs/10_checkout_y_flujos_ecommerce.md` fija el naming canonico **checkout demo legado (`/encargo`)** y reduce el contrato vigente a `lineas` + `email` + `canal` (+ `id_usuario` en autenticado), dejando fuera datos de entrega, envio demo y pago demo no implementados.
  2. `docs/13_testing_ci_y_quality_gate.md` alinea el gate con ese naming y explicita el recorrido contractual `/encargo` -> `POST /api/v1/pedidos-demo/` -> `/pedido-demo/[id_pedido]` -> `email-demo`.
  3. `docs/90_estado_implementacion.md` refleja el mismo naming factual y el contrato minimo real del flujo demo legado.
  4. `python scripts/check_release_readiness.py` -> `OK`; `Select-String` sobre docs de flujo/estado/gate devuelve `canon_hits=10` y `stale_hits=0`.
  5. `python scripts/check_release_gate.py` se ejecuto y fallo en `F) Integridad operativa del repo` por una contradiccion ajena a `C6-DOC-001`: `.env.railway.example` usa `DATABASE_URL=${{Postgres.DATABASE_URL}}`, mientras `scripts/check_repo_operational_integrity.py` exige `DATABASE_URL=${{SERVICE_NAME.DATABASE_URL}}` y prohibe `Postgres.DATABASE_URL`; la incidencia se replanifica como `OPS-RWY-005`.
- **Bloqueo conocido**: ninguno para `C6-DOC-001`; el gate rojo descubierto en validacion queda trazado como trabajo nuevo y prioritario en `OPS-RWY-005`.
- **Siguiente dependencia logica**: `OPS-RWY-005`.

## OPS-RWY-005 - Contrato canonico DATABASE_URL en Railway example
- **Tipo**: `OPS`
- **Prioridad**: `P0`
- **Estado**: `DONE`
- **Objetivo**: restaurar un contrato unico y verificable para `DATABASE_URL` entre `.env.railway.example` y `scripts/check_repo_operational_integrity.py`, de modo que el gate canónico vuelva a pasar sin reabrir despliegue real ni tocar producto.
- **Mapeo backlog residual**: incidencia nueva detectada durante la validacion obligatoria de `C6-DOC-001`.
- **Evidencia o sintoma**:
  - `python scripts/check_release_gate.py` falla en `F) Integridad operativa del repo` con: `.env.railway.example debe contener 'DATABASE_URL=${{SERVICE_NAME.DATABASE_URL}}'.`
  - `.env.railway.example` hoy declara `DATABASE_URL=${{Postgres.DATABASE_URL}}`.
  - `scripts/check_repo_operational_integrity.py` exige `DATABASE_URL=${{SERVICE_NAME.DATABASE_URL}}` y rechaza `Postgres.DATABASE_URL`.
- **Alcance permitido**: `.env.railway.example`, `scripts/check_repo_operational_integrity.py`, `tests/scripts/test_check_repo_operational_integrity.py`, `docs/deploy_railway.md`, `docs/release_readiness_minima.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: tocar codigo de producto, desplegar en Railway, cambiar secretos reales, relajar el gate o mezclar restore drill/smoke post-deploy.
- **Checks obligatorios**:
  - `python scripts/check_repo_operational_integrity.py`
  - `python scripts/check_release_readiness.py`
  - `python scripts/check_release_gate.py`
- **Criterio de cierre**: existe un solo contrato versionado para `DATABASE_URL`, la integridad operativa deja de fallar en `F)` y el gate canónico deja de romperse por esta contradiccion local.
- **Evidencia de cierre OPS-RWY-005**:
  1. `scripts/check_repo_operational_integrity.py` ahora exige `DATABASE_URL=${{Postgres.DATABASE_URL}}` y rechaza el placeholder residual `SERVICE_NAME.DATABASE_URL`, alineandose con `.env.railway.example` y `docs/deploy_railway.md`.
  2. `tests/scripts/test_check_repo_operational_integrity.py` cubre el contrato actualizado de `.env.railway.example`.
  3. `python -m unittest tests.scripts.test_check_repo_operational_integrity` -> `OK`.
  4. `python scripts/check_repo_operational_integrity.py` -> `OK`.
  5. `python scripts/check_release_readiness.py` -> `OK`.
  6. `python scripts/check_release_gate.py` -> `OK`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia logica**: `C6-INT-001`.

## C6-INT-001 - Integracion minima cuenta-demo ↔ checkout demo
- **Tipo**: `HARDEN`
- **Prioridad**: `P2`
- **Estado**: `DONE`
- **Objetivo**: cerrar la brecha minima de continuidad entre cuenta demo y checkout demo legado, sin convertir el flujo en auth real ni reabrir la cuenta demo desde cero.
- **Mapeo backlog residual**: `B06-I1`.
- **Evidencia o sintoma**:
  - la auditoria de Ciclo 6 detecta que la API ya soporta `id_usuario` opcional, pero la continuidad entre cuenta demo y checkout demo sigue siendo manual.
  - `docs/90_estado_implementacion.md` confirma que `Cuenta demo` y `Checkout demo` ya existen y estan `DONE`; el residual es solo de integracion minima.
  - el valor declarado de "autenticado vs invitado" pierde credibilidad si no existe continuidad minima reutilizable.
- **Alcance permitido**: `frontend/componentes/catalogo/encargo/FlujoEncargoConsulta.tsx`, `frontend/componentes/cuenta_demo/AreaCuentaDemo.tsx`, `frontend/contenido/cuenta_demo/estadoCuentaDemo.ts`, `backend/nucleo_herbal/presentacion/publica/views_cuentas_demo.py`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: auth real, cookies/sesion productiva, reapertura completa de Ciclo 4 o cambios de negocio fuera del flujo demo legado.
- **Checks obligatorios**:
  - demostrar continuidad minima de estado/canal entre cuenta demo y flujo `/encargo`;
  - validar que no se rompe el modo invitado ni el contrato existente de `PedidoDemo`;
  - ejecutar pruebas de no regresion del flujo afectado.
- **Criterio de cierre**: la cuenta demo aporta continuidad minima verificable al flujo demo legado sin alterar el alcance historico ya cerrado de cuenta/checkouts.
- **Evidencia de cierre C6-INT-001**:
  1. `frontend/componentes/catalogo/encargo/FlujoEncargoConsulta.tsx` deja preparado el retorno desde `cuenta-demo` guardando el borrador de `/encargo` con `continuarComoInvitado=false` cuando el usuario decide entrar o crear cuenta demo, de modo que la vuelta al checkout reutiliza la sesion demo en modo autenticado sin paso manual extra.
  2. `frontend/tests/checkout-demo-ui.test.ts` protege el cableado minimo de continuidad comprobando que el desvio a `cuenta-demo` mantiene retorno seguro y persiste el borrador listo para volver autenticado.
  3. `npm run lint -- --file componentes/catalogo/encargo/FlujoEncargoConsulta.tsx` devuelve `OK`.
  4. `npm run test:checkout-demo` devuelve `OK`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia logica**: `C6-QA-001`.

## C6-QA-001 - Cobertura integrada cesta -> encargo -> recibo -> email
- **Tipo**: `QA`
- **Prioridad**: `P2`
- **Estado**: `DONE`
- **Objetivo**: reforzar la cobertura integrada del recorrido critico demo desde cesta/encargo hasta recibo y email demo, para blindar regresiones transversales que hoy no quedan cubiertas de forma unificada.
- **Mapeo backlog residual**: `B06-I2`.
- **Evidencia o sintoma**:
  - la auditoria de Ciclo 6 constata que el gate actual ejecuta pruebas puntuales de checkout demo, cuenta demo y calendario ritual, pero no un recorrido unificado cesta -> encargo -> recibo -> email.
  - `docs/90_estado_implementacion.md` ya traza el cierre oficial del Ciclo 3, por lo que la brecha residual es de cobertura integrada, no de existencia del flujo.
- **Alcance permitido**: `frontend/tests/checkout-demo.test.ts`, `tests/nucleo_herbal/test_api_pedidos_demo.py`, `scripts/check_release_gate.py`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: reabrir el dominio del pedido demo, introducir tooling E2E ajeno al repo o mezclar cambios de cuenta demo fuera del recorrido critico.
- **Checks obligatorios**:
  - cubrir el recorrido integrado cesta/encargo -> pedido demo -> recibo -> email demo;
  - dejar el gate alineado con la nueva cobertura contractual;
  - demostrar no regresion del circuito demo legado.
- **Criterio de cierre**: el recorrido critico demo queda protegido por al menos una cobertura integrada verificable y el gate refleja esa proteccion sin reabrir el Ciclo 3.
- **Evidencia de cierre C6-QA-001**:
  1. `frontend/tests/checkout-demo.test.ts` añade una regresion integrada que parte de la seleccion de cesta, construye el payload de `/encargo`, crea el pedido demo, resuelve la ruta de recibo y valida el email demo final sin saltarse contratos intermedios.
  2. `scripts/check_release_gate.py` incorpora el bloque bloqueante `C7) Test crítico recorrido pedido demo integrado`, ejecutando `python manage.py test tests.nucleo_herbal.test_api_pedidos_demo` dentro del gate canónico.
  3. `tests/nucleo_herbal/test_api_pedidos_demo.py` ya cubre el recorrido integral backend `pedido -> detalle -> email demo` y ahora queda exigido por el gate.
  4. `npm run test:checkout-demo` -> `OK`.
  5. `python manage.py test tests.nucleo_herbal.test_api_pedidos_demo` -> `OK`.
  6. `python -m unittest tests.scripts.test_check_release_gate_contract tests.scripts.test_check_release_gate_frontend` -> `OK`.
  7. `python scripts/check_release_readiness.py` -> `OK`.
  8. `python scripts/check_release_gate.py` -> `OK`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia logica**: `C6-TRACE-001`.

## C6-TRACE-001 - Normalizar historico y matriz de recorridos criticos
- **Tipo**: `DOC`
- **Prioridad**: `P2`
- **Estado**: `DONE`
- **Objetivo**: normalizar marcadores historicos ambiguos en `docs/90_estado_implementacion.md` y dejar una matriz compacta de recorridos criticos que una ruta frontend, endpoint/backend y prueba de cobertura.
- **Mapeo backlog residual**: `B06-I3` + `B06-O2`.
- **Evidencia o sintoma**:
  - la auditoria de Ciclo 6 detecta etiquetas historicas tipo "Ciclo 3 en progreso" dentro de un documento cuyo estado global ya declara ciclos cerrados.
  - tambien detecta ausencia de una matriz unica de recorridos criticos para auditoria y mantenimiento rapido.
- **Alcance permitido**: `docs/90_estado_implementacion.md`, `docs/13_testing_ci_y_quality_gate.md`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: reescribir historial funcional, reabrir ciclos cerrados o alterar estado factual implementado sin evidencia.
- **Checks obligatorios**:
  - verificar consistencia entre etiquetas historicas y estado global de `docs/90_estado_implementacion.md`;
  - construir una matriz viva recorrido -> frontend -> backend -> test de cobertura;
  - registrar que no se modifican cierres factuales sin evidencia nueva.
- **Criterio de cierre**: la traza historica queda menos ambigua y existe una matriz compacta y mantenible de recorridos criticos, sin tocar el estado real implementado mas alla de la aclaracion documental.
- **Evidencia de cierre C6-TRACE-001**:
  1. `docs/90_estado_implementacion.md` reemplaza los encabezados ambiguos con `Histórico Ciclo 3 ...` y normaliza como `DONE (histórico normalizado)` los incrementos ya absorbidos por cierres oficiales; el unico `EN_PROGRESO` factual que permanece en el documento es `8.1 Transición formal demo -> real`.
  2. `docs/90_estado_implementacion.md` aclara en la regla de lectura rapida que la cola viva se decide en `docs/roadmap_codex.md` y delega la matriz de recorridos criticos a `docs/13_testing_ci_y_quality_gate.md`.
  3. `docs/13_testing_ci_y_quality_gate.md` incorpora la seccion `12.1 Matriz compacta de recorridos críticos`, enlazando secciones publicas, herbal/ritual, checkout demo legado, recibo/email demo, cuenta demo, calendario ritual y backoffice con su ruta frontend, endpoint/backend y cobertura principal.
  4. Barrido estatico final: `ciclo3_en_progreso_hits=0`, `matriz_hits=6`, `estado_en_progreso_lineas=109`.
  5. `python scripts/check_release_readiness.py` -> `OK`.
  6. `python scripts/check_release_gate.py` -> `OK`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia logica**: `C6-UX-001`.

## C6-UX-001 - Homogeneizar microcopy comercial demo
- **Tipo**: `UX`
- **Prioridad**: `P3`
- **Estado**: `DONE`
- **Objetivo**: homogeneizar el microcopy comercial del flujo demo legado para que naming, tono y continuidad entre `/encargo` y el recibo/email demo sean coherentes con el contrato documental canonico.
- **Mapeo backlog residual**: `B06-O1`.
- **Evidencia o sintoma**:
  - la auditoria de Ciclo 6 detecta microcopy heterogeneo entre superficies del flujo demo legado.
  - la brecha es residual y de baja prioridad; no cuestiona que el recorrido ya exista ni que sea navegable.
- **Alcance permitido**: `frontend/app/encargo/page.tsx`, `frontend/componentes/catalogo/encargo/FlujoEncargoConsulta.tsx`, `frontend/componentes/catalogo/encargo/ReciboPedidoDemo.tsx`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: rediseños amplios, cambios de negocio, nuevas features o reapertura del contrato base del checkout demo.
- **Checks obligatorios**:
  - revisar consistencia de naming y tono contra el canon fijado en `C6-DOC-001`;
  - validar que no se degrada navegabilidad ni claridad del flujo demo legado;
  - registrar evidencia visual o textual minima de la homogeneizacion.
- **Criterio de cierre**: el microcopy comercial demo queda coherente con el naming canonico y sin contradicciones visibles entre inicio y cierre del recorrido.
- **Evidencia de cierre C6-UX-001**:
  1. `frontend/app/encargo/page.tsx` renombra metadata y ayudas contextuales a `checkout demo` / `pedido demo`, manteniendo la ruta `/encargo` y explicitando `sin cobro real`.
  2. `frontend/componentes/catalogo/encargo/FlujoEncargoConsulta.tsx` alinea eyebrow, `h1`, CTA principal, resumen de seleccion y mensaje de copia con el canon `checkout demo legado (/encargo)` -> `pedido demo`.
  3. `frontend/componentes/catalogo/encargo/ReciboPedidoDemo.tsx` alinea confirmacion, estados, CTA de repeticion y bloque de email demo con el mismo vocabulario y sin insinuar compra real.
  4. `Select-String -Path frontend/app/encargo/page.tsx, frontend/componentes/catalogo/encargo/FlujoEncargoConsulta.tsx, frontend/componentes/catalogo/encargo/ReciboPedidoDemo.tsx -Pattern 'Checkout demo|pedido demo|sin cobro real'` devuelve `microcopy_hits=32`.
  5. `npm run lint -- --file app/encargo/page.tsx --file componentes/catalogo/encargo/FlujoEncargoConsulta.tsx --file componentes/catalogo/encargo/ReciboPedidoDemo.tsx` -> `OK`.
  6. `npm run test:checkout-demo` -> `OK`.
  7. `python scripts/check_release_readiness.py` -> `OK`.
- **Bloqueo conocido**: ninguno.
- **Siguiente dependencia logica**: cola ejecutable vacia; revalidar `AUT-003` y `OPS-RWY-003` como bloqueos externos de go-live.

## CAT-FILT-001 - Paridad de filtros publicos multiseccion
- **Tipo**: `UX`
- **Prioridad**: `P1`
- **Estado**: `DONE`
- **Origen**: peticion explicita del mantenedor fuera de la cola autonoma; se registra en esta misma cola sin sustituir `OPS-RWY-005`.
- **Objetivo**: extender a `velas-e-incienso`, `minerales-y-energia` y `herramientas-esotericas` el mismo sistema visible de filtrado que ya usa `botica-natural`, reutilizando el contrato publico de filtros ya soportado por backend.
- **Mapeo backlog residual**: peticion explicita del mantenedor; no reabre backlog historico ni modifica la prioridad del residual de Ciclo 6.
- **Evidencia o sintoma**:
  - `frontend/app/botica-natural/page.tsx` ya parsea `searchParams`, llama `obtenerProductosPublicosPorSeccion(..., filtros)` y renderiza `PanelFiltrosBoticaNatural`.
  - `frontend/app/velas-e-incienso/page.tsx`, `frontend/app/minerales-y-energia/page.tsx` y `frontend/app/herramientas-esotericas/page.tsx` consumian el mismo helper de catalogo, pero sin rail de filtros ni propagacion de query params.
  - `backend/nucleo_herbal/presentacion/publica/views.py` y `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios.py` ya aceptan `beneficio`, `formato`, `modo_uso`, `precio_min` y `precio_max` para cualquier `seccion_publica`.
- **Alcance permitido**: `frontend/app/velas-e-incienso/page.tsx`, `frontend/app/minerales-y-energia/page.tsx`, `frontend/app/herramientas-esotericas/page.tsx`, `frontend/componentes/botica-natural/filtros/PanelFiltrosBoticaNatural.tsx`, `frontend/tests/botica-natural.test.ts`, `frontend/tests/velas-e-incienso-publico.test.ts`, `frontend/tests/minerales-y-energia-publico.test.ts`, `frontend/tests/herramientas-esotericas-publico.test.ts`, `frontend/tests/comercial-multiseccion-regresion.test.ts`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: tocar dominio/backend de filtros, inventar taxonomias nuevas, poblar `beneficio_principal`/`formato_comercial`/`modo_uso`/`precio_numerico` en seed o importacion, mezclar esta peticion con `OPS-RWY-005`.
- **Checks obligatorios**:
  - `npm run lint -- --file app/velas-e-incienso/page.tsx --file app/minerales-y-energia/page.tsx --file app/herramientas-esotericas/page.tsx --file componentes/botica-natural/filtros/PanelFiltrosBoticaNatural.tsx`
  - `npm run test:botica-natural`
  - `npm run clean:tmp-tests`
  - `npx tsc --module commonjs --target es2020 --outDir .tmp-tests tests/types/fetch-next.d.ts tests/velas-e-incienso-publico.test.ts tests/minerales-y-energia-publico.test.ts tests/herramientas-esotericas-publico.test.ts tests/comercial-multiseccion-regresion.test.ts infraestructura/api/herbal.ts contenido/home/seccionesPrincipales.ts componentes/admin/sincronizacionProductosAdmin.ts`
  - `node .tmp-tests/tests/velas-e-incienso-publico.test.js`
  - `node .tmp-tests/tests/minerales-y-energia-publico.test.js`
  - `node .tmp-tests/tests/herramientas-esotericas-publico.test.js`
  - `node .tmp-tests/tests/comercial-multiseccion-regresion.test.js`
- **Criterio de cierre**: las tres secciones publicas restantes aceptan `searchParams`, renderizan rail de filtros reutilizable, propagan filtros al helper publico y dejan regresion estatica que protege la paridad con `botica-natural`.
- **Evidencia de cierre CAT-FILT-001**:
  1. `frontend/componentes/botica-natural/filtros/PanelFiltrosBoticaNatural.tsx` deja de estar anclado a `/botica-natural` y acepta `rutaSeccion` + `textoAyuda`, manteniendo `botica-natural` como default.
  2. `frontend/app/velas-e-incienso/page.tsx`, `frontend/app/minerales-y-energia/page.tsx` y `frontend/app/herramientas-esotericas/page.tsx` parsean `searchParams`, llaman `obtenerProductosPublicosPorSeccion(<slug>, filtros)` y renderizan `botica-natural__layout-catalogo` con `PanelFiltrosBoticaNatural`.
  3. Los contratos estaticos de `frontend/tests/botica-natural.test.ts`, `frontend/tests/velas-e-incienso-publico.test.ts`, `frontend/tests/minerales-y-energia-publico.test.ts`, `frontend/tests/herramientas-esotericas-publico.test.ts` y `frontend/tests/comercial-multiseccion-regresion.test.ts` quedan actualizados y en verde.
  4. La inspeccion local de datos (`.venv\\Scripts\\python.exe manage.py shell -c ...`) confirma que el seed actual no rellena `beneficio_principal`, `formato_comercial`, `modo_uso` ni `precio_numerico`; la paridad del sistema de filtrado queda cerrada, pero la utilidad comercial plena depende de curar esos metadatos en datos reales.
- **Bloqueo conocido**: ninguno para la paridad UI/URL; queda limitacion de datos locales por seed incompleto de metadatos de filtro.
- **Siguiente dependencia logica**: `OPS-RWY-005`.

## NAV-SHELL-001 - Reordenacion de navegacion comercial y accesos de cabecera
- **Tipo**: `UX`
- **Prioridad**: `P1`
- **Estado**: `DONE`
- **Origen**: peticion explicita del mantenedor fuera de la cola autonoma; se registra en esta misma cola sin crear un backlog paralelo.
- **Objetivo**: alinear la cabecera comercial con la IA actual del proyecto: menu principal reducido, `Tienda` y `Guias` como hubs desplegables, marca en franja superior horizontal y accesos `Carrito` + `Login/Mi cuenta` fuera de la barra principal.
- **Mapeo backlog residual**: peticion explicita del mantenedor; no reabre backlog historico ni reactiva `Cuenta demo`, `Acceso` o `Encargo` como opciones de navegacion principal.
- **Evidencia o sintoma**:
  - `frontend/contenido/shell/navegacionGlobal.ts` seguia exponiendo `Colecciones`, `La Botica`, `Encargo`, `Acceso`, `Mi cuenta` y `Cuenta demo` en el nav principal, aunque ya no responden al mapa actual pedido por el mantenedor.
  - `frontend/componentes/shell/CabeceraComercial.tsx` situaba la marca a la izquierda de la barra en vez de elevarla a una cabecera superior horizontal.
  - `frontend/componentes/catalogo/cesta/VistaCestaRitual.tsx` y `frontend/componentes/catalogo/cesta/IndicadorCestaRitual.tsx` seguian hablando de `Mi seleccion` y derivaban el CTA principal al flujo legado `/encargo`.
- **Alcance permitido**: `frontend/contenido/shell/navegacionGlobal.ts`, `frontend/componentes/shell/CabeceraComercial.tsx`, `frontend/componentes/shell/NavegacionPrincipal.tsx`, `frontend/componentes/shell/AccesosCabecera.tsx`, `frontend/componentes/shell/shellComercial.module.css`, `frontend/componentes/catalogo/cesta/IndicadorCestaRitual.tsx`, `frontend/componentes/catalogo/cesta/VistaCestaRitual.tsx`, `frontend/app/cesta/page.tsx`, `frontend/app/acceso/page.tsx`, `frontend/componentes/cuenta_cliente/PanelCuentaCliente.tsx`, `frontend/tests/shell-global.test.ts`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: redisenar el contenido interno de `Guias`, reabrir auth real o backend, tocar el dominio del calendario ritual, reintroducir `Cuenta demo`/`Encargo` en la IA publica o mezclar esta peticion con bloqueos externos de go-live.
- **Checks obligatorios**:
  - `npm run lint -- --file app/acceso/page.tsx --file app/cesta/page.tsx --file componentes/catalogo/cesta/IndicadorCestaRitual.tsx --file componentes/catalogo/cesta/VistaCestaRitual.tsx --file componentes/cuenta_cliente/PanelCuentaCliente.tsx --file componentes/shell/AccesosCabecera.tsx --file componentes/shell/CabeceraComercial.tsx --file componentes/shell/NavegacionPrincipal.tsx --file contenido/shell/navegacionGlobal.ts`
  - `npm run test:shell`
  - `npm run test:cesta`
  - `npm run build`
  - verificacion visual con Playwright sobre la home publica.
- **Criterio de cierre**: la cabecera refleja la IA solicitada por el mantenedor, `Carrito` y `Login/Mi cuenta` quedan fuera del nav principal, desaparecen enlaces demo/legado de la barra y el cambio queda protegido por tests y verificacion visual.
- **Evidencia de cierre NAV-SHELL-001**:
  1. `frontend/contenido/shell/navegacionGlobal.ts` elimina `Colecciones`, `La Botica`, `Encargo`, `Acceso`, `Mi cuenta` y `Cuenta demo` del nav primario; introduce `Tienda` con submenu (`Botica`, `Velas e incienso`, `Minerales y energia`, `Herramientas esotericas`) y convierte `Guias` en hub editorial desplegable (`Compendio`, `Articulos`, `Glosario botanico`, `Propiedades de las plantas`, `Rituales`).
  2. `frontend/componentes/shell/CabeceraComercial.tsx`, `frontend/componentes/shell/NavegacionPrincipal.tsx`, `frontend/componentes/shell/AccesosCabecera.tsx` y `frontend/componentes/shell/shellComercial.module.css` reordenan la cabecera para colocar la marca arriba en horizontal y sacar `Carrito`, `Login/Mi cuenta` y `Acceso admin` fuera de la barra principal.
  3. `frontend/componentes/catalogo/cesta/IndicadorCestaRitual.tsx`, `frontend/componentes/catalogo/cesta/VistaCestaRitual.tsx` y `frontend/app/cesta/page.tsx` renombran `Mi seleccion` a `Carrito` y cambian el CTA principal a `/checkout`, eliminando el desvio visible al flujo legado `/encargo`.
  4. `frontend/app/acceso/page.tsx` pasa a titularse `Login` y `frontend/componentes/cuenta_cliente/PanelCuentaCliente.tsx` deja de exponer el acceso a `Cuenta demo`.
  5. `frontend/tests/shell-global.test.ts` cubre la nueva IA de navegacion, submenu y accesos externos de cabecera.
  6. `npm run lint -- --file app/acceso/page.tsx --file app/cesta/page.tsx --file componentes/catalogo/cesta/IndicadorCestaRitual.tsx --file componentes/catalogo/cesta/VistaCestaRitual.tsx --file componentes/cuenta_cliente/PanelCuentaCliente.tsx --file componentes/shell/AccesosCabecera.tsx --file componentes/shell/CabeceraComercial.tsx --file componentes/shell/NavegacionPrincipal.tsx --file contenido/shell/navegacionGlobal.ts` -> `OK`.
  7. `npm run test:shell` -> `OK`.
  8. `npm run test:cesta` -> `OK`.
  9. `npm run build` -> `OK`.
  10. Verificacion visual Playwright en `C:\Users\arcas\.codex\worktrees\d70a\botica_bruja_lore\frontend\.playwright-cli\page-2026-03-27T23-13-01-171Z.png`: la marca queda arriba, la barra principal queda limpia y los accesos externos aparecen fuera del nav.
- **Bloqueo conocido**: ninguno para esta peticion.
- **Siguiente dependencia logica**: cola ejecutable vacia; si no aparece una nueva peticion explicita del mantenedor, revalidar `AUT-003` y `OPS-RWY-003` como bloqueos externos sin tocar codigo de producto.

## CAL-VRT-001 - Calendario virtual mensual, seed ritual real y conexion local frontend-backend
- **Tipo**: `FEAT`
- **Prioridad**: `P0`
- **Estado**: `DONE`
- **Origen**: peticion explicita del mantenedor fuera de la cola autonoma; se registra en esta misma cola sin abrir backlog paralelo.
- **Objetivo**: completar `calendario-ritual` con una agenda mensual editable (notas por dia y rituales publicados), poblar la BBDD local con rituales reales conectados a productos reales de prueba y corregir la conexion local para que las tiendas y el calendario consuman la API operativa.
- **Mapeo backlog residual**: peticion extraordinaria del mantenedor; no reabre checkout real ni cambia el alcance de producto fijado por `docs/02_alcance_y_fases.md`.
- **Evidencia o sintoma**:
  - `frontend/componentes/calendario_ritual/CalendarioRitualEditorial.tsx` solo ofrecia una consulta por fecha y no existia agenda mensual con persistencia local.
  - la pantalla `/botica-natural` mostraba error HTTP y `calendario-ritual` no podia consumir `api/v1/rituales` ni `api/v1/calendario-ritual` desde navegador por desalineacion local y ausencia de cabeceras CORS.
  - `seed_demo_publico` no era robusto sobre la base local: con datos legacy podia romper por `UNIQUE constraint failed: nucleo_producto.slug`, lo que impedia sembrar rituales/reglas reales para pruebas.
- **Alcance permitido**: `backend/configuracion_django/settings.py`, `backend/configuracion_django/middleware_cors.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico_catalogo.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico_rituales.py`, `frontend/componentes/calendario_ritual/CalendarioRitualEditorial.tsx`, `frontend/componentes/calendario_ritual/ResumenEditorialPorFecha.tsx`, `frontend/componentes/calendario_ritual/calendarioRitualEditorial.module.css`, `frontend/contenido/calendario_ritual/calendarioVirtual.ts`, `frontend/contenido/calendario_ritual/formatoCalendarioVirtual.ts`, `frontend/infraestructura/calendario_ritual/almacenCalendarioVirtual.ts`, `frontend/package.json`, `frontend/tests/calendario-virtual.test.ts`, `tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py`, `tests/nucleo_herbal/test_contratos_api_publica_frontend.py`, `run_app.bat`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: checkout real, auth real, cambios de dominio ajenos al calendario/rituales, versionado de imagenes binarias y reordenaciones globales de navegacion no pedidas por esta peticion.
- **Checks obligatorios**:
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.infraestructura.test_seed_demo_publico_command`
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_contratos_api_publica_frontend tests.nucleo_herbal.infraestructura.test_seed_demo_publico_command`
  - `.venv\Scripts\python.exe manage.py seed_demo_publico`
  - `npm run test:calendario-ritual`
  - `npm run lint -- --file componentes/calendario_ritual/CalendarioRitualEditorial.tsx --file componentes/calendario_ritual/ResumenEditorialPorFecha.tsx --file contenido/calendario_ritual/calendarioVirtual.ts --file contenido/calendario_ritual/formatoCalendarioVirtual.ts --file infraestructura/calendario_ritual/almacenCalendarioVirtual.ts`
  - verificacion HTTP de `api/v1/herbal/secciones/botica-natural/productos/`, `api/v1/calendario-ritual/` y cabeceras CORS para `http://127.0.0.1:3000`
  - verificacion visual Playwright sobre `/botica-natural` y `/calendario-ritual`
- **Criterio de cierre**: el calendario mensual permite guardar nota + rituales publicados por dia en localStorage, la API local responde con seed real verificable, la tienda vuelve a listar productos y el calendario cliente deja de fallar por runtime/CORS.
- **Evidencia de cierre CAL-VRT-001**:
  1. `frontend/componentes/calendario_ritual/CalendarioRitualEditorial.tsx`, `frontend/componentes/calendario_ritual/ResumenEditorialPorFecha.tsx`, `frontend/componentes/calendario_ritual/calendarioRitualEditorial.module.css`, `frontend/contenido/calendario_ritual/calendarioVirtual.ts`, `frontend/contenido/calendario_ritual/formatoCalendarioVirtual.ts` y `frontend/infraestructura/calendario_ritual/almacenCalendarioVirtual.ts` convierten `calendario-ritual` en una agenda mensual navegable con seleccion de dia, nota editable, alta/baja de rituales publicados, marcadores visuales y persistencia en `localStorage`.
  2. `backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py` queda idempotente sobre bases locales con datos legacy y se divide el seed publico en `seed_demo_publico_catalogo.py` + `seed_demo_publico_rituales.py`, dejando 14 productos publicos, 5 rituales publicados y 5 reglas de calendario reales para pruebas.
  3. `backend/configuracion_django/middleware_cors.py` y `backend/configuracion_django/settings.py` habilitan CORS controlado para el frontend local (`127.0.0.1:3000`/`localhost:3000` en debug), desbloqueando los fetch cliente de `api/v1/rituales/` y `api/v1/calendario-ritual/`.
  4. `tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py`, `tests/nucleo_herbal/test_contratos_api_publica_frontend.py`, `frontend/tests/calendario-virtual.test.ts` y el script `frontend/package.json -> test:calendario-ritual` cubren el seed robusto, el contrato CORS y la logica pura del calendario virtual.
  5. `.venv\Scripts\python.exe manage.py seed_demo_publico` ya no rompe en la base local y deja `intenciones: creados=2, actualizados=2`, `plantas: creados=2, actualizados=2`, `productos: creados=0, actualizados=14`, `rituales: creados=5, actualizados=0`, `reglas_calendario: creados=5, actualizados=0`.
  6. `Invoke-WebRequest http://127.0.0.1:8010/api/v1/herbal/secciones/botica-natural/productos/` devuelve `200` con 5 productos en `botica-natural`; `Invoke-WebRequest http://127.0.0.1:8010/api/v1/calendario-ritual/?fecha=2026-03-28` devuelve `200` con 4 rituales activos; `Invoke-WebRequest ... -Headers @{ Origin = 'http://127.0.0.1:3000' }` expone `Access-Control-Allow-Origin: http://127.0.0.1:3000`.
  7. La validacion Playwright en `http://127.0.0.1:3000/botica-natural` confirma que la tienda renderiza las 5 fichas publicas; en `http://127.0.0.1:3000/calendario-ritual` confirma selector con 6 rituales publicados, 4 sugerencias editoriales activas para `2026-03-28` y persistencia local `botica_bruja_calendario_virtual_v1={"2026-03-28":{"nota":"Prueba local de agenda para cierre de marzo","rituales":["altar-lunar-cuarzo"]}}`.
- **Bloqueo conocido**: ninguno para esta peticion; persisten aparte `AUT-003` y `OPS-RWY-003` como bloqueos externos de go-live.
- **Siguiente dependencia logica**: cola ejecutable vacia; si no entra una nueva peticion explicita del mantenedor, volver a revalidar `AUT-003` y `OPS-RWY-003` sin tocar codigo de producto.

## CUENTA-001 - Alta escalonada de cuenta real, onboarding de envio y acceso con Google
- **Tipo**: `FEAT`
- **Prioridad**: `P0`
- **Estado**: `DONE`
- **Origen**: peticion explicita del mantenedor fuera de la cola autonoma; se registra en esta misma cola sin abrir backlog paralelo.
- **Objetivo**: permitir alta real en dos pasos (credenciales y despues datos de envio opcionales), mantener la recuperacion de password funcional y anadir alta/login con Google sobre la misma `CuentaCliente`, exigiendo completar datos de envio/contacto cuando falten al iniciar una compra.
- **Mapeo backlog residual**: peticion extraordinaria del mantenedor; no reabre `CuentaDemo`, no altera el roadmap autonomo `AUT-006` y no introduce SMS de terceros sin soporte/coste validado.
- **Evidencia o sintoma**:
  - `/registro` solo cerraba el alta por email/password sin un onboarding explicito hacia datos de envio opcionales.
  - no existia alta/login con Google para `CuentaCliente`.
  - el backend ya soportaba libreta de direcciones, pero el proxy Next de `/api/cuenta/[...ruta]` no reenviaba `PUT` ni `DELETE`, rompiendo actualizacion/eliminacion desde frontend.
  - la peticion pide recuperacion funcional y pregunta por SMS; en produccion eso depende de proveedor externo con coste y no existe evidencia local de un canal gratuito/fiable equivalente.
- **Alcance permitido**: `backend/configuracion_django/settings.py`, `backend/nucleo_herbal/aplicacion/dto.py`, `backend/nucleo_herbal/aplicacion/casos_de_uso_google_cuenta_cliente.py`, `backend/nucleo_herbal/aplicacion/puertos/repositorios_cuentas_cliente.py`, `backend/nucleo_herbal/aplicacion/puertos/verificador_google_identity.py`, `backend/nucleo_herbal/infraestructura/google_identity.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/models.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_cuentas_cliente.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/migrations/0037_cuenta_cliente_google_sub.py`, `backend/nucleo_herbal/presentacion/publica/dependencias.py`, `backend/nucleo_herbal/presentacion/publica/urls_cuentas_cliente.py`, `backend/nucleo_herbal/presentacion/publica/views_cuentas_cliente.py`, `frontend/.env.example`, `.env.railway.example`, `frontend/app/api/cuenta/[...ruta]/route.ts`, `frontend/app/mi-cuenta/direcciones/page.tsx`, `frontend/componentes/cuenta_cliente/FormularioCuentaCliente.tsx`, `frontend/componentes/cuenta_cliente/BotonGoogleCuentaCliente.tsx`, `frontend/componentes/cuenta_cliente/PanelDireccionesCuentaCliente.tsx`, `frontend/contenido/cuenta_cliente/rutasCuentaCliente.ts`, `frontend/infraestructura/api/cuentasCliente.ts`, `frontend/contenido/catalogo/checkoutRealDirecciones.ts`, `tests/nucleo_herbal/test_api_cuentas_cliente.py`, `tests/nucleo_herbal/test_casos_de_uso_google_cuenta_cliente.py`, `frontend/tests/cuenta-cliente.test.ts`, `frontend/tests/cuenta-cliente-proxy.test.ts`, `frontend/tests/checkout-real.test.ts`, `docs/roadmap_codex.md`, `docs/bitacora_codex.md`.
- **Fuera de alcance**: recuperacion por SMS con proveedor externo de pago, federacion distinta de Google, reordenaciones globales de shell ajenas a cuenta, cambios sobre backlog autonomo no relacionados y cualquier flujo de compra fuera de exigir datos pendientes en checkout real.
- **Checks obligatorios**:
  - `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_api_cuentas_cliente tests.nucleo_herbal.test_casos_de_uso_google_cuenta_cliente backend.nucleo_herbal.presentacion.tests.test_cuenta_cliente_direcciones`
  - `.venv\Scripts\python.exe manage.py makemigrations --check --dry-run`
  - `npm run test:cuenta-cliente`
  - `npm run test:cuenta-proxy`
  - `npm run test:checkout-real`
  - `npm run lint -- --file app/mi-cuenta/direcciones/page.tsx --file app/api/cuenta/[...ruta]/route.ts --file componentes/cuenta_cliente/FormularioCuentaCliente.tsx --file componentes/cuenta_cliente/PanelDireccionesCuentaCliente.tsx --file componentes/cuenta_cliente/BotonGoogleCuentaCliente.tsx --file contenido/cuenta_cliente/rutasCuentaCliente.ts --file infraestructura/api/cuentasCliente.ts --file contenido/catalogo/checkoutRealDirecciones.ts`
- **Criterio de cierre**: el alta real puede derivar a onboarding opcional de envio, Google crea o vincula la misma cuenta canonica con sesion real, la recuperacion por email sigue en verde y checkout real exige o precarga los datos de envio/contacto segun exista libreta.
- **Evidencia de cierre CUENTA-001**:
  1. `backend/nucleo_herbal/aplicacion/casos_de_uso_google_cuenta_cliente.py`, `backend/nucleo_herbal/aplicacion/puertos/verificador_google_identity.py`, `backend/nucleo_herbal/infraestructura/google_identity.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/models.py`, `backend/nucleo_herbal/infraestructura/persistencia_django/repositorios_cuentas_cliente.py` y la migracion `0037_cuenta_cliente_google_sub.py` anaden verificacion Google server-side, campo `google_sub`, enlace por email existente y creacion de cuenta nueva sin abrir un segundo sistema de identidad.
  2. `backend/nucleo_herbal/presentacion/publica/views_cuentas_cliente.py`, `backend/nucleo_herbal/presentacion/publica/urls_cuentas_cliente.py` y `backend/nucleo_herbal/presentacion/publica/dependencias.py` exponen `POST /api/v1/cuenta/google/`, inician sesion real y devuelven `es_nueva_cuenta`; `tests/nucleo_herbal/test_api_cuentas_cliente.py` y `tests/nucleo_herbal/test_casos_de_uso_google_cuenta_cliente.py` cubren alta nueva, vinculacion por email y rechazo de email Google no verificado.
  3. `frontend/componentes/cuenta_cliente/FormularioCuentaCliente.tsx`, `frontend/componentes/cuenta_cliente/BotonGoogleCuentaCliente.tsx`, `frontend/contenido/cuenta_cliente/rutasCuentaCliente.ts` y `frontend/infraestructura/api/cuentasCliente.ts` anaden CTA de Google y redirigen el alta nueva al onboarding opcional `?onboarding=1`, manteniendo `/acceso` como login real y dejando la recuperacion por email intacta.
  4. `frontend/componentes/cuenta_cliente/PanelDireccionesCuentaCliente.tsx`, `frontend/app/mi-cuenta/direcciones/page.tsx`, `frontend/contenido/catalogo/checkoutRealDirecciones.ts` y `frontend/app/api/cuenta/[...ruta]/route.ts` reutilizan la libreta como onboarding omisible, permiten actualizar/eliminar direcciones por proxy y hacen que checkout real copie telefono/nombre de contacto desde la direccion guardada cuando procede.
  5. La decision de no implementar SMS queda cerrada en este alcance: la recuperacion funcional sigue siendo por email y no se integra SMS porque el canal fiable de produccion depende de proveedor externo con coste, fuera del perimetro aprobado de esta corrida.
- **Bloqueo conocido**: ninguno para esta peticion; persisten aparte `AUT-003` y `OPS-RWY-003` como bloqueos externos y `AUT-006` como primera `TODO` no `BLOCKED` del roadmap autonomo.
- **Siguiente dependencia logica**: terminada esta peticion extraordinaria, la cola autonoma vuelve a `AUT-006`; no procede tocar auth/cuenta fuera de este perimetro salvo nueva peticion explicita.

## Radar de cola actual
- **Actualizacion radar UTC**: `2026-03-28T11:28:51Z` (`AUT-006`); `python -m unittest tests.scripts.test_check_bootstrap_demo_expected_counts` -> `OK`, `python manage.py test tests.scripts` -> `OK`, `python scripts/check_release_readiness.py` -> `OK` y `python scripts/check_release_gate.py` -> `OK`. No quedan tareas `TODO` no `BLOCKED`; la cola vuelve a estado de cola vacia / backlog totalmente bloqueado.
- **Estado de cola actual**: sin `TODO` no `BLOCKED`; permanecen `AUT-003` y `OPS-RWY-003` como bloqueos externos vigentes.
- **Consistencia documental actual**: `docs/90_estado_implementacion.md` vuelve a quedar alineado con la cola efectiva al desaparecer la deuda local que había reabierto `AUT-006`.
- **Siguiente accion exacta actual**: aportar `BACKEND_BASE_URL`, `FRONTEND_BASE_URL`, `DATABASE_URL` y `BOTICA_RESTORE_DATABASE_URL` reales, mas un dump permitido y una base temporal segura fuera de produccion, y reejecutar `python scripts/check_deployed_stack.py`, `python scripts/backup_restore_postgres.py backup` y `python scripts/backup_restore_postgres.py restore-drill --dump-file <dump real>`.
- **Actualizacion radar UTC**: `2026-03-28T08:43:57Z` (`RADAR-SAN-002`); `AUT-006` sigue siendo la primera `TODO` no `BLOCKED` real porque `python scripts/check_release_gate.py` continua fallando en `C4)` con `AssertionError: 4 != 2`, mientras `python scripts/check_release_readiness.py` sigue en `OK`.
- **Contradiccion detectada**: `docs/90_estado_implementacion.md` sigue describiendo cola autonoma agotada y siguiente paso externo (`AUT-003`/`OPS-RWY-003`), pero la evidencia ejecutada hoy mantiene una deuda local verificable en `AUT-006`; la correccion de `docs/90_estado_implementacion.md` queda fuera del perimetro permitido de esta corrida.
- **Bloqueo externo revalidado**: `BACKEND_BASE_URL`, `FRONTEND_BASE_URL`, `DATABASE_URL` y `BOTICA_RESTORE_DATABASE_URL` siguen ausentes; por tanto `python scripts/check_deployed_stack.py`, `python scripts/backup_restore_postgres.py backup --dry-run --backup-dir "$env:TEMP\\botica_backups"` y `python scripts/backup_restore_postgres.py restore-drill --dry-run --dump-file C:\nope\missing.dump` siguen fallando por configuracion ausente y no procede tratar `AUT-003` como siguiente paso efectivo.
- **Siguiente accion exacta actual**: ejecutar `AUT-006` y solo despues volver a revalidar `AUT-003`.
- **Actualizacion adicional 2026-03-28T10:36:18Z**: por peticion explicita del mantenedor se ejecuta y cierra `CUENTA-001` para anadir alta/login con Google, onboarding opcional de datos de envio tras el alta real y mantener la recuperacion por email en verde, corrigiendo ademas el proxy Next de direcciones (`PUT`/`DELETE`). Terminada la peticion extraordinaria, la primera `TODO` no `BLOCKED` vuelve a ser `AUT-006`.
- **Actualizacion adicional 2026-03-28T00:32:14Z**: por peticion explicita del mantenedor se ejecuta y cierra `CAL-VRT-001` para completar el calendario virtual mensual, sembrar rituales/productos reales de prueba y corregir la conexion local tienda/calendario con CORS controlado. Terminada la peticion extraordinaria, la cola vuelve a estado vacio / backlog totalmente bloqueado.
- **Verificacion adicional de calendario virtual y catalogo local**:
  1. `.venv\Scripts\python.exe manage.py test tests.nucleo_herbal.test_contratos_api_publica_frontend tests.nucleo_herbal.infraestructura.test_seed_demo_publico_command` devuelve `OK`.
  2. `.venv\Scripts\python.exe manage.py seed_demo_publico` devuelve `OK` y crea/actualiza 14 productos, 5 rituales y 5 reglas del calendario en la base local.
  3. `npm run test:calendario-ritual` devuelve `OK`.
  4. `npm run lint -- --file componentes/calendario_ritual/CalendarioRitualEditorial.tsx --file componentes/calendario_ritual/ResumenEditorialPorFecha.tsx --file contenido/calendario_ritual/calendarioVirtual.ts --file contenido/calendario_ritual/formatoCalendarioVirtual.ts --file infraestructura/calendario_ritual/almacenCalendarioVirtual.ts` devuelve `OK`.
  5. `Invoke-WebRequest http://127.0.0.1:8010/api/v1/herbal/secciones/botica-natural/productos/` devuelve `200` con 5 productos y `Invoke-WebRequest http://127.0.0.1:8010/api/v1/calendario-ritual/?fecha=2026-03-28` devuelve `200` con 4 rituales activos.
  6. `Invoke-WebRequest http://127.0.0.1:8010/api/v1/rituales/ -Headers @{ Origin = 'http://127.0.0.1:3000' }` devuelve `Access-Control-Allow-Origin: http://127.0.0.1:3000`.
  7. La verificacion Playwright confirma que `/botica-natural` ya renderiza producto publico y que `/calendario-ritual` guarda una nota local con un ritual anadido, dejando persistencia en `localStorage`.
- **Actualizacion adicional 2026-03-27T23:19:04Z**: por peticion explicita del mantenedor se ejecuta y cierra `NAV-SHELL-001` para reordenar la cabecera publica: `Tienda` y `Guias` pasan a ser hubs desplegables, `Carrito` y `Login/Mi cuenta` salen de la barra principal, desaparecen `Colecciones`/`La Botica`/`Encargo`/`Acceso`/`Cuenta demo` del nav y la marca sube a una franja superior horizontal. Terminada la peticion extraordinaria, la cola vuelve a estado vacio / backlog totalmente bloqueado.
- **Verificacion adicional de navegacion**:
  1. `npm run lint -- --file app/acceso/page.tsx --file app/cesta/page.tsx --file componentes/catalogo/cesta/IndicadorCestaRitual.tsx --file componentes/catalogo/cesta/VistaCestaRitual.tsx --file componentes/cuenta_cliente/PanelCuentaCliente.tsx --file componentes/shell/AccesosCabecera.tsx --file componentes/shell/CabeceraComercial.tsx --file componentes/shell/NavegacionPrincipal.tsx --file contenido/shell/navegacionGlobal.ts` devuelve `OK`.
  2. `npm run test:shell` devuelve `OK`.
  3. `npm run test:cesta` devuelve `OK`.
  4. `npm run build` devuelve `OK`.
  5. La captura Playwright `frontend/.playwright-cli/page-2026-03-27T23-13-01-171Z.png` confirma visualmente la nueva jerarquia de cabecera.
- **Actualizacion adicional 2026-03-27T17:15:00Z**: por peticion explicita del mantenedor se ejecuta y cierra `CAT-FILT-001` para igualar el rail de filtros publico en `velas-e-incienso`, `minerales-y-energia` y `herramientas-esotericas`; terminada esa peticion extraordinaria, la primera `TODO` no `BLOCKED` vuelve a ser `OPS-RWY-005`.
- **Verificacion adicional de filtros multiseccion**:
  1. `npm run lint -- --file app/velas-e-incienso/page.tsx --file app/minerales-y-energia/page.tsx --file app/herramientas-esotericas/page.tsx --file componentes/botica-natural/filtros/PanelFiltrosBoticaNatural.tsx` devuelve `OK`.
  2. `npm run test:botica-natural` devuelve `OK`.
  3. El bloque estatico `velas/minerales/herramientas/comercial-multiseccion` compilado con `tests/types/fetch-next.d.ts` devuelve `OK`.
  4. La inspeccion local de `ProductoModelo` confirma limitacion de datos: los productos demo publicados de las cuatro secciones siguen con `beneficio_principal=''`, `formato_comercial=''`, `modo_uso=''` y `precio_numerico=None`.
- **Nota launcher local**: `LOCAL-LAUNCH-001`, `LOCAL-LAUNCH-002` y `LOCAL-LAUNCH-003` quedan en `DONE`; `run_app.bat` permanece como unico launcher canonico y la cola ejecutable vuelve al residual oficial de Ciclo 6.
- **Actualizacion radar UTC**: `2026-03-27T20:19:42Z`; `C6-TRACE-001` queda en `DONE` tras normalizar el historico ambiguo de `docs/90_estado_implementacion.md` y añadir la matriz compacta de recorridos criticos en `docs/13_testing_ci_y_quality_gate.md`.
- **Fecha de revision**: `2026-03-27`
- **Diagnostico**: el producto/go-live sigue bloqueado externamente segun `docs/90_estado_implementacion.md`, pero el residual local de Ciclo 6 sigue cerrando brechas sin deuda nueva. Tras cerrar `C6-TRACE-001`, la primera `TODO` no `BLOCKED` pasa a ser `C6-UX-001`.
- **Verificacion aplicada**:
  1. `Select-String` final sobre `docs/90_estado_implementacion.md` devuelve `ciclo3_en_progreso_hits=0` y deja `estado_en_progreso_lineas=109`, reservando `EN_PROGRESO` solo para `8.1 Transición formal demo -> real`.
  2. `Select-String` sobre `docs/13_testing_ci_y_quality_gate.md` devuelve `matriz_hits=6`, confirmando la presencia de la matriz compacta y de sus filas clave.
  3. `python scripts/check_release_readiness.py` devuelve `OK`.
  4. `python scripts/check_release_gate.py` devuelve `OK`.
  5. `AUT-003` y `OPS-RWY-003` siguen `BLOCKED`: el smoke real mantiene `404` del backend desplegado y el restore drill sigue sin `BOTICA_RESTORE_DATABASE_URL` ni entorno temporal seguro.
- **Estado de cola**: la primera `TODO` no `BLOCKED` pasa a ser `C6-UX-001`; detras siguen `AUT-003` y `OPS-RWY-003` como bloqueos externos separados.
- **Siguiente accion exacta**: ejecutar `C6-UX-001` para homogeneizar el microcopy comercial demo entre `/encargo` y el recibo/email demo contra el canon ya fijado.
- **Actualizacion radar UTC**: `2026-03-27T20:39:04Z`; `C6-UX-001` queda en `DONE` tras homogeneizar el microcopy comercial demo entre `/encargo` y el recibo/email demo sin tocar contratos ni logica.
- **Diagnostico actual**: el producto/go-live sigue bloqueado externamente segun `docs/90_estado_implementacion.md` y, tras cerrar `C6-UX-001`, ya no quedan tareas `TODO` no `BLOCKED` en esta cola. El estado correcto pasa a ser cola ejecutable vacia / backlog totalmente bloqueado por dependencias externas.
- **Verificacion aplicada adicional**:
  1. `Select-String -Path frontend/app/encargo/page.tsx, frontend/componentes/catalogo/encargo/FlujoEncargoConsulta.tsx, frontend/componentes/catalogo/encargo/ReciboPedidoDemo.tsx -Pattern 'Checkout demo|pedido demo|sin cobro real'` devuelve `microcopy_hits=32`.
  2. `npm run lint -- --file app/encargo/page.tsx --file componentes/catalogo/encargo/FlujoEncargoConsulta.tsx --file componentes/catalogo/encargo/ReciboPedidoDemo.tsx` devuelve `OK`.
  3. `npm run test:checkout-demo` devuelve `OK`.
  4. `python scripts/check_release_readiness.py` devuelve `OK`.
  5. `AUT-003` y `OPS-RWY-003` siguen `BLOCKED`: el smoke real mantiene `404` del backend desplegado y el restore drill sigue sin `BOTICA_RESTORE_DATABASE_URL` ni entorno temporal seguro.
- **Estado de cola actual**: cola ejecutable vacia / backlog totalmente bloqueado; ya no existe ninguna `TODO` no `BLOCKED` tras cerrar `C6-UX-001`.
- **Siguiente accion exacta actual**: revalidar `AUT-003` comprobando si ya existen `BACKEND_BASE_URL`, `FRONTEND_BASE_URL`, `DATABASE_URL`, `BOTICA_RESTORE_DATABASE_URL` y entorno temporal seguro para restore drill; si siguen ausentes, mantener el bloqueo exacto sin tocar codigo de producto.
- **Actualizacion radar UTC**: `2026-03-27T23:33:34Z`; se revalida `AUT-003` y el bloqueo externo sigue intacto en este runner.
- **Verificacion aplicada adicional**:
  1. `python scripts/check_deployed_stack.py` devuelve `ERROR`: `La variable obligatoria BACKEND_BASE_URL no esta definida.`
  2. La comprobacion de entorno devuelve `BACKEND_BASE_URL=MISSING`, `FRONTEND_BASE_URL=MISSING`, `DATABASE_URL=MISSING` y `BOTICA_RESTORE_DATABASE_URL=MISSING`.
  3. `python scripts/backup_restore_postgres.py backup --dry-run` devuelve `[ERROR] Debes definir --database-url o DATABASE_URL.`
  4. `python scripts/backup_restore_postgres.py restore-drill --dry-run --dump-file C:\nope\missing.dump` devuelve `[ERROR] Debes definir --restore-database-url o BOTICA_RESTORE_DATABASE_URL.`
  5. `python scripts/check_release_readiness.py` devuelve `OK`.
- **Diagnostico actual**: la cola ejecutable sigue vacia / backlog totalmente bloqueado. `AUT-003` no puede revalidarse contra entorno desplegado porque faltan las variables minimas para arrancar el smoke y el backup/restore; `OPS-RWY-003` sigue sin acceso externo verificable a Railway UI/logs.
- **Estado de cola actual**: sin `TODO` no `BLOCKED`; permanecen `AUT-003` y `OPS-RWY-003` como bloqueos externos vigentes.
- **Siguiente accion exacta actual**: aportar `BACKEND_BASE_URL`, `FRONTEND_BASE_URL`, `DATABASE_URL` y `BOTICA_RESTORE_DATABASE_URL` reales, mas un dump permitido y una base temporal segura fuera de produccion, y reejecutar `python scripts/check_deployed_stack.py`, `python scripts/backup_restore_postgres.py backup` y `python scripts/backup_restore_postgres.py restore-drill --dump-file <dump real>`.
- **Actualizacion adicional 2026-03-27T23:36:48Z**: por peticion explicita del mantenedor se ejecuta y cierra `LOCAL-LAUNCH-004` para endurecer `run_app.bat` contra listeners residuales: ahora reutiliza `3000/8000` cuando pertenecen a este worktree y corta con mensaje explicito cuando el puerto lo ocupa un proceso ajeno. Terminada esta peticion extraordinaria, la cola vuelve a estado vacio / backlog totalmente bloqueado.
- **Verificacion adicional del launcher**:
  1. `Get-NetTCPConnection` + `Get-CimInstance Win32_Process` reprodujeron el escenario real: `3000` estaba ocupado por un `next dev` residual del propio repo y `8000` podia quedar ocupado por un `runserver` ajeno.
  2. `cmd /c run_app.bat` con `8000` ajeno ocupado devuelve error explicito de puerto ajeno en vez de relanzar procesos a ciegas.
  3. `cmd /c "set BOTICA_NO_BROWSER=1&& run_app.bat"` con servicios del propio repo ya activos devuelve `Se reutiliza` para backend y frontend, sin volver a disparar `EADDRINUSE`.
  4. `Invoke-WebRequest http://127.0.0.1:3000/ -UseBasicParsing` devuelve `200` tras la reutilizacion.
- **Actualizacion radar UTC**: `2026-03-27T23:54:36Z`; se revalida `AUT-003` sin nueva capacidad ejecutable local: el gate tecnico canonico sigue en `OK`, pero el smoke/backup-restore real continua bloqueado por entorno externo ausente.
- **Verificacion aplicada adicional**:
  1. La comprobacion de entorno vuelve a devolver `BACKEND_BASE_URL=MISSING`, `FRONTEND_BASE_URL=MISSING`, `DATABASE_URL=MISSING` y `BOTICA_RESTORE_DATABASE_URL=MISSING`.
  2. `python scripts/check_deployed_stack.py` devuelve `ERROR`: `La variable obligatoria BACKEND_BASE_URL no esta definida.`
  3. `python scripts/backup_restore_postgres.py backup --dry-run` devuelve `[ERROR] Debes definir --database-url o DATABASE_URL.`
  4. `python scripts/backup_restore_postgres.py restore-drill --dry-run --dump-file C:\nope\missing.dump` devuelve `[ERROR] Debes definir --restore-database-url o BOTICA_RESTORE_DATABASE_URL.`
  5. `python scripts/check_release_readiness.py` devuelve `OK`.
  6. `python scripts/check_release_gate.py` devuelve `OK`.
- **Diagnostico actual**: el repo sigue sano localmente para gate/readiness, pero la cola ejecutable permanece vacia / backlog totalmente bloqueado. `AUT-003` sigue sin poder validar smoke post-deploy ni backup/restore por ausencia de variables reales y de una base temporal segura; `OPS-RWY-003` sigue dependiendo de acceso externo verificable a Railway UI/logs.
- **Estado de cola actual**: sin `TODO` no `BLOCKED`; permanecen `AUT-003` y `OPS-RWY-003` como bloqueos externos vigentes.
- **Siguiente accion exacta actual**: aportar `BACKEND_BASE_URL`, `FRONTEND_BASE_URL`, `DATABASE_URL` y `BOTICA_RESTORE_DATABASE_URL` reales, mas un dump permitido y una base temporal segura fuera de produccion, y reejecutar `python scripts/check_deployed_stack.py`, `python scripts/backup_restore_postgres.py backup` y `python scripts/backup_restore_postgres.py restore-drill --dump-file <dump real>`.
- **Actualizacion radar UTC**: `2026-03-28T00:13:27Z`; se revalida `AUT-003` sin evidencia nueva de desbloqueo: el gate tecnico canonico y el readiness siguen en `OK`, pero el smoke/backup-restore real continua bloqueado por entorno externo ausente.
- **Verificacion aplicada adicional**:
  1. La comprobacion de entorno vuelve a devolver `BACKEND_BASE_URL=MISSING`, `FRONTEND_BASE_URL=MISSING`, `DATABASE_URL=MISSING` y `BOTICA_RESTORE_DATABASE_URL=MISSING`.
  2. `python scripts/check_deployed_stack.py` devuelve `ERROR`: `La variable obligatoria BACKEND_BASE_URL no esta definida.`
  3. `python scripts/backup_restore_postgres.py backup --dry-run --backup-dir "$env:TEMP\\botica_backups"` devuelve `[ERROR] Debes definir --database-url o DATABASE_URL.`
  4. `python scripts/backup_restore_postgres.py restore-drill --dry-run --dump-file C:\nope\missing.dump` devuelve `[ERROR] Debes definir --restore-database-url o BOTICA_RESTORE_DATABASE_URL.`
  5. `python scripts/check_release_readiness.py` devuelve `OK`.
  6. `python scripts/check_release_gate.py` devuelve `OK`.
- **Diagnostico actual**: el repo sigue sano localmente para gate/readiness y no aparece deuda nueva de producto, pero `AUT-003` no puede avanzar porque el runner sigue sin `BACKEND_BASE_URL`, `FRONTEND_BASE_URL`, `DATABASE_URL` ni `BOTICA_RESTORE_DATABASE_URL`; `OPS-RWY-003` sigue dependiendo de acceso externo verificable a Railway UI/logs.
- **Estado de cola actual**: sin `TODO` no `BLOCKED`; permanecen `AUT-003` y `OPS-RWY-003` como bloqueos externos vigentes.
- **Siguiente accion exacta actual**: aportar `BACKEND_BASE_URL`, `FRONTEND_BASE_URL`, `DATABASE_URL` y `BOTICA_RESTORE_DATABASE_URL` reales, mas un dump permitido y una base temporal segura fuera de produccion, y reejecutar `python scripts/check_deployed_stack.py`, `python scripts/backup_restore_postgres.py backup` y `python scripts/backup_restore_postgres.py restore-drill --dump-file <dump real>`.
- **Actualizacion radar UTC**: `2026-03-28T00:35:08Z`; la revalidacion obligatoria de `AUT-003` detecta un cambio real de prioridad: el gate canónico local ya no está en verde y deja de ser correcto describir la cola como vacía / totalmente bloqueada solo por entorno externo.
- **Verificacion aplicada adicional**:
  1. `python scripts/check_release_gate.py` devuelve `ERROR` en `C4) Test scripts operativos críticos` por `tests.scripts.test_check_bootstrap_demo_expected_counts.CheckBootstrapDemoExpectedCountsTests.test_calcular_conteos_esperados_desde_seed_canonico`, con `AssertionError: 4 != 2`.
  2. `git diff -- backend/nucleo_herbal/infraestructura/persistencia_django/management/commands/seed_demo_publico.py tests/nucleo_herbal/infraestructura/test_seed_demo_publico_command.py` confirma que el seed canónico vigente ya sostiene `4` intenciones públicas, `4` plantas publicadas, `14` productos, `5` rituales y `5` reglas de calendario activas.
  3. La comprobacion de entorno sigue devolviendo `BACKEND_BASE_URL=MISSING`, `FRONTEND_BASE_URL=MISSING`, `DATABASE_URL=MISSING` y `BOTICA_RESTORE_DATABASE_URL=MISSING`.
  4. `python scripts/check_deployed_stack.py` sigue devolviendo `ERROR`: `La variable obligatoria BACKEND_BASE_URL no esta definida.`
  5. `python scripts/backup_restore_postgres.py backup --dry-run --backup-dir "$env:TEMP\\botica_backups"` y `python scripts/backup_restore_postgres.py restore-drill --dry-run --dump-file C:\nope\missing.dump` siguen fallando por ausencia de `DATABASE_URL` y `BOTICA_RESTORE_DATABASE_URL`.
  6. `python scripts/check_release_readiness.py` devuelve `OK`.
- **Diagnostico actual**: la prioridad real cambia de “solo bloqueo externo” a “regresion local del gate + bloqueos externos pendientes”. Mientras `AUT-006` no recupere `C4)` del gate, no procede seguir tratando `AUT-003` como siguiente paso efectivo.
- **Estado de cola actual**: la primera `TODO` no `BLOCKED` pasa a ser `AUT-006`; `AUT-003` y `OPS-RWY-003` permanecen `BLOCKED` por dependencias externas.
- **Siguiente accion exacta actual**: ejecutar `AUT-006` ajustando `scripts/check_bootstrap_demo_expected_counts.py` y/o `tests/scripts/test_check_bootstrap_demo_expected_counts.py` al seed canónico expandido, rerun de `python manage.py test tests.scripts` y `python scripts/check_release_gate.py`, y solo despues volver a revalidar `AUT-003`.
